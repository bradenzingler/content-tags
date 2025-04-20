import { DynamoDB } from "@aws-sdk/client-dynamodb";

const tableName = process.env.API_KEY_TABLE;

if (!tableName) throw new Error("API_KEY_TABLE is not set");

const ddb = new DynamoDB();

export async function getByApiKey(apiKey: string): Promise<TableItem | null> {
    const response = await ddb.getItem({
        TableName: tableName,
        Key: { api_key: { S: apiKey } }
    });

    if (!response.Item) return null;
    if (!response.Item.enabled.BOOL) return null;
    if (!response.Item.request_count.N) return null;
    if (!response.Item.api_key.S) return null;
    if (!response.Item.tier.S) return null;
    if (!response.Item.usage_window.N) return null;
    if (response.Item.tier.S !== "free" && response.Item.tier.S !== "pro" && response.Item.tier.S !== "enterprise") {
        console.error("Invalid tier", response.Item.tier.S);
        return null;
    }
    
    return {
        apiKey: response.Item.api_key.S,
        enabled: response.Item.enabled.BOOL,
        usageWindow: parseInt(response.Item.usage_window.N),
        requestCount: parseInt(response.Item.request_count.N),
        tier: response.Item.tier.S,
    }
}

export async function incrementRequestCount(apiKey: string): Promise<void> {
    await ddb.updateItem({
        TableName: tableName,
        Key: { api_key: { S: apiKey } },
        UpdateExpression: "SET request_count = request_count + :inc",
        ExpressionAttributeValues: { 
            ":inc": { N: "1" }
        },
    });
}

export async function resetRequestWindow(apiKey: string): Promise<void> {
    const requestWindow = Date.now() + (60 * 1000); // one minute
    await ddb.updateItem({
        TableName: tableName,
        Key: { api_key: { S: apiKey } },
        UpdateExpression: "SET request_count = :count, usage_window = :window",
        ExpressionAttributeValues: { 
            ":count": { N: "1" }, 
            ":window": { N: requestWindow.toString() } 
        },
    });
}

export type TableItem = {
    apiKey: string;
    enabled: boolean;
    usageWindow: number;
    requestCount: number;
    tier: "free" | "pro" | "enterprise";
}