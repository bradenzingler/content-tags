import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET_NAME = "content-tagging-image-handling";
const URL_EXPIRATION = 60; // seconds
const s3 = new S3Client();

export async function storeImageInS3(
	imageData: ArrayBuffer,
	imageName: string
): Promise<string> {
	await s3.send(
		new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: imageName,
			Body: Buffer.from(imageData),
		})
	);
	const presignedUrl = await getSignedUrl(
		s3,
		new GetObjectCommand({
			Bucket: BUCKET_NAME,
			Key: imageName,
		}),
		{ expiresIn: URL_EXPIRATION }
	);
	return presignedUrl;
}
