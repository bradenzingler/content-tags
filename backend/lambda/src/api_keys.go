package main

import (
	"context"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

const API_KEYS_TABLE = "content-tags-api-keys"
const DEFAULT_RATE_LIMIT = 10
const USAGE_COST_PER_REQUEST = 1

var (
	ddbClient *dynamodb.Client
	ddbOnce   sync.Once
)

func init() {
	ddbOnce.Do(func() {
		cfg, err := config.LoadDefaultConfig(context.Background())
		if err != nil {
			fmt.Printf("Error loading AWS config: %v\n", err)
			return
		}

		ddbClient = dynamodb.NewFromConfig(cfg)
	})
}

// ApiKeyInfo represents an API key's information and usage
type ApiKeyInfo struct {
	Key           string
	UserID        string
	RateLimit     int // Maximum requests per minute
	TotalUsage    int // Total usage count
	LastUsed      int64
	RequestCounts []time.Time // For rate limiting
	NextRefill    time.Time
	Tier          string // free, startup, scale, etc.
	Active        bool
	sync.Mutex
}

func getApiKeyFromHeaders(req events.APIGatewayProxyRequest) (string, error) {
	headers := req.Headers

	if headers == nil {
		return "", fmt.Errorf("missing authorization header")
	}

	authorizationHeader := headers["authorization"]
	if authorizationHeader == "" {
		authorizationHeader = headers["Authorization"]
		if authorizationHeader == "" {
			return "", fmt.Errorf("missing authorization header")
		}
	}

	hasBearerInAuthorizationHeader := strings.HasPrefix(authorizationHeader, "Bearer ") || strings.HasPrefix(authorizationHeader, "bearer ")

	if !hasBearerInAuthorizationHeader {
		return "", fmt.Errorf("invalid authorization header format. Expected Bearer <api key>")
	}

	var apiKey = ""
	if strings.HasPrefix(authorizationHeader, "Bearer ") {
		apiKey = strings.TrimPrefix(authorizationHeader, "Bearer ")
	} else if strings.HasPrefix(authorizationHeader, "bearer ") {
		apiKey = strings.TrimPrefix(authorizationHeader, "bearer ")
	} else {
		return "", fmt.Errorf("missing api key in authorization header")
	}

	return apiKey, nil
}

func isValidApiKey(ctx context.Context, apiKey string) (isValid bool, key *ApiKeyInfo, status int, errorMsg error) {
	if ddbClient == nil {
		log.Printf("ERROR - failed to initialize DDB client, was null inside isValidApiKey")
		return false,
			nil,
			500,
			fmt.Errorf("sorry, an unexpected error occurred. you have not been charged for this request. please try again later")
	}

	keyInfo, exists := getKeyFromApiKeyCache(apiKey)
	if exists && keyInfo != nil {
		// If the key is in the cache, verify it still exists in the database
		// This handles cases where a key has been regenerated but still exists in the cache
		exists, err := keyExistsInDB(ctx, apiKey)
		if err != nil {
			log.Printf("ERROR - failed to verify if key exists in DB, error=%s", err.Error())
			return false, nil, 500, fmt.Errorf("internal server error. you will not be charged for this request")
		}

		if !exists {
			// Key was in cache but no longer in DB (was probably regenerated)
			// Remove it from cache and treat as non-existent
			removeKeyFromCache(apiKey)
			keyInfo = nil
			exists = false
			log.Printf("INFO - key %s found in cache but not in DB, removing from cache", apiKey)
		}
	}

	if !exists || keyInfo == nil {
		loadedKeyInfo, statusCode, err := loadApiKeyFromDB(ctx, apiKey)
		if err != nil {
			log.Printf("ERROR - failed to load key from DB, error=%s", err.Error())
			return false, nil, statusCode, err
		}
		keyInfo = loadedKeyInfo
		saveKeyToApiKeyCache(keyInfo, apiKey)
	}

	if keyInfo == nil {
		fmt.Printf("The api key info was null after checking the cache and loading from the ddb table")
		return false, nil, 500, fmt.Errorf("sorry, an unexpected error occurred. you have not been charged for this request")
	}

	keyInfo.Lock()
	defer keyInfo.Unlock()

	// Check if key is active
	if !keyInfo.Active {
		return false, nil, 401, fmt.Errorf("api key is not active")
	}

	// Check if we need to reset usage based on next_refill
	now := time.Now()
	if !keyInfo.NextRefill.IsZero() && now.After(keyInfo.NextRefill) {
		// Reset usage and set new refill date
		nextRefill := now.AddDate(0, 1, 0) // 1 month from now
		keyInfo.NextRefill = nextRefill
		keyInfo.TotalUsage = 0

		// Asynchronously update the next refill date and reset usage in DB
		go resetUsageInDB(ctx, apiKey, nextRefill)
	}

	// Rate limit check
	oneMinuteAgo := now.Add(-1 * time.Minute)

	// Keep only requests from the last minute
	recentRequests := []time.Time{}
	for _, t := range keyInfo.RequestCounts {
		if t.After(oneMinuteAgo) {
			recentRequests = append(recentRequests, t)
		}
	}
	keyInfo.RequestCounts = recentRequests

	// Check rate limit
	if len(keyInfo.RequestCounts) >= keyInfo.RateLimit {
		return false, nil, 429, fmt.Errorf("rate limit exceeded")
	}

	// Update usage tracking
	keyInfo.TotalUsage += USAGE_COST_PER_REQUEST
	keyInfo.LastUsed = now.Unix()
	keyInfo.RequestCounts = append(keyInfo.RequestCounts, now)

	// Asynchronously update the database
	go updateApiKeyUsageInDB(context.Background(), apiKey, USAGE_COST_PER_REQUEST, keyInfo.RequestCounts)

	return true, keyInfo, 200, nil
}

func loadApiKeyFromDB(ctx context.Context, apiKey string) (key *ApiKeyInfo, status int, errorMsg error) {
	// Query DynamoDB for the API key
	result, err := ddbClient.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(API_KEYS_TABLE),
		Key: map[string]types.AttributeValue{
			"api_key": &types.AttributeValueMemberS{Value: apiKey},
		},
	})

	if err != nil {
		log.Printf("ERROR - failed to get the API key from DDB. Error=%s", err.Error())
		return nil, 500, fmt.Errorf("internal server error. you will not be charged for this request")
	}

	if result.Item == nil {
		return nil, 401, fmt.Errorf("api key is invalid")
	}

	// Initialize the key info with default values
	keyInfo := &ApiKeyInfo{
		Key:           apiKey,
		RequestCounts: make([]time.Time, 0),
		LastUsed:      time.Now().Unix(),
		Active:        true,
		RateLimit:     DEFAULT_RATE_LIMIT,
		Tier:          "free",
		NextRefill:    time.Now().AddDate(0, 1, 0), // Default to 1 month from now
	}

	if v, ok := result.Item["user_id"].(*types.AttributeValueMemberS); ok {
		keyInfo.UserID = v.Value
	}

	if v, ok := result.Item["rate_limit"].(*types.AttributeValueMemberN); ok {
		var rateLimit int
		fmt.Sscanf(v.Value, "%d", &rateLimit)
		if rateLimit > 0 {
			keyInfo.RateLimit = rateLimit
		}
	}

	if v, ok := result.Item["total_usage"].(*types.AttributeValueMemberN); ok {
		var usage int
		fmt.Sscanf(v.Value, "%d", &usage)
		keyInfo.TotalUsage = usage
	}

	if v, ok := result.Item["tier"].(*types.AttributeValueMemberS); ok {
		keyInfo.Tier = v.Value
	}

	if v, ok := result.Item["active"].(*types.AttributeValueMemberBOOL); ok {
		keyInfo.Active = v.Value
	}

	if v, ok := result.Item["last_used"].(*types.AttributeValueMemberN); ok {
		var lastUsed int64
		fmt.Sscanf(v.Value, "%d", &lastUsed)
		keyInfo.LastUsed = lastUsed
	}

	if v, ok := result.Item["next_refill"].(*types.AttributeValueMemberN); ok {
		var nextRefillUnix int64
		fmt.Sscanf(v.Value, "%d", &nextRefillUnix)
		keyInfo.NextRefill = time.Unix(nextRefillUnix/1000, 0) // Convert from milliseconds to Unix time
	}

	if v, ok := result.Item["request_counts"].(*types.AttributeValueMemberL); ok {
		for _, item := range v.Value {
			if t, ok := item.(*types.AttributeValueMemberN); ok {
				var timestamp int64
				fmt.Sscanf(t.Value, "%d", &timestamp)
				keyInfo.RequestCounts = append(keyInfo.RequestCounts, time.Unix(timestamp, 0))
			}
		}
	}

	return keyInfo, 200, nil
}

