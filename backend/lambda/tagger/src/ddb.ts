import { DynamoDB } from "@aws-sdk/client-dynamodb";

const API_KEYS_TABLE = process.env.API_KEY_TABLE || "content-tags-api-keys";
const ddb = new DynamoDB();

/**
 * Updates the API key usage asynchronously
 * @param apiKey The API key to update
 * @returns A promise that resolves when the update is complete
 */
export async function updateApiKeyUsage(apiKey: string): Promise<void> {
    try {
        const now = Date.now();
        
        // Get the current API key info
        const response = await ddb.getItem({
            TableName: API_KEYS_TABLE,
            Key: { api_key: { S: apiKey } }
        });
        
        if (!response.Item) {
            console.error(`API key ${apiKey.substring(0, 5)}... not found in database`);
            return;
        }
        
        // Extract current values
        const totalUsage = parseInt(response.Item.total_usage?.N || "0");
        const requestCounts = response.Item.request_counts?.L || [];
        
        // Prepare update expression and attribute values
        await ddb.updateItem({
            TableName: API_KEYS_TABLE,
            Key: { api_key: { S: apiKey } },
            UpdateExpression: "SET total_usage = :totalUsage, last_used = :lastUsed, request_counts = :requestCounts",
            ExpressionAttributeValues: {
                ":totalUsage": { N: (totalUsage + 1).toString() },
                ":lastUsed": { N: now.toString() },
                ":requestCounts": { 
                    L: [
                        // Add current timestamp to the request_counts list
                        ...requestCounts,
                        { N: now.toString() }
                    ]
                }
            },
            ConditionExpression: "attribute_exists(api_key)", // Only update if the key exists
        });
        
        console.log(`Successfully updated usage for API key ${apiKey.substring(0, 5)}...`);
    } catch (error) {
        console.error(`Error updating API key usage:`, error);
    }
}
