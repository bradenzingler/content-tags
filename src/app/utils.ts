import { ApiKeyTier } from "@/lib/ddb";
export function convertTierToUsageAmount(tier: ApiKeyTier) {
    if (tier === "free") {
        return 100;
    } else if (tier === "startup") {
        return 5000;
    } else if (tier === "growth") {
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
    } else if (tier === "growth") {
        return 120;
    } else if (tier === "scale") {
        return 200;
    } else {
        console.error("Somehow an invalid api key tier, defaulting to free.");
        return 10;
    }
}

export function getPlanCost(planName: ApiKeyTier) {
    switch (planName) {
        case "free":
            return 0;
        case "startup":
            return 10;
        case "growth": 
            return 79;
        case "scale":
            return 149;
        default:
            return 0;
    }
}
