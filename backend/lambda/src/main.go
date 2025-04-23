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
		return errorResponse("invalid_request", "The request body could not be parsed. Check your input body for typos.", 400)
	}

	response := ResponseBody{
		Tags: []string{"123", "456"},
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

func errorResponse(code string, description string, status int) (events.APIGatewayProxyResponse, error) {
	errResp := ErrorResponseBody{
		ErrorCode: code,
		DocumentationURL: "https://inferly.org/docs/errors/" + code,
		ErrorDescription: description,
	}

	jsonBody, _ := json.Marshal(errResp);

	return events.APIGatewayProxyResponse{
		StatusCode: status,
		Body: 		string(jsonBody),
	}, nil
}

func main() {
	lambda.Start(handler)
}