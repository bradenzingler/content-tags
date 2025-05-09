import { createHash } from "crypto";
import { Event } from "./types";

export function parseImageUrl(event: Event): any {
	const body = JSON.parse(event.body || "{}");
	if (!body) return null;
	if (!("image_url" in body)) return null;
	const imageUrl = body.image_url;
	return imageUrl;
}

export function isBase64ImageUrl(url: string): boolean {
	if (!url.startsWith("data:image/")) return false;
	const base64Pattern = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+$/;
	return base64Pattern.test(url);
}

export function isValidUrl(url: string): boolean {
	if (!url.startsWith("https://")) return false;
	const urlObj = new URL(url);
	if (isBase64ImageUrl(url)) return true;
	if (!urlObj.hostname) return false;
	if (urlObj.protocol !== "https:") return false;
	return true;
}

export function getMD5Hash(url: string): string {
    return createHash("md5").update(url).digest("hex");
}

function getBase64ImageData(url: string): ArrayBuffer | null {
    const base64Data = url.split(",")[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function fetchImage(url: string): Promise<ArrayBuffer | null> {
    if (isBase64ImageUrl(url)) return getBase64ImageData(url);
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return await response.arrayBuffer();
    } catch (error) {
        console.error("Error fetching image:", error);
        return null;
    }
}