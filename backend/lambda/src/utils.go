package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/aws/aws-lambda-go/events"
)

const DOCS_URL = "https://inferly.org/docs/errors/"
const IMAGE_FETCH_TIMEOUT = time.Second * 2
var SUPPORTED_FORMATS = []string{"image/jpeg", "image/png", "base64"}

func isValidURL(str string) bool {
	url, err := url.ParseRequestURI(str)
	return err == nil && url.Scheme == "https" && url.Host != ""
}

func generateImageId() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

// func isValidImageType(url string) bool {
// 	if isBase64Image(url) {
// 		return true
// 	}
// 	resp, err := http.Head(url)
// 	if err != nil {
// 		return false
// 	}
// 	defer resp.Body.Close()
// 	contentType := resp.Header.Get("Content-Type")
// 	if contentType == "" {
// 		return false
// 	}

// 	if !strings.HasPrefix(contentType, "image/") {
// 		return false
// 	}

// 	for _, format := range SUPPORTED_FORMATS {
// 		if strings.Contains(contentType, format) {
// 			return true
// 		}
// 	}
// 	return false
// }

// func isBase64Image(str string) bool {
// 	return strings.HasPrefix(str, "data:image/")
// }

func fetchImage(url string) ([]byte, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP request to image failed with status code: %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return data, nil
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