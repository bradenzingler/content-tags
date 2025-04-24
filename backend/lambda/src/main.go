package main

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sync"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// Cache for storing previously processed image tags
var (
	cache      = make(map[string][]string)
	cacheLock  = sync.RWMutex{}
	cacheStats = struct {
		hits   int
		misses int
		sync.RWMutex
	}{}
)

// Helper to generate MD5 hash for cache key
func getMD5Hash(text string) string {
	hasher := md5.New()
	hasher.Write([]byte(text))
	return hex.EncodeToString(hasher.Sum(nil))
}

type ResponseBody struct {
	Tags []string `json:"tags"`
}

type ErrorResponseBody struct {
	ErrorCode        string `json:"error_code"`
	DocumentationURL string `json:"documentation_url"`
	ErrorDescription string `json:"error_description"`
}

type RequestBody struct {
	ImageUrl string `json:"image_url"`
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	var requestBody RequestBody
	err := json.Unmarshal([]byte(request.Body), &requestBody)

	if err != nil {
		fmt.Println(err)
		return errorResponse("invalid_request", "The request body could not be parsed. Please provide a valid input body", 400)
	}

	if requestBody.ImageUrl == "" {
		return errorResponse("invalid_request", "The 'image_url' field is missing.", 400)
	}

	if !isValidURL(requestBody.ImageUrl) {
		return errorResponse("invalid_image", "The provided image_url is not a valid URL", 400)
	}

	// Create cache key from the image URL
	cacheKey := getMD5Hash(requestBody.ImageUrl)

	// Check if we have a cached response
	cacheLock.RLock()
	cachedTags, found := cache[cacheKey]
	cacheLock.RUnlock()

	if found {
		// Update cache hit stats
		cacheStats.Lock()
		cacheStats.hits++
		hitRate := float64(cacheStats.hits) / float64(cacheStats.hits+cacheStats.misses) * 100
		fmt.Printf("Cache hit (%d hits, %d misses, %.2f%% hit rate)\n",
			cacheStats.hits, cacheStats.misses, hitRate)
		cacheStats.Unlock()

		// Return cached response
		response := ResponseBody{
			Tags: cachedTags,
		}

		responseJSON, err := json.Marshal(response)
		if err != nil {
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
				Body:       `{"error": "Failed to marshal response"}`,
			}, nil
		}

		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Body:       string(responseJSON),
		}, nil
	}

	// Update cache miss stats
	cacheStats.Lock()
	cacheStats.misses++
	hitRate := float64(cacheStats.hits) / float64(cacheStats.hits+cacheStats.misses) * 100
	fmt.Printf("Cache miss (%d hits, %d misses, %.2f%% hit rate)\n",
		cacheStats.hits, cacheStats.misses, hitRate)
	cacheStats.Unlock()

	// Get tags if not in cache
	tags, err := getTags(requestBody.ImageUrl)

	if err != nil {
		return errorResponse("internal_error", "Sorry, unable to find tags. Please try again. You will not be charged for this request.", 500)
	}

	// Store in cache
	cacheLock.Lock()
	cache[cacheKey] = tags
	cacheLock.Unlock()

	response := ResponseBody{
		Tags: tags,
	}

	responseJSON, err := json.Marshal(response)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       `{"error": "Failed to marshal response"}`,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       string(responseJSON),
	}, nil
}

func main() {
	lambda.Start(handler)
}
