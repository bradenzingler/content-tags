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
