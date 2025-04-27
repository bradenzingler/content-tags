package main

import (
	"fmt"
	"testing"

	"github.com/aws/aws-lambda-go/events"
)

func TestGetApiKeyFromHeaders(t *testing.T) {
	testCases := []struct {
		name        string
		req         events.APIGatewayProxyRequest
		expectError bool
		expectedKey string
	}{
		{
			name:        "Valid API key format in Authorization header",
			expectError: false,
			req: events.APIGatewayProxyRequest{
				Headers: map[string]string{"Authorization": "Bearer 12345"},
			},
			expectedKey: "12345",
		},
		{
			name:        "Invalid API key format in Authorization header",
			expectError: true,
			req: events.APIGatewayProxyRequest{
				Headers: map[string]string{"Authorization": "Bearer"},
			},
			expectedKey: "",
		},
		{
			name:        "API key missing from authorization header",
			expectError: true,
			req: events.APIGatewayProxyRequest{
				Headers: map[string]string{"Authorization": "Bearer "},
			},
			expectedKey: "",
		},
		{
			name:        "Bearer missing from authorization header",
			expectError: true,
			req: events.APIGatewayProxyRequest{
				Headers: map[string]string{"Authorization": ""},
			},
			expectedKey: "",
		},
		{
			name:        "No authorization header at all",
			expectError: true,
			req:         events.APIGatewayProxyRequest{},
			expectedKey: "",
		},
		{
			name:        "a different header, but no authorization header",
			expectError: true,
			req: events.APIGatewayProxyRequest{
				Headers: map[string]string{"content-type": "asdasfd"},
			},
			expectedKey: "",
		},
		{
			name:        "lowercase authorization, uppercase Bearer",
			expectError: false,
			req: events.APIGatewayProxyRequest{
				Headers: map[string]string{"authorization": "Bearer 12345"},
			},
			expectedKey: "12345",
		},
		{
			name:        "authorization header without bearer",
			expectError: true,
			req: events.APIGatewayProxyRequest{
				Headers: map[string]string{"authorization": "12345"},
			},
			expectedKey: "",
		},
		{
			name:        "lowercase authorization, lowercase bearer",
			expectError: false,
			req: events.APIGatewayProxyRequest{
				Headers: map[string]string{"authorization": "bearer 12345"},
			},
			expectedKey: "12345",
		},
		{
			name:        "uppercase Authorization, lowercase bearer",
			expectError: false,
			req: events.APIGatewayProxyRequest{
				Headers: map[string]string{"Authorization": "bearer 12345"},
			},
			expectedKey: "12345",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			actualKey, err := getApiKeyFromHeaders(tc.req)
			if err != nil && !tc.expectError {
				t.Errorf("got unexpected error")
			}
			if actualKey != tc.expectedKey {
				t.Errorf("getApiKeyFromHeaders(headers=%s) => %s, expected %s", fmt.Sprintf("%v", tc.req.Headers), actualKey, tc.expectedKey)
			}
		})
	}
}


func TestIsValidApiKey(t *testing.T) {
	
}