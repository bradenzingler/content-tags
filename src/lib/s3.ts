import { GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

export const s3 = new S3({ region: process.env.AWS_REGION });
const ONE_MINUTE = 60;

export async function putImageInS3AndGetPresignedUrl(
    buffer: string | Uint8Array | Buffer | Readable,
    key: string,
    contentType: string
): Promise<string> {

    const bucketName = process.env.IMAGE_BUCKET;
    if (!bucketName) throw new Error("Missing bucket name");

    await s3.putObject({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType
    });

    const presignedCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    return getSignedUrl(s3, presignedCommand, { expiresIn: ONE_MINUTE });
}
