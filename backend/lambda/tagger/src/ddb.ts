import { DynamoDB } from "@aws-sdk/client-dynamodb";

const API_KEYS_TABLE = process.env.API_KEY_TABLE || "content-tags-api-keys";
const ddb = new DynamoDB();

export async function updateApiKeyUsage(
	apiKey: string,
	totalUsage: string,
	requestCounts: string[]
): Promise<void> {
	try {
		const now = Date.now();

		const mappedRequestCounts = requestCounts
			.filter((count) => !isNaN(Number(count)) && count !== "")
			.map((count) => ({ N: count }));

		// Prepare update expression and attribute values
		await ddb.updateItem({
			TableName: API_KEYS_TABLE,
			Key: { api_key: { S: apiKey } },
			UpdateExpression:
				"SET total_usage = :totalUsage, last_used = :lastUsed, request_counts = :requestCounts",
			ExpressionAttributeValues: {
				":totalUsage": { N: (parseInt(totalUsage) + 1).toString() },
				":lastUsed": { N: now.toString() },
				":requestCounts": {
					L: [...mappedRequestCounts, { N: now.toString() }],
				},
			},
			ConditionExpression: "attribute_exists(api_key)",
		});

		console.log(
			`Successfully updated usage for API key ${apiKey.substring(
				0,
				5
			)}...`
		);
	} catch (error) {
		console.error(`Error updating API key usage:`, error);
	}
}
