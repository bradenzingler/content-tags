package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

var (
	cache     = make(map[string][]string)
	cacheLock = sync.RWMutex{}
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

	imageUrl, err := parseImageURL(request)
	if err != nil {
		return errorResponse("invalid_request", err.Error(), 400)
	}

	apiKey, err := getApiKeyFromHeaders(request)
	if err != nil {
		return errorResponse("invalid_api_key", err.Error(), 401)
	}

	valid, apiKeyInfo, status, err := isValidApiKey(ctx, apiKey)
	if err != nil {
		return errorResponse("invalid_api_key", err.Error(), status)
	}
	if apiKeyInfo == nil {
		fmt.Printf("The api key info was null, but the error was also null")
		return errorResponse("internal_error", "an internal error occurred. you will not be charged for this request", 500)
	}

	if !valid {
		return errorResponse("invalid_api_key", "api key is invalid", 401)
	}

	apiKeyInfo.Lock()
	defer apiKeyInfo.Unlock()

	// Just update usage information
	apiKeyInfo.TotalUsage = apiKeyInfo.TotalUsage + 1
	apiKeyInfo.LastUsed = time.Now().Unix()
	apiKeyInfo.RequestCounts = append(apiKeyInfo.RequestCounts, time.Now())

	cacheKey := getMD5Hash(imageUrl)

	cacheLock.RLock()
	cachedTags, found := cache[cacheKey]
	cacheLock.RUnlock()

	if found {
		// Return cached tags
		response := ResponseBody{
			Tags: cachedTags,
		}
		responseJSON, _ := json.Marshal(response)
		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Body:       string(responseJSON),
		}, nil
	}

	var imageData []byte
	if isBase64Image(imageUrl) {
		imageData, err = base64.StdEncoding.DecodeString(imageUrl)
		if err != nil {
			return errorResponse("invalid_image", "The provided image_url is not a valid base64 image: "+err.Error(), 400)
		}
	} else {
		imageData, err = fetchImage(imageUrl)
	}

	if err != nil {
		return errorResponse("invalid_image", "The provided image_url is not a valid URL", 400)
	}

	presignedUrl, err := storeImageInS3(imageData, cacheKey)
	if err != nil {
		return errorResponse("internal_error", "sorry, unable to get the image. Please try again. You will not be charged for this request.", 500)
	}

	tags, err := getTags(presignedUrl)

	if err != nil {
		return errorResponse("internal_error", "Sorry, unable to find tags. Please try again. You will not be charged for this request.", 500)
	}

	// Store resulting tags in the cache
	cacheLock.Lock()
	cache[cacheKey] = tags
	cacheLock.Unlock()

	response := ResponseBody{Tags: tags}
	responseJSON, _ := json.Marshal(response)
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       string(responseJSON),
	}, nil
}

func main() {
	lambda.Start(handler)
}
