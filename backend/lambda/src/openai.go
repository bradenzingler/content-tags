package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

const OPENAI_MODEL = "gpt-4.1-nano"
const ERROR_RESPONSE = "NO_TAGS"

type ImageContent struct {
	Type 		string `json:"type"`
	ImageURL  	string `json:"image_url"`
}

type TextContent struct {
	Type 		string `json:"type"`
	Text 		string `json:"text"`
}

type Message struct {
	Role 		string `json:"role"`
	Content 	[]interface{} `json:"content"`
}

type ChatRequest struct {
	Model 		string `json:"model"`
	Messages 	[]Message `json:"input"`
}

type OpenAIResponse struct {
	Output[]struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
	} `json:"output"`
}


const USER_PROMPT = "Analyze the image and produce relevant tags."
const OPENAI_API_URL = "https://api.openai.com/v1/responses"

func getTags(imageURL string) ([]string, error) {
	systemPrompt := fmt.Sprintf(`
	You are a helpful assistant. Your task is to analyze an image and provide tags based on its content. 
	The tags should be relevant to the image and should not include any personal information or sensitive data.
	The tags should be concise and descriptive, ideally 1-2 words longs. 
	If the image is not very detailed, try to provide tags based on the overall theme or subject of the image.
	The image will be provided as a URL. Format the tags in a comma separated list.
	if you cannot see the image, do not make anything up. Return 'NO_TAGS'.
	If you can not return tags for any reason, return 'NO_TAGS': %s`, imageURL)

	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("OPENAI_API_KEY is not set")
	}

	client := &http.Client{}
	req, err := http.NewRequest("POST", OPENAI_API_URL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	request := ChatRequest{
		Model: OPENAI_MODEL,
		Messages: []Message{
			{
				Role: "system",
				Content: []interface{}{
					TextContent{ Type: "input_text", Text: systemPrompt},
				},
			},
			{
				Role: "user",
				Content: []interface{}{
					ImageContent{ Type: "input_image", ImageURL: imageURL },
					TextContent{ Type: "input_text", Text: USER_PROMPT },
				},
			},
		},
	}

	reqBody, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Body = io.NopCloser(bytes.NewBuffer(reqBody))

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("request failed with status code: %d, %s", resp.StatusCode, string(respBody))
	}

	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}
	
	var aiResponse OpenAIResponse
	err = json.Unmarshal(respBody, &aiResponse)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response body: %v", err)
	}
	

	isValidResponse := len(aiResponse.Output) > 0 && len(aiResponse.Output[0].Content) > 0 && aiResponse.Output[0].Content[0].Text != ERROR_RESPONSE

	if !isValidResponse {
		return nil, fmt.Errorf("no tags found in response")
	}

	tags, err := parseOpenAiResponse(aiResponse)

	if err != nil {
		return nil, fmt.Errorf("failed to parse response: %v", err)
	}

	if len(tags) == 0 {
		return nil, fmt.Errorf("no tags found in response")
	}

	return tags, nil
}

func parseOpenAiResponse(res OpenAIResponse) ([]string, error) {
	text := res.Output[0].Content[0].Text
	
	if len(text) == 0 || text == ERROR_RESPONSE {
		return nil, fmt.Errorf("unable to find tags. please try again")
	}

	tags := strings.Split(text, ",")
	return tags, nil
}