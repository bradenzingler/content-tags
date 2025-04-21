import { API_ID, unkey } from "@/lib/unkey";
import { Rekognition } from "@aws-sdk/client-rekognition";
import { NextRequest, NextResponse } from "next/server";

const client = new Rekognition();
const IMAGE_CREDIT_COST = 2;

export async function POST(req: NextRequest) {
	const apiKey =
		req.headers.get("Authorization")?.replace("Bearer ", "") ?? null;
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
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    if (!res.result.valid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

	const { image_url } = await req.json();

	if (!image_url) {
		return Response.json(
			{ error: "'image_url' field is required" },
			{ status: 400 }
		);
	}

	const response = await fetch(image_url);
	const imageArrayBuffer = await response.arrayBuffer();

	const labels = await client.detectLabels({
		Image: {
			Bytes: new Uint8Array(imageArrayBuffer),
		},
		MaxLabels: 10,
		MinConfidence: 80,
	});

	const tags = labels.Labels?.map((label) => label.Name?.toLowerCase()) || [];
	if (!tags.length) {
		return Response.json(
			{ error: "No tags could be found" },
			{ status: 404 }
		);
	}

	return Response.json({ tags });
}