func updateApiKeyUsageInDB(ctx context.Context, apiKey string, usageIncrement int, requestCounts []time.Time) {
	now := time.Now().Unix()

	// Get most recent timestamp only
	var mostRecentTimestamp time.Time
	if len(requestCounts) > 0 {
		mostRecentTimestamp = requestCounts[len(requestCounts)-1]
	} else {
		mostRecentTimestamp = time.Now()
	}

	// Only append the most recent timestamp
	newCountsList := []types.AttributeValue{
		&types.AttributeValueMemberN{Value: fmt.Sprintf("%d", mostRecentTimestamp.Unix())},
	}

	_, err := ddbClient.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(API_KEYS_TABLE),
		Key: map[string]types.AttributeValue{
			"api_key": &types.AttributeValueMemberS{Value: apiKey},
		},
		UpdateExpression: aws.String("ADD total_usage :inc SET last_used = :time, request_counts = list_append(if_not_exists(request_counts, :empty_list), :new_timestamp)"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":inc":           &types.AttributeValueMemberN{Value: fmt.Sprintf("%d", usageIncrement)},
			":time":          &types.AttributeValueMemberN{Value: fmt.Sprintf("%d", now)},
			":new_timestamp": &types.AttributeValueMemberL{Value: newCountsList},
			":empty_list":    &types.AttributeValueMemberL{Value: []types.AttributeValue{}},
		},
	})

	if err != nil {
		fmt.Printf("Failed to update API key usage: %v\n", err)
	} else {
		fmt.Printf("Successfully updated DB for key %s\n", apiKey)
	}
}

