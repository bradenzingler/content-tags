package main

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/openai/openai-go"
	"github.com/openai/openai-go/responses"
)

var client openai.Client = openai.NewClient()
const OPENAI_MODEL = "gpt-4.1-nano"

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

	// imageData, err := fetchImage(requestBody.ImageUrl)
	// if err != nil {
	// 	return errorResponse("invalid_image", fmt.Sprintf("%s", err), 400)
	// }

	// imageId := generateImageId()

	// res, err := storeImageInS3(imageData, imageId)
	// if err != nil {
	// 	return errorResponse(
	// 		"internal_error", 
	// 			fmt.Sprintf("An error occurred while storing the image: %s", err), 
	// 			500)
	// }

	// return events.APIGatewayProxyResponse{
	// 	StatusCode: 200,
	// 	Body: res,
	// }, nil

	prompt := fmt.Sprintf(`You are a helpful assistant. Your task is to analyze an image and provide tags based on its content. 
                    The tags should be relevant to the image and should not include any personal information or sensitive data.
                    The tags should be concise and descriptive, ideally 1-2 words longs. 
                    If the image is not very detailed, try to provide tags based on the overall theme or subject of the image.
                    The image will be provided as a URL. Format the tags in a comma separated list.
                    if you cannot see the image, do not make anything up. Return 'NO_TAGS'.
                    If you can not return tags for any reason, return 'NO_TAGS': %s`, requestBody.ImageUrl)
	
	openaiResponse, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: OPENAI_MODEL,
		Input: responses.ResponseNewParamsInputUnion{OfString: openai.String(prompt)},
	})
	if err != nil {
		return errorResponse("internal_error", 
		fmt.Sprintf("Sorry, unable to find tags. Please try again. You have not be charged for this request. %s", err), 500)
	}

	tags, err := parseOpenAiResponse(*openaiResponse)
	if err != nil {
		return errorResponse("internal_error", fmt.Sprintf("%s", err), 500)
	}

	response := ResponseBody{
		Tags: tags,
	}

	responseJSON, err := json.Marshal(response)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body: `{"error": "Failed to marshal response"}`,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:  		string(responseJSON),
	}, nil
}

func main() {
	lambda.Start(handler)
}