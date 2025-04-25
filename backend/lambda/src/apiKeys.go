package main

import (
	"context"
	"fmt"
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
const DEFAULT_RATE_LIMIT = 60
const USAGE_COST_PER_REQUEST = 1

var (
	ddbClient *dynamodb.Client
	ddbOnce   sync.Once

	apiKeys     = make(map[string]*ApiKeyInfo)
	apiKeysLock = sync.RWMutex{}
)

func init() {
	ddbOnce.Do(func() {
		cfg, err := config.LoadDefaultConfig(context.Background())
		if err != nil {
			fmt.Printf("Error loading AWS config: %v\n", err)
			return
		}

		// Create the DynamoDB client
		ddbClient = dynamodb.NewFromConfig(cfg)
		fmt.Println("DynamoDB client initialized in global scope")
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

	fmt.Println(headers)

	if headers == nil {
		return "", fmt.Errorf("missing authorization header")
	}

	authorizationHeader := headers["authorization"]

	if authorizationHeader == "" {
		return "", fmt.Errorf("missing authorization header")
	}

	if !strings.HasPrefix(authorizationHeader, "Bearer ") {
		return "", fmt.Errorf("invalid authorization header format. Expected Bearer <api key>")
	}

	apiKey := strings.TrimPrefix(authorizationHeader, "Bearer ")

	if apiKey == "" {
		return "", fmt.Errorf("missing API key")
	}

	return apiKey, nil
}

func isValidApiKey(ctx context.Context, apiKey string) (bool, *ApiKeyInfo, error) {
	// Ensure DynamoDB client is initialized
	if ddbClient == nil {
		return false, nil, fmt.Errorf("DynamoDB client not initialized")
	}

	// Check in-memory cache first
	apiKeysLock.RLock()
	keyInfo, exists := apiKeys[apiKey]
	apiKeysLock.RUnlock()

	if !exists {
		fmt.Printf("Cache miss for API key %s, loading from DB\n", apiKey)
		// Load from DynamoDB
		var err error
		keyInfo, err = loadApiKeyFromDB(ctx, apiKey)
		if err != nil {
			return false, nil, err
		}

		// Save to cache
		apiKeysLock.Lock()
		apiKeys[apiKey] = keyInfo
		apiKeysLock.Unlock()
	} else {
		fmt.Printf("Cache hit for API key %s, current usage: %d\n", apiKey, keyInfo.TotalUsage)
	}

	// Key validation checks
	keyInfo.Lock()
	defer keyInfo.Unlock()

	// Check if key is active
	if !keyInfo.Active {
		return false, nil, fmt.Errorf("API key is not active")
	}

	// Rate limit check: Clean up old request counts
	now := time.Now()
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
		return false, nil, fmt.Errorf("rate limit exceeded")
	}

	// Update usage tracking
	keyInfo.TotalUsage += USAGE_COST_PER_REQUEST
	keyInfo.LastUsed = now.Unix()
	keyInfo.RequestCounts = append(keyInfo.RequestCounts, now)
	fmt.Printf("Updated in-memory usage for key %s to %d\n", apiKey, keyInfo.TotalUsage)

	// Asynchronously update the database
	go updateApiKeyUsage(context.Background(), apiKey, USAGE_COST_PER_REQUEST)

	return true, keyInfo, nil
}

// Load API key information from DynamoDB
func loadApiKeyFromDB(ctx context.Context, apiKey string) (*ApiKeyInfo, error) {
	// Query DynamoDB for the API key
	result, err := ddbClient.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(API_KEYS_TABLE),
		Key: map[string]types.AttributeValue{
			"api_key": &types.AttributeValueMemberS{Value: apiKey},
		},
	})

	if err != nil {
		return nil, fmt.Errorf("database error: %v", err)
	}

	// Check if key was found
	if result.Item == nil {
		return nil, fmt.Errorf("API key not found")
	}

	// Parse the result
	keyInfo := &ApiKeyInfo{
		Key:           apiKey,
		RequestCounts: make([]time.Time, 0),
		LastUsed:      time.Now().Unix(),
		Active:        true,
		RateLimit:     DEFAULT_RATE_LIMIT,
		Tier:          "free",
	}

	// Extract fields from DynamoDB response
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

	return keyInfo, nil
}

func updateApiKeyUsage(ctx context.Context, apiKey string, usageIncrement int) {
	now := time.Now().Unix()
	fmt.Printf("Updating DB for key %s, incrementing usage by %d\n", apiKey, usageIncrement)

	_, err := ddbClient.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(API_KEYS_TABLE),
		Key: map[string]types.AttributeValue{
			"api_key": &types.AttributeValueMemberS{Value: apiKey},
		},
		UpdateExpression: aws.String("ADD total_usage :inc SET last_used = :time"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":inc":  &types.AttributeValueMemberN{Value: fmt.Sprintf("%d", usageIncrement)},
			":time": &types.AttributeValueMemberN{Value: fmt.Sprintf("%d", now)},
		},
	})

	if err != nil {
		fmt.Printf("Failed to update API key usage: %v\n", err)
	} else {
		fmt.Printf("Successfully updated DB for key %s\n", apiKey)
	}
}
