import { isValidUrl, parseImageUrl } from "./utils";
import { error } from "./responses";
import { Event } from "./types";

export const handler = async (event: Event) => {
	console.log("Received event:", JSON.stringify(event));
	const apiKeyInfo = event.requestContext.authorizer;

	if (!apiKeyInfo) {
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
			"Invalid image_url. Make sure the URL is served from https and has a valid structure.",
			"INVALID_IMAGE_URL"
		);
	}

	return {
		statusCode: 200,
		body: JSON.stringify({ message: "Hello, world!" }),
	};
};
