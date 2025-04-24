package main

import (
	"context"
	"fmt"
	// "os"
	"encoding/json"

	// openai "github.com/sashabaranov/go-openai"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// var client openai.Client = *openai.NewClient(os.Getenv("OPENAI_API_KEY"))

type ResponseBody struct {
	Tags []string `json:"tags"`
}

type ErrorResponseBody struct {
	ErrorCode 			string `json:"error_code"`
	DocumentationURL 	string `json:"documentation_url"`
	ErrorDescription 	string `json:"error_description"`
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

	if (!isValidURL(requestBody.ImageUrl)) {
		return errorResponse("invalid_image", "The provided image_url is not a valid URL", 400)
	}

	// if (!isValidImageType(requestBody.ImageUrl)) {
	// }

	imageData, err := fetchImage(requestBody.ImageUrl)
	if err != nil {
		return errorResponse("invalid_image", "The provided image_url could not be fetched.", 400)
	}

	imageId := generateImageId()

	res, err := storeImageInS3(imageData, imageId)
	if err != nil {
		return errorResponse(
			"internal_error", 
				fmt.Sprintf("An error occurred while storing the image: %s", err), 
				500)
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body: res,
	}, nil

	// response := ResponseBody{
	// 	Tags: []string{"123", "456"},
	// }

	// responseJSON, err := json.Marshal(response)
	// if err != nil {
	// 	return events.APIGatewayProxyResponse{
	// 		StatusCode: 500,
	// 		Body: `{"error": "Failed to marshal response"}`,
	// 	}, nil
	// }

	// return events.APIGatewayProxyResponse{
	// 	StatusCode: 200,
	// 	Body:  		string(responseJSON),
	// }, nil
}

func main() {
	lambda.Start(handler)
}