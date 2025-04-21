import { DynamoDB } from "@aws-sdk/client-dynamodb";

const apiKeysTable = process.env.API_KEY_TABLE;
const userKeysTable = process.env.USER_KEYS_TABLE;

if (!apiKeysTable) throw new Error("API_KEY_TABLE is not set");
if (!userKeysTable) throw new Error("USER_KEYS_TABLE is not set");

const ddb = new DynamoDB();

export async function setApiKeyId(userId: string, apiKeyId: string) {
	try {
		await ddb.putItem({
			TableName: userKeysTable,
			Item: {
				user_id: { S: userId },
				api_key_id: { S: apiKeyId },
			},
		});
	} catch (error) {
		console.error("Error setting API key ID:", error);
		throw error;
	}
}

export async function getApiKeyId(userId: string): Promise<string | null> {
	try {
		const { Item } = await ddb.getItem({
			TableName: userKeysTable,
			Key: { user_id: { S: userId } },
		});

		return Item?.api_key_id.S ?? null;
	} catch (error) {
		console.error("Error getting API key ID:", error);
		throw error;
	}
}

export type TableItem = {
	apiKey: string;
	enabled: boolean;
	usageWindow: number;
	requestCount: number;
	tier: "free" | "startup" | "scale";
};