// Helper function to check if a key exists in the database
func keyExistsInDB(ctx context.Context, apiKey string) (bool, error) {
	result, err := ddbClient.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(API_KEYS_TABLE),
		Key: map[string]types.AttributeValue{
			"api_key": &types.AttributeValueMemberS{Value: apiKey},
		},
		ProjectionExpression: aws.String("api_key"), // Only retrieve the key to minimize data transfer
	})

	if err != nil {
		return false, err
	}

	return result.Item != nil, nil
}

// Remove a key from the cache
func removeKeyFromCache(apiKey string) {
	apiKeysLock.Lock()
	delete(apiKeys, apiKey)
	apiKeysLock.Unlock()
}

// Modify the resetUsageInDB function to handle non-existent keys gracefully
func resetUsageInDB(ctx context.Context, apiKey string, nextRefill time.Time) {
	nextRefillMs := nextRefill.UnixNano() / int64(time.Millisecond)

	// First check if the key still exists
	exists, err := keyExistsInDB(ctx, apiKey)
	if err != nil {
		fmt.Printf("Error checking if key exists during reset: %v\n", err)
		return
	}

	if !exists {
		fmt.Printf("Skipping reset for non-existent key: %s\n", apiKey)
		return
	}

	_, err = ddbClient.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(API_KEYS_TABLE),
		Key: map[string]types.AttributeValue{
			"api_key": &types.AttributeValueMemberS{Value: apiKey},
		},
		UpdateExpression: aws.String("SET total_usage = :zero, next_refill = :nextRefill"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":zero":       &types.AttributeValueMemberN{Value: "0"},
			":nextRefill": &types.AttributeValueMemberN{Value: fmt.Sprintf("%d", nextRefillMs)},
		},
		ConditionExpression: aws.String("attribute_exists(api_key)"), // Only update if the key exists
	})

	if err != nil {
		if strings.Contains(err.Error(), "ConditionalCheckFailedException") {
			fmt.Printf("API key %s was deleted during reset operation\n", apiKey)
			// Also remove from cache if still there
			removeKeyFromCache(apiKey)
		} else {
			fmt.Printf("Failed to reset API key usage: %v\n", err)
		}
	} else {
		fmt.Printf("Successfully reset usage for key %s with next refill at %v\n", apiKey, nextRefill)
	}
}
