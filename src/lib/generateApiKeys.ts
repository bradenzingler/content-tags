import { randomBytes } from "crypto";

export function generateApiKey() {
    return `tags_${randomBytes(64).toString("hex")}`;
}