import { getByApiKey, incrementRequestCount, resetRequestWindow } from "./ddb";

const RATE_LIMIT = 10;
const VALID_DEMO_DOMAINS = ['https://content-tags.vercel.app/'];

export async function authenticateRequest(req: Request) {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
        return { msg: "API key is required", status: 401 };
    }

    if (apiKey === "public-demo-key") {
        if (process.env.NODE_ENV === "development") {
            VALID_DEMO_DOMAINS.push("http://localhost:3000");
        }

        if (!VALID_DEMO_DOMAINS.includes(req.headers.get("origin") || "")) {
            return { msg: "Invalid API key", status: 401 };
        }
        return { msg: "Public demo key is valid", status: 200 };
    }

    if (!apiKey.startsWith("tags_")) {
        return { msg: "Invalid API key", status: 401 };
    }

    const keyData = await getByApiKey(apiKey);

    if (!keyData) {
        return { msg: "Invalid API key", status: 401 };
    }

    if (!keyData.enabled) {
        return { msg: "API key is not enabled", status: 401 };
    }

    const isWithinRequestWindow = keyData.usageWindow >= Date.now(); 

    if (isWithinRequestWindow) {
        const rateLimitHasExceeded = keyData.requestCount >= RATE_LIMIT;
        if (rateLimitHasExceeded) {
            return { msg: "Rate limit exceeded", status: 429 };
        }

        await incrementRequestCount(apiKey);
    } else {
        await resetRequestWindow(apiKey);
    }

    return { msg: "API key is valid", status: 200 };
}