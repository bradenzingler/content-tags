import { API_ID, unkey } from "@/lib/unkey";
import { Rekognition } from "@aws-sdk/client-rekognition";
import { NextRequest, NextResponse } from "next/server";
import { getApiKeyFromAuthorizationHeader, parseTagsFromLabels } from "./utils";

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/rekognition/
// https://docs.aws.amazon.com/rekognition/latest/APIReference/API_DetectLabels.html
const client = new Rekognition();
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
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

    if (!req.body) {
        return NextResponse.json({
            error: "Missing request body."
        }, { status: 400 });
    }

	const body = await req.json();
    if (!body) {
        return NextResponse.json({
            error: "Missing request body."
        }, { status: 400 });
    }

    if (typeof body !== "object") {
        return NextResponse.json({
            error: "Invalid body type, expected object, got " + typeof body
        }, { status: 400 });
    }

    if (!("image_url" in body)) {
        return NextResponse.json({
            error: "Invalid request, missing 'image_url' field."
        }, { status: 400 });
    }
    
    const imageURL = body.image_url;

    if (!imageURL) {
		return Response.json(
			{ error: "Invalid request, missing 'image_url' field." },
			{ status: 400 }
		);
	}

    if (typeof imageURL !== "string") {
        return Response.json(
			{ error: "Invalid request, expected string for image_url, got " + typeof imageURL },
			{ status: 400 }
		);
    }

	const response = await fetch(imageURL);
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    const isValidImageFormat = contentType && SUPPORTED_FORMATS.includes(contentType);
    if (!isValidImageFormat) {
        return NextResponse.json({
            error: "Unsupported image format. Supported formats are " + SUPPORTED_FORMATS.join(", ")
        }, { status: 400 });
    }

    const isValidImageLength = contentLength && parseInt(contentLength) < MAX_IMAGE_SIZE;
    if (!isValidImageLength) {
        return NextResponse.json({
            error: "Image too large, maximum size is 5MB."
        }, { status: 400 });
    }

	const imageArrayBuffer = await response.arrayBuffer();

	let labels;
	try {
		labels = await client.detectLabels({
			Image: {
				Bytes: new Uint8Array(imageArrayBuffer),
			},
			MaxLabels: 10,
			MinConfidence: 80,
		});
	} catch (error) {
		console.error(`An error occurred while getting labels: ${error}`);
		return NextResponse.json(
			{
				error: "Sorry, something went wrong. Please try again.",
			},
			{ status: 500 }
		);
	}

	const tags = parseTagsFromLabels(labels);
	if (tags === null) {
		return Response.json(
			{ error: "No tags could be found. Please try again." },
			{ status: 404 }
		);
	}

	return Response.json({ tags });
}
