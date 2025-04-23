import OpenAI from "openai";

export function getApiKeyFromAuthorizationHeader(req: Request): string | null {
    const authorizationHeader = req.headers.get("Authorization");
    if (!authorizationHeader) return null;

    const apiKey = authorizationHeader.replace("Bearer ", "");
    return apiKey;
}

export function parseTags(response: OpenAI.Responses.Response): string[] | null {
    const output = response.output_text ?? null;
    console.log("Output:", output);
    if (!output) return null;

    const parsedTags = output.split(",");
    if (parsedTags.length === 0) return null;
    if (parsedTags[0] === "NO_TAGS") return null;

    const tags = parsedTags.map(tag => tag.trim().toLowerCase());

    return Array.from(new Set(tags));
}