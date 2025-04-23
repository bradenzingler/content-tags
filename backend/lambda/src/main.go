package main

import (
	"context"
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

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

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

func main() {
	lambda.Start(handler)
}