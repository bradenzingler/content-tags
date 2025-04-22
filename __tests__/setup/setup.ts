import { beforeEach } from "node:test";
import { vi } from "vitest";

vi.mock("@/lib/unkey", () => ({
    unkey: {
        keys: {
            verify: vi.fn()
        },
    },
    API_ID: "mock-api-id"
}));

vi.mock("@aws-sdk/client-rekognition", () => {
    const detectLabelsMock = vi.fn();
    return {
        Rekognition: vi.fn().mockImplementation(() => ({
            detectLabels: detectLabelsMock,
        })),
        __esModule: true,
        detectLabelsMock,
    };
});

beforeEach(() => {
    vi.resetAllMocks();
});