import { convertTierToUsageAmount } from "@/app/utils";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const apiKeysTable = process.env.API_KEY_TABLE;
const userKeysTable = process.env.USER_KEY_TABLE;

if (!apiKeysTable) throw new Error("API_KEY_TABLE is not set");
if (!userKeysTable) throw new Error("USER_KEY_TABLE is not set");

const ddb = new DynamoDB();

export async function getUserApiKey(userId: string): Promise<string | null> {
	const response = await ddb.getItem({
		TableName: userKeysTable,
		Key: { user_id: { S: userId } },
	});
	if (!response.Item) return null;
	if (!response.Item.api_key.S) return null;
	return response.Item.api_key.S;
}

export async function getApiKeyInfo(
	apiKey: string
): Promise<ApiKeyInfo | null> {
	const response = await ddb.getItem({
		TableName: apiKeysTable,
		Key: { api_key: { S: apiKey } },
	});
	if (!response.Item) return null;

	if (response.Item.active.BOOL === undefined) {
		console.error("No active status found for API key");
		return null;
	}
	if (!response.Item.tier.S) {
		console.error("No tier found for API key");
		return null;
	}
	if (!response.Item.last_used.N) {
		console.error("No last_used found for API key");
		return null;
	}
	if (!response.Item.next_refill.N) {
		console.error("No next_refill found for API key");
		return null;
	}
	if (response.Item.rate_limit.N === undefined) {
		console.error("No rate_limit found for API key");
		return null;
	}
	if (response.Item.request_counts?.L === undefined) {
		console.error("No request_counts found for API key");
		return null;
	}
	if (response.Item.total_usage.N === undefined) {
		console.error("No total_usage found for API key");
		return null;
	}
	if (response.Item.user_id.S === undefined) {
		console.error("No user_id found for API key");
		return null;
	}

	return {
		apiKey: apiKey,
		userId: response.Item.user_id.S,
		rateLimit: parseInt(response.Item.rate_limit.N),
		totalUsage: parseInt(response.Item.total_usage.N),
		lastUsed: parseInt(response.Item.last_used.N),
		requestCounts: response.Item.request_counts.L.map((item) =>
			parseInt(item.N ?? "0")
		),
		nextRefill: parseInt(response.Item.next_refill.N),
		tier: response.Item.tier.S as ApiKeyTier,
		active: response.Item.active.BOOL,
	};
}

export async function regenerateKey(
	oldApiKey: string,
	userId: string,
	newApiKey: string
): Promise<ApiKeyInfo> {
	// delete old key from key table
	const oldKeyResponse = await ddb.deleteItem({
		TableName: apiKeysTable,
		Key: { api_key: { S: oldApiKey } },
		ReturnValues: "ALL_OLD",
	});
	// create new key in key table and transfer old key attributes
	await ddb.putItem({
		TableName: apiKeysTable,
		Item: {
			api_key: { S: newApiKey },
			user_id: { S: userId },
			rate_limit: { N: oldKeyResponse.Attributes?.rate_limit.N ?? "0" },
			total_usage: { N: oldKeyResponse.Attributes?.total_usage.N ?? "0" },
			last_used: { N: oldKeyResponse.Attributes?.last_used.N ?? "0" },
			next_refill: { N: oldKeyResponse.Attributes?.next_refill.N ?? "0" },
			tier: { S: oldKeyResponse.Attributes?.tier.S ?? "free" },
			active: { BOOL: oldKeyResponse.Attributes?.active.BOOL ?? true },
            request_counts: { L: oldKeyResponse.Attributes?.request_counts.L ?? [] },
		},
	});

	await ddb.updateItem({
		TableName: userKeysTable,
		Key: { user_id: { S: userId } },
		UpdateExpression: "SET api_key = :newApiKey",
		ExpressionAttributeValues: {
			":newApiKey": { S: newApiKey },
		},
	});

	return {
		apiKey: newApiKey,
		userId: userId,
		rateLimit: parseInt(oldKeyResponse.Attributes?.rate_limit.N ?? "0"),
		totalUsage: parseInt(oldKeyResponse.Attributes?.total_usage.N ?? "0"),
		lastUsed: parseInt(oldKeyResponse.Attributes?.last_used.N ?? "0"),
		requestCounts:
			oldKeyResponse.Attributes?.request_counts.L?.map((item) =>
				parseInt(item.N ?? "0")
			) ?? [],
		nextRefill: parseInt(oldKeyResponse.Attributes?.next_refill.N ?? "0"),
		tier: (oldKeyResponse.Attributes?.tier.S as ApiKeyTier) ?? "free",
		active: oldKeyResponse.Attributes?.active.BOOL ?? true,
	};
}

export async function createApiKey(
	userId: string,
	apiKey: string,
	tier: ApiKeyTier
): Promise<ApiKeyInfo> {
	const rateLimit = convertTierToUsageAmount(tier);
	const nextRefill = new Date();
	nextRefill.setDate(nextRefill.getDate() + 30);

	await ddb.putItem({
		TableName: apiKeysTable,
		Item: {
			api_key: { S: apiKey },
			user_id: { S: userId },
			rate_limit: { N: rateLimit.toString() },
			total_usage: { N: "0" },
			last_used: { N: "0" },
			request_counts: { L: [] },
			next_refill: { N: nextRefill.getTime().toString() },
			tier: { S: tier },
			active: { BOOL: true },
		},
	});
	await ddb.putItem({
		TableName: userKeysTable,
		Item: {
			user_id: { S: userId },
			api_key: { S: apiKey },
		},
	});
	return {
		apiKey,
		userId,
		rateLimit,
		totalUsage: 0,
		lastUsed: 0,
		requestCounts: [],
		nextRefill: nextRefill.getTime(),
		tier,
		active: true,
	};
}

export type ApiKeyInfo = {
	apiKey: string;
	userId: string;
	rateLimit: number;
	totalUsage: number;
	lastUsed: number;
	requestCounts: number[];
	nextRefill: number;
	tier: ApiKeyTier;
	active: boolean;
};

export type ApiKeyTier = "free" | "startup" | "scale";
