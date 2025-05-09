import { Event } from "./types";

export function parseImageUrl(event: Event): any {
    const body = JSON.parse(event.body || "{}");
    if (!body) return null;
    if (!("image_url" in body)) return null;
    const imageUrl = body.image_url;
    return imageUrl;
}

export function isValidUrl(url: string): boolean {
    if (!url.startsWith("https://")) return false;
    const urlObj = new URL(url);
    if (!urlObj.hostname) return false;
    if (urlObj.protocol !== "https:") return false;
    return true;
}