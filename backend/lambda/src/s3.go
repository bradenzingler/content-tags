package main

import (
	"bytes"
	"context"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)
const BUCKET_NAME = "content-tagging-image-handling"

func storeImageInS3(imageData []byte, imageName string) (string, error) {

	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return "", err
	}

	client := s3.NewFromConfig(cfg)
	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(BUCKET_NAME),
		Key:   	aws.String(imageName),
		Body: 	bytes.NewReader(imageData),
	})
	if err != nil {
		return "", err
	}

	signer := s3.NewPresignClient(client)
	url, err := signer.PresignGetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(BUCKET_NAME),
		Key: 	aws.String(imageName),
	}, s3.WithPresignExpires(1*time.Minute))
	if err != nil {
		return "", err
	}

	return url.URL, nil
}
