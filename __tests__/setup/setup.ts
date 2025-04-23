import { beforeEach } from "node:test";
import { vi } from "vitest";

vi.mock("@/lib/unkey", () => ({
	unkey: {
		keys: {
			verify: vi.fn(),
		},
	},
	API_ID: "mock-api-id",
}));

vi.mock("openai", () => {
	const createMock = vi.fn();
	return {
        OpenAI: vi.fn().mockImplementation(() => ({
            responses: {
                create:  createMock,
            },
        })),
        __esModule: true,
        createMock,
	};
});

vi.mock("@/lib/s3", () => ({
    putImageInS3AndGetPresignedUrl: vi.fn(),
}));

beforeEach(() => {
	vi.resetAllMocks();
});
