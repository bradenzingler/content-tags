package main

import (
	"encoding/json"
	"net/url"

	"github.com/aws/aws-lambda-go/events"
)

const DOCS_URL = "https://inferly.org/docs/errors/"

func isValidURL(str string) bool {
	url, err := url.ParseRequestURI(str)
	return err == nil && url.Scheme != "" && url.Host != ""
}

func errorResponse(code string, description string, status int) (events.APIGatewayProxyResponse, error) {
	errResp := ErrorResponseBody{
		ErrorCode: code,
		DocumentationURL: DOCS_URL + code,
		ErrorDescription: description,
	}

	jsonBody, _ := json.Marshal(errResp);

	return events.APIGatewayProxyResponse{
		StatusCode: status,
		Body: 		string(jsonBody),
	}, nil
}