import { ApiKeyTier } from "@/lib/ddb";
export function convertTierToUsageAmount(tier: ApiKeyTier) {
    if (tier === "free") {
        return 100;
    } else if (tier === "startup") {
        return 10000;
    } else if (tier === "scale") {
        return 100000;
    } else {
        return 100;
    }
}

export function getTierRateLimit(tier: ApiKeyTier) {
    if (tier === "free") {
        return 10;
    } else if (tier === "startup") {
        return 60;
    } else if (tier === "scale") {
        return 120;
    } else {
        console.error("Somehow an invalid api key tier, defaulting to free.");
        return 10;
    }
}

export function getPlanCost(planName: string) {
    switch (planName) {
        case "free":
            return 0;
        case "pro":
            return 10;
        case "business":
            return 55;
        default:
            return 0;
    }
}
