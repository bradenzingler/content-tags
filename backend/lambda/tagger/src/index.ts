import { fetchImage, getMD5Hash, isValidUrl, parseImageUrl } from "./utils";
import { error, success } from "./responses";
import { Event } from "./types";
import { storeImageInS3 } from "./s3";
import { getTags } from "./openai";
import { updateApiKeyUsage } from "./ddb";

const cache = new Map<string, string[]>();

export const handler = async (event: Event) => {
	console.log("Received event:", JSON.stringify(event));
	const apiKeyInfo = event.requestContext.authorizer.lambda;

	if (!apiKeyInfo || !apiKeyInfo.apiKey) {
		console.error(
			"API key info not found in event even after passing through authorizer"
		);
		return error(401, "Unauthorized!", "UNAUTHORIZED");
	}

	const imageUrl = parseImageUrl(event);
	if (!imageUrl) {
		return error(
			400,
			"Expected 'image_url' field to be in the event body.",
			"MISSING_IMAGE_URL"
		);
	}

	if (typeof imageUrl !== "string") {
		return error(
			400,
			`Expected 'image_url' field to be of type 'string', received type '${typeof imageUrl}'.`,
			"INVALID_IMAGE_URL"
		);
	}

	if (!isValidUrl(imageUrl)) {
		return error(
			400,
			"Invalid image_url. Make sure the URL protocol is 'https:' or 'data:' and has a valid structure.",
			"INVALID_IMAGE_URL"
		);
	}

    const imageData = await fetchImage(imageUrl);
    if (!imageData) {
        return error(
            400,
            "Failed to fetch image data. Make sure the URL is valid and accessible.",
            "INVALID_IMAGE_URL"
        );
    }

    const imageHash = getMD5Hash(imageUrl.slice(0, 100));
    if (cache.has(imageHash)) {
        updateApiKeyUsage(apiKeyInfo.apiKey, apiKeyInfo.totalUsage, apiKeyInfo.requestCounts.split(","))
            .catch(err => console.error('Error updating API key usage:', err));
        return success({ tags: cache.get(imageHash) });
    }

    const presignedUrl = await storeImageInS3(imageData, imageHash);
    const tags = await getTags(presignedUrl);
    cache.set(imageHash, tags);

    const requestCounts = apiKeyInfo.requestCounts ? apiKeyInfo.requestCounts.split(",") : [];
    
    updateApiKeyUsage(apiKeyInfo.apiKey, apiKeyInfo.totalUsage, requestCounts)
            .catch(err => console.error('Error updating API key usage:', err));
	return success({ tags });
};