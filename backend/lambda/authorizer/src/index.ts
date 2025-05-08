import { APIGatewayAuthorizerEvent, APIGatewayAuthorizerWithContextResult, APIGatewayRequestAuthorizerEvent, APIGatewaySimpleAuthorizerResult } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { authorized, unauthorized, Response } from "./responses"
import { exceedsMonthlyLimit, isOverRateLimit, resetUsage, shouldResetUsage, Tier } from "./utils";

export const API_KEYS_TABLE = "content-tags-api-keys"
const ddb = new DynamoDB();
// Event being received: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-lambda-authorizer.html

export const handler = async (event: APIGatewayRequestAuthorizerEvent): Promise<Response> => {
    console.log("Received event:", JSON.stringify(event));

    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) return unauthorized("Missing authorization header");

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return unauthorized("Invalid authorization header format. Expected Authorization: Bearer <api-key>");
    }
    const apiKey = parts[1];

    const response = await ddb.getItem({
        TableName: API_KEYS_TABLE,
        Key: { api_key: { S: apiKey } }
    });

    if (!response.Item) return unauthorized("Invalid API key");

    const isActive = response.Item.active?.BOOL;
    if (!isActive) return unauthorized("Invalid API key");

    const requestCountsList = response.Item.request_counts?.L;
    if (!requestCountsList) return unauthorized("Invalid API key");
    const requestCounts = requestCountsList.map(req => req.N ?? "");

    const rateLimit = response.Item.rate_limit.N;
    if (!rateLimit) {
        // TODO - the rate limit should be defaulted or reset here to recover from this error
        console.error("The rate limit is undefined!");
        return unauthorized("An error occurred. Please try again.")
    }

    if (isOverRateLimit(requestCounts, parseInt(rateLimit))) {
        return unauthorized("Rate limit exceeded");
    }

    const nextRefill = response.Item.next_refill.N;
    if (!nextRefill) {
        console.error("The next refill is undefined!");
        return unauthorized("An error occurred. Please try again.")
    }

    if (shouldResetUsage(nextRefill)) resetUsage(apiKey, ddb);

    const totalUsage = response.Item.total_usage.N;
    if (!totalUsage) {
        console.error("The total usage is undefined!");
        return unauthorized("An error occurred. Please try again.")
    }

    const tier = response.Item.tier.S;
    if (!tier) {
        console.error("The tier is undefined!");
        return unauthorized("An error occurred. Please try again.")
    }

    if (exceedsMonthlyLimit(parseInt(totalUsage), tier as Tier)) {
        return unauthorized("Total usage exceeded");
    }

    return authorized({ apiKey, isActive, nextRefill, rateLimit, tier, totalUsage });
}