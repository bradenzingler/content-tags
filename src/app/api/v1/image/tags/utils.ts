import { DetectLabelsCommandOutput, Label } from "@aws-sdk/client-rekognition";

export function getApiKeyFromAuthorizationHeader(req: Request): string | null {
    const authorizationHeader = req.headers.get("Authorization");
    if (!authorizationHeader) return null;

    const apiKey = authorizationHeader.replace("Bearer ", "");
    return apiKey;
}

export function parseTagsFromLabels(labels: DetectLabelsCommandOutput): string[] | null {
    const parsedLabels = labels.Labels ?? null;
    if (!parsedLabels) return null;

    const tags = [];
    for (const label of parsedLabels) {
        const labelName = label.Name;
        if (!labelName) continue;

        tags.push(labelName.toLowerCase());

        const parents = parseParentsFromLabel(label);
        if (!parents) continue;
        parents.forEach((parent) => tags.push(parent));
    }

    return tags;
}

export function parseParentsFromLabel(label: Label): string[] | null {
    const labelParents = label.Parents ?? null;
    if (!labelParents) return null;
    
    const parents = [];
    for (const parent of labelParents) {
        const parentName = parent.Name ?? null;
        if (!parentName) continue;
        parents.push(parentName.toLowerCase());
    }
    if (parents.length === 0) return null;
    return parents;
}