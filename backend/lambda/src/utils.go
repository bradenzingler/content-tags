package main

import (
	"crypto/md5"
	"encoding/hex"
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
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB
var SUPPORTED_FORMATS = []string{"image/jpeg", "image/png", "base64"}

func isValidURL(str string) bool {
	url, err := url.ParseRequestURI(str)
	return err == nil && url.Scheme == "https" && url.Host != ""
}

func getMD5Hash(text string) string {
	hasher := md5.New()
	hasher.Write([]byte(text))
	return hex.EncodeToString(hasher.Sum(nil))
}

func generateImageId() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

func fetchImage(url string) ([]byte, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("request to image failed with status code: %d", resp.StatusCode)
	}
	
	if resp.ContentLength > MAX_IMAGE_SIZE {
		return nil, fmt.Errorf("image size of %d bytes exceeds the maximum limit of %d bytes", resp.ContentLength, MAX_IMAGE_SIZE)
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

