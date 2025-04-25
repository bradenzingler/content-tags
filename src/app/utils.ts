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