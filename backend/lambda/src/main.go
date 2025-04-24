package main

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

var (
	cache      = make(map[string][]string)
	cacheLock  = sync.RWMutex{}
)

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

	apiKey, err := getApiKeyFromHeaders(request)
	if err != nil {
		return errorResponse("invalid_api_key", err.Error(), 401)
	}

	valid, apiKeyInfo, err := isValidApiKey(ctx, apiKey)
	if err != nil {
		return errorResponse("invalid_api_key", err.Error(), 500)
	}

	if !valid {
		return errorResponse("invalid_api_key", "The provided API key is invalid", 401)
	}

	apiKeyInfo.Lock()
	defer apiKeyInfo.Unlock()

	apiKeyInfo.RateLimit = apiKeyInfo.RateLimit - 1
	apiKeyInfo.TotalUsage = apiKeyInfo.TotalUsage + 1
	apiKeyInfo.LastUsed = time.Now()
	apiKeyInfo.RequestCounts = append(apiKeyInfo.RequestCounts, time.Now())

	if apiKeyInfo.RateLimit <= 0 {
		return errorResponse("rate_limit_exceeded", "The provided API key has reached its rate limit", 429)
	}

	cacheKey := getMD5Hash(requestBody.ImageUrl)

	cacheLock.RLock()
	cachedTags, found := cache[cacheKey]
	cacheLock.RUnlock()

	if found {
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

	imageData, err := fetchImage(requestBody.ImageUrl)
	if err != nil {
		return errorResponse("invalid_image", "The provided image_url is not a valid URL", 400)
	}

	presignedUrl, err := storeImageInS3(imageData, cacheKey)
	if err != nil {
		return errorResponse("internal_error", "Sorry, unable to get the image. Please try again. You will not be charged for this request.", 500)
	}

	tags, err := getTags(presignedUrl)

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
