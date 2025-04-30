import { ApiKeyTier } from "@/lib/ddb";
export function convertTierToUsageAmount(tier: ApiKeyTier) {
    if (tier === "startup") {
        return 5000;
    } else if (tier === "growth") {
        return 10000;
    } else if (tier === "scale") {
        return 100000;
    } else if (tier === "free") {
        return 1000;
    } else {
        return 100;
    }
}

export function getTierRateLimit(tier: ApiKeyTier) {
    if (tier === "startup") {
        return 60;
    } else if (tier === "growth") {
        return 120;
    } else if (tier === "scale") {
        return 200;
    } else if (tier === "free") {
        return 15;
    } else {
        console.error("Somehow an invalid api key tier, defaulting to startup.");
        return 60;
    }
}

export function getPlanCost(planName: ApiKeyTier) {
    switch (planName) {
        case "startup":
            return 10;
        case "growth": 
            return 79;
        case "scale":
            return 149;
        case "free":
            return 0;
        default:
            return 0;
    }
}
