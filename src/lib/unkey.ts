import { Unkey } from "@unkey/api";

const rootKey = process.env.UNKEY_ROOT_KEY;
if (!rootKey) throw new Error("UNKEY_ROOT_KEY is not set");

export const unkey = new Unkey({ rootKey });
export const API_ID = "api_3wzKetrnU2Rj7eX5";

export async function createNewApiKey(
	userId: string
): Promise<{ key: string; keyId: string }> {
	const created = await unkey.keys.create({
		apiId: API_ID,
		prefix: "tags",
		externalId: userId,
		meta: {
			tier: "free",
		},
		ratelimit: {
			async: true,
			duration: 60000, // default to free tier
			limit: 5,
		},
		remaining: 200,
		refill: {
			interval: "monthly",
			amount: 200,
			refillDay: 1,
		},
		enabled: true,
	});

	if (!created.result) {
		throw new Error("Failed to create API key");
	}

	return created.result;
}
