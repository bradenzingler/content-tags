import { Rekognition } from "@aws-sdk/client-rekognition";

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/rekognition/command/DetectLabelsCommand/
const client = new Rekognition();

export async function POST(req: Request) {


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
		MinConfidence: 70,
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
