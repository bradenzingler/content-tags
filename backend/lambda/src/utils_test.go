package main

import (
	"encoding/json"
	"testing"

	"github.com/aws/aws-lambda-go/events"
)

func TestIsValidUrl(t *testing.T) {
	testCases := []struct {
		url      string
		expected bool
	}{
		{"https://example.com/image.jpg", true},
		{"https://example.com/image.png", true},
		{"https://example.com/image.gif", true},
		{"https://example.com/image", true},
		{"https://example.com/image.jpg?query=123", true},
		{"https://example.com/image.jpg#fragment", true},
		{"https://example.com/image.jpg#fragment?query=123", true},
		{"https://example.com/image.jpg?query=123#fragment", true},
		{"https://example.com/image.jpg?query=123#fragment&another=456", true},
		{"https://example.com/image.jpg#fragment&another=456?query=123", true},
		{"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/", true},
		{"invalid", false},
		{"http://google.com", false},
		{"", false},
		{"123.com", false},
	}
	for _, tc := range testCases {
		result := isValidURL(tc.url)
		if result != tc.expected {
			t.Errorf("isValidURL(%q) = %v; want %v", tc.url, result, tc.expected)
		}
	}
}

func TestGetMD5Hash(t *testing.T) {
	testCases := []struct {
		text		string
		expected 	string
	}{
		{"123", "202cb962ac59075b964b07152d234b70"},
		{"https://example.com/image.jpg", "18867d45576d8283d6fabb82406789c8"},
	}
	for _, tc := range testCases {
		result := getMD5Hash(tc.text)
		if result != tc.expected {
			t.Errorf("getMD5Hash(%q) = %v; want %v", tc.text, result, tc.expected)
		}
	}
}


// Test the base64 image handling
func TestBase64ImageHandling(t *testing.T) {
	testBase64 := "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q=="

	t.Run("isBase64Image", func(t *testing.T) {
		if !isBase64Image(testBase64) {
			t.Errorf("isBase64Image failed to identify valid base64 image")
		}

		if isBase64Image("https://example.com/image.jpg") {
			t.Errorf("isBase64Image incorrectly identified URL as base64 image")
		}
	})

	t.Run("extractBase64Data", func(t *testing.T) {
		extracted := extractBase64Data(testBase64)
		if extracted == "" {
			t.Errorf("extractBase64Data returned empty string")
		}

		// Test with a valid base64 request
		req := events.APIGatewayProxyRequest{
			Body: `{"image_url": "` + testBase64 + `"}`,
		}
		url, err := parseImageURL(req)
		if err != nil {
			t.Errorf("parseImageURL failed with base64 image: %v", err)
		}

		// Verify the data was extracted correctly
		expected := extractBase64Data(testBase64)
		if url != expected {
			t.Errorf("Expected extracted base64 data %s but got %s", expected, url)
		}
	})
}

// Test parsing the request body
func TestParseImageURL(t *testing.T) {
	testCases := []struct {
		name        string
		body        string
		expectError bool
		expectedURL string
	}{
		{
			name:        "Valid URL",
			body:        `{"image_url": "https://example.com/image.jpg"}`,
			expectError: false,
			expectedURL: "https://example.com/image.jpg",
		},
		{
			name:        "Missing image_url",
			body:        `{"some_field": "some_value"}`,
			expectError: true,
			expectedURL: "",
		},
		{
			name:        "Empty image_url",
			body:        `{"image_url": ""}`,
			expectError: true,
			expectedURL: "",
		},
		{
			name:        "Invalid JSON",
			body:        `{"image_url": invalid_json`,
			expectError: true,
			expectedURL: "",
		},
		{
			name:        "Base64 image",
			body:        `{"image_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAAAtGVYSWZJSSoACA"}`,
			expectError: false,
			expectedURL: "iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAAAtGVYSWZJSSoACA",
		},
		{
			name:        "Invalid base64 image",
			body:        `{"image_url": "data:image/png;base64,"}`,
			expectError: true,
			expectedURL: "",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req := events.APIGatewayProxyRequest{
				Body: tc.body,
			}

			url, err := parseImageURL(req)

			if tc.expectError {
				if err == nil {
					t.Errorf("Expected error but got nil")
				}
			} else {
				if err != nil {
					t.Errorf("Unexpected error: %v", err)
				}
				if url != tc.expectedURL {
					t.Errorf("Expected URL %s but got %s", tc.expectedURL, url)
				}
			}
		})
	}
}

// Test error response formatting
func TestErrorResponse(t *testing.T) {
	testCases := []struct {
		name        string
		code        string
		description string
		statusCode  int
	}{
		{
			name:        "Basic Error",
			code:        "test_error",
			description: "Test error description",
			statusCode:  400,
		},
		{
			name:        "Not Found",
			code:        "not_found",
			description: "Resource not found",
			statusCode:  404,
		},
		{
			name:        "Server Error",
			code:        "server_error",
			description: "Internal server error",
			statusCode:  500,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resp, err := errorResponse(tc.code, tc.description, tc.statusCode)

			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}

			if resp.StatusCode != tc.statusCode {
				t.Errorf("Expected status code %d but got %d", tc.statusCode, resp.StatusCode)
			}

			var respBody ErrorResponseBody
			err = json.Unmarshal([]byte(resp.Body), &respBody)
			if err != nil {
				t.Errorf("Failed to unmarshal response body: %v", err)
				return
			}

			if respBody.ErrorCode != tc.code {
				t.Errorf("Expected error code %s but got %s", tc.code, respBody.ErrorCode)
			}

			if respBody.ErrorDescription != tc.description {
				t.Errorf("Expected description %s but got %s", tc.description, respBody.ErrorDescription)
			}
		})
	}
}