import { convertTierToUsageAmount, getTierRateLimit } from "@/app/utils";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { generateApiKey } from "./generateApiKeys";

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

	const keyInfo: ApiKeyInfo = {
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

	// Check if the API key usage needs to be reset
	const now = Date.now();
	if (now >= keyInfo.nextRefill) {
		// Key has reached the refill date, reset it
		return await resetKeyUsage(keyInfo);
	}

	return keyInfo;
}

export async function resetKeyUsage(apiKey: ApiKeyInfo): Promise<ApiKeyInfo> {
    const now = Date.now();
    
    // Only reset if the current time is after the next refill time
    if (now >= apiKey.nextRefill) {
        // First, verify the key still exists in the database
        try {
            const keyExists = await verifyKeyExists(apiKey.apiKey);
            if (!keyExists) {
                console.error(`API key ${apiKey.apiKey.substring(0, 5)}... no longer exists in the database`);
                return apiKey; // Return original key info without updating
            }
            
            // Calculate the new next refill date (30 days from now)
            const nextRefillDate = new Date();
            nextRefillDate.setDate(nextRefillDate.getDate() + 30);
            const nextRefillTimestamp = nextRefillDate.getTime();
            
            // Get the appropriate rate limit based on the tier
            const rateLimit = getTierRateLimit(apiKey.tier);
            
            // Update the key in DynamoDB with a condition that it must exist
            await ddb.updateItem({
                TableName: apiKeysTable,
                Key: { api_key: { S: apiKey.apiKey } },
                UpdateExpression: "SET next_refill = :nextRefill, total_usage = :totalUsage, rate_limit = :rateLimit",
                ExpressionAttributeValues: {
                    ":nextRefill": { N: nextRefillTimestamp.toString() },
                    ":totalUsage": { N: "0" },
                    ":rateLimit": { N: rateLimit.toString() }
                },
                ConditionExpression: "attribute_exists(api_key)" // Only update if the item exists
            });
            
            // Return the updated key info
            return {
                ...apiKey,
                nextRefill: nextRefillTimestamp,
                totalUsage: 0,
                rateLimit: rateLimit
            };
        } catch (error: any) {
            console.error("Error during key reset:", error);
            // If we got a ConditionalCheckFailedException, the key doesn't exist anymore
            if (error.name === 'ConditionalCheckFailedException') {
                console.warn(`API key ${apiKey.apiKey.substring(0, 5)}... no longer exists in the database`);
            }
            return apiKey; // Return original info without modifying
        }
    }
    
    // If we're not resetting, return the original key info
    return apiKey;
}

// Helper function to verify if a key exists in the database
async function verifyKeyExists(apiKey: string): Promise<boolean> {
    try {
        const response = await ddb.getItem({
            TableName: apiKeysTable,
            Key: { api_key: { S: apiKey } },
            ProjectionExpression: "api_key" // Only retrieve the key attribute to minimize data transfer
        });
        return !!response.Item; // Return true if the item exists
    } catch (error) {
        console.error("Error verifying key exists:", error);
        return false;
    }
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

export async function updateUserTier(userId: string, newTier: ApiKeyTier): Promise<boolean> {
    try {
        // First, get the user's API key
        const apiKey = await getUserApiKey(userId);
        if (!apiKey) {
            console.error(`No API key found for user ${userId}`);
            return false;
        }
        
        // Get the new rate limit based on the tier
        const newRateLimit = getTierRateLimit(newTier);
        
        // Update the API key with the new tier and rate limit
        await ddb.updateItem({
            TableName: apiKeysTable,
            Key: { api_key: { S: apiKey } },
            UpdateExpression: "SET tier = :tier, rate_limit = :rateLimit",
            ExpressionAttributeValues: {
                ":tier": { S: newTier },
                ":rateLimit": { N: newRateLimit.toString() }
            },
            ConditionExpression: "attribute_exists(api_key)" // Only update if the key exists
        });
        
        console.log(`Successfully updated tier for user ${userId} to ${newTier} with rate limit ${newRateLimit}`);
        return true;
    } catch (error) {
        console.error(`Error updating tier for user ${userId}:`, error);
        return false;
    }
}

export async function deleteApiKey(userId: string): Promise<void> {
    const res = await ddb.deleteItem({
        TableName: userKeysTable,
        Key: { user_id: { S: userId } },
        ReturnValues: "ALL_OLD",
    });
    const apiKey = res.Attributes?.api_key.S;
    if (!apiKey) {
        console.error(`No API key found for user ${userId} while trying to delete their apiKey`);
        return;
    }
    await ddb.deleteItem({
        TableName: apiKeysTable,
        Key: { api_key: { S: apiKey } },
    });
}

export async function createApiKey(
	userId: string,
	apiKey: string,
	tier: ApiKeyTier
): Promise<ApiKeyInfo> {
	const rateLimit = getTierRateLimit(tier);
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

export type ApiKeyTier = "free" | "startup" | "growth" | "scale";

export async function createOrGetUserApiKeyInfo(userId: string): Promise<ApiKeyInfo> {
	const existingApiKey = await getUserApiKey(userId);
	let apiKeyInfo: ApiKeyInfo;
	if (!existingApiKey) {
		const newApiKey = generateApiKey();
		apiKeyInfo = await createApiKey(userId, newApiKey, "free");
	} else {
		const existingKeyInfo = await getApiKeyInfo(existingApiKey);
		if (!existingKeyInfo) {
            throw new Error("Failed to retrieve existing API key info after creating a user");
		}
		apiKeyInfo = existingKeyInfo;
	}
    return apiKeyInfo;
}