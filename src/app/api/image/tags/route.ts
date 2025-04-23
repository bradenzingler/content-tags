import { API_ID, unkey } from "@/lib/unkey";
import { NextRequest, NextResponse } from "next/server";
import { getApiKeyFromAuthorizationHeader, parseTags } from "./utils";
import { OpenAI } from "openai";
import { putImageInS3AndGetPresignedUrl } from "@/lib/s3";
import { invalidRequest } from "@/app/constants";

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/rekognition/
// https://docs.aws.amazon.com/rekognition/latest/APIReference/API_DetectLabels.html
const openai = new OpenAI({ apiKey: process.env.OPENAI_TEXT_API_KEY });
const IMAGE_CREDIT_COST = 2;
const SUPPORTED_FORMATS = ["image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
	const apiKey = getApiKeyFromAuthorizationHeader(req);
	if (apiKey === null) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const res = await unkey.keys.verify({
		key: apiKey,
		remaining: { cost: IMAGE_CREDIT_COST },
		apiId: API_ID,
	});

	if (res.error) {
		console.error("An error occurred with Unkey:", res.error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}

	if (!res.result.valid) {
        if (res.result.code === "RATE_LIMITED") {
            return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }
        if (res.result.code === "USAGE_EXCEEDED") {
            return NextResponse.json({ error: "Usage limit exceeded" }, { status: 402 });
        }
        if (res.result.code === "DISABLED") {
            return NextResponse.json({ error: "API key is disabled" }, { status: 403 });
        }
        if (res.result.code === "EXPIRED") {
            return NextResponse.json({ error: "API key is expired" }, { status: 403 });
        }
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

    if (!req.body) return invalidRequest("Missing request body.");

	const body = await req.json();
    
    if (!body) return invalidRequest("Missing request body.");

    const bodyType = typeof body;
    if (bodyType !== "object") {
        return invalidRequest("Type of body was incorrect. Expected JSON object, got " + bodyType);
    }
    if (!("image_url" in body)) {
        return invalidRequest("Missing 'image_url' field in request body.");
    }

    const imageURL = body.image_url;

    if (!imageURL) {
        return invalidRequest("Missing 'image_url' field in request body.");
    }
    
    const imageURLType = typeof imageURL;
    if (imageURLType !== "string") {
        return invalidRequest("Type of 'image_url' field was incorrect. Expected string, got " + imageURLType);
    }

	const response = await fetch(imageURL, { cache: "force-cache" });

    // TODO - can return a more descriptive error here.
    if (!response.ok) {
        return Response.json(
            { error: "Invalid image URL." },
            { status: 400 }
        );
    }

    const bufferPromise = response.arrayBuffer();
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    const isValidImageFormat = contentType && SUPPORTED_FORMATS.includes(contentType);
    if (!isValidImageFormat) {
        return invalidRequest("Unsupported image format. Supported formats are " + SUPPORTED_FORMATS.join(", "));
    }

    // TODO - get this from the length of the buffer?
    const isValidImageSize = contentLength && parseInt(contentLength) < MAX_IMAGE_SIZE || !contentLength;
    if (!isValidImageSize) {
        invalidRequest("Image size exceeds the maximum limit of 5MB.");
    }

    const buffer = Buffer.from(await bufferPromise);

    const imageName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${contentType.split("/")[1]}`;
    const presignedUrl = await putImageInS3AndGetPresignedUrl(buffer, imageName, contentType);

    const tagsResponse = await openai.responses.create({
        model: "gpt-4.1-nano",
        input: [
            {
                role: "system",
                content: `
                    You are a helpful assistant. Your task is to analyze an image and provide tags based on its content. 
                    The tags should be relevant to the image and should not include any personal information or sensitive data.
                    The tags should be concise and descriptive, ideally 1-2 words longs. 
                    If the image is not very detailed, try to provide tags based on the overall theme or subject of the image.
                    The image will be provided as a URL. Format the tags in a comma separated list.
                    if you cannot see the image, do not make anything up. Return "NO_TAGS".
                    If you can not return tags for any reason, return "NO_TAGS".
                `,
            },
            {
                role: "user",
                content: [
                    { type: "input_text", text: "Analyze the image and provide tags." },
                    { type: "input_image", image_url: presignedUrl, detail: "low" },
                ]
            },
        ],
    });
    const tags = parseTags(tagsResponse);

	if (tags === null) {
		return Response.json(
			{ error: "No tags could be found. Please try again." },
			{ status: 404 }
		);
	}

	return Response.json({ tags });
}
