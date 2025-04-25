package main

import (
	"testing"
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