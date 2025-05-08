import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { API_KEYS_TABLE } from ".";
import { convertTierToUsageAmount } from "@/app/utils";

export function isOverRateLimit(requestCounts: string[], rateLimit: number): boolean {
    const oneMinAgo = new Date(Date.now() - 1 * 60 * 1000);

    const requestsInLastMinute = requestCounts.filter(req => {
        const timestamp = new Date(req);
        return timestamp > oneMinAgo;
    });

    return requestsInLastMinute.length >= rateLimit;
}

export function shouldResetUsage(nextRefill: string): boolean {
    const nextRefillDate = new Date(nextRefill);
    const now = new Date();
    return nextRefillDate < now;
}

export function resetUsage(apiKey: string, ddb: DynamoDB) {
    const oneMonthFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    ddb.updateItem({
        TableName: API_KEYS_TABLE,
        Key: { api_key: { S: apiKey } },
        UpdateExpression: "SET total_usage = :zero, next_refill = :nextRefill",
        ExpressionAttributeValues: {
            ":zero": { N: "0" },
            ":nextRefill": { S: oneMonthFromNow.toISOString() }
        },
        ConditionExpression: "attribute_exists(api_key)"
    });
}

export function exceedsMonthlyLimit(totalUsage: number, tier: Tier): boolean {
    const allowedUsageAmount = convertTierToUsageAmount(tier);
    return totalUsage > allowedUsageAmount;
}

export type Tier = "free" | "startup" | "growth" | "scale"