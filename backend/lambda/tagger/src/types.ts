import { APIGatewayProxyEventV2WithLambdaAuthorizer } from "aws-lambda";

export type ErrorCode = "INTERNAL_ERROR" | "UNAUTHORIZED" | "MISSING_IMAGE_URL" | "INVALID_IMAGE_URL";
export type Event = APIGatewayProxyEventV2WithLambdaAuthorizer<any>;
