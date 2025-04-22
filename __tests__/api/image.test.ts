import { POST } from "@/app/api/v1/image/tags/route";
import { NextRequest } from "next/server";
import { describe, expect, test, Mock } from "vitest";
// @ts-expect-error this is exported as a mock from ../setups.ts
import { detectLabelsMock } from "@aws-sdk/client-rekognition";

describe("Image tags POST route", () => {
	test("Missing API key receives 401 response", async () => {
		const req = new NextRequest("https://test123.com", { method: "POST" });
		const res = await POST(req);
		expect(res.status).toBe(401);
		const json = await res.json();
		expect(json).toEqual({ error: "Unauthorized" });
	});

	test("Invalid API key receives 401 response", async () => {
		const mockVerify = (await import("@/lib/unkey")).unkey.keys
			.verify as Mock;
		mockVerify.mockResolvedValue({
			result: { valid: false },
			error: null,
		});
		const req = new NextRequest("https://test123.com", {
			method: "POST",
			headers: {
				Authorization: "Bearer tags_invalid-api-key",
			},
		});
		const res = await POST(req);
		expect(res.status).toBe(401);
		const json = await res.json();
		expect(json).toEqual({ error: "Unauthorized" });
	});

	test("Error while validating API key returns 500 response", async () => {
		const mockVerify = (await import("@/lib/unkey")).unkey.keys
			.verify as Mock;
		mockVerify.mockResolvedValue({
			result: null,
			error: "Some error happened",
		});
		const req = new NextRequest("https://test123.com", {
			method: "POST",
			headers: {
				Authorization: "Bearer tags_valid-api-key",
			},
		});
		const res = await POST(req);
		expect(res.status).toBe(500);
		const json = await res.json();
		expect(json).toEqual({ error: "Internal Server Error" });
	});

	test.each([
		[null, 400, { error: "Missing request body." }],
		[undefined, 400, { error: "Missing request body." }],
		[
			"string",
			400,
			{ error: "Invalid body type, expected object, got string" },
		],
		[
			{ test: "some random value" },
			400,
			{ error: "Invalid request, missing 'image_url' field." },
		],
		[
			{ image_url: 4 },
			400,
			{
				error: "Invalid request, expected string for image_url, got number",
			},
		],
		[
			{ image_url: null },
			400,
			{ error: "Invalid request, missing 'image_url' field." },
		],
		[
			{ image_url: undefined },
			400,
			{ error: "Invalid request, missing 'image_url' field." },
		],
		[
			{ image_url: "" },
			400,
			{ error: "Invalid request, missing 'image_url' field." },
		],
	])(
		"body=%s returns status %s with message %s",

		async (body, expectedStatus, expectedResponse) => {
			const mockVerify = (await import("@/lib/unkey")).unkey.keys
				.verify as Mock;
			mockVerify.mockResolvedValue({
				result: { valid: true },
				error: null,
			});
			const req = new NextRequest("https://test123.com", {
				method: "POST",
				headers: {
					Authorization: "Bearer tags_valid-api-key",
				},
				body: body ? JSON.stringify(body) : null,
			});
			const res = await POST(req);
			expect(res.status).toBe(expectedStatus);
			const json = await res.json();
			expect(json).toEqual(expectedResponse);
		}
	);

	test("Invalid image format returns 400", async () => {
		const mockVerify = (await import("@/lib/unkey")).unkey.keys
			.verify as Mock;
		mockVerify.mockResolvedValue({
			result: { valid: true },
			error: null,
		});
		const req = new NextRequest("https://test123.com", {
			method: "POST",
			headers: {
				Authorization: "Bearer tags_valid-api-key",
			},
			body: JSON.stringify({
				image_url: "https://www.gstatic.com/webp/gallery/1.webp",
			}),
		});
		const res = await POST(req);
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json).toEqual({
			error: "Unsupported image format. Supported formats are image/jpeg, image/png",
		});
	});

	test.each([
		[
			[
				{
					Name: "Person",
					Confidence: 99,
					Parents: [{ Name: "Human" }],
				},
				{ Name: "Dog", Confidence: 99, Parents: [{ Name: "Animal" }] },
				{ Name: "Cat", Confidence: 99, Parents: [] },
			], ["person", "human", "dog", "animal", "cat"],
            [
				{ Name: "Person", Confidence: 99 },
				{ Name: "Dog", Confidence: 99 },
				{ Name: "Cat", Confidence: 99 },
			], ["person", "dog", "cat"],
		],
	])("Valid request returns tags successfully", async (labels, expectedLabels) => {
		const mockVerify = (await import("@/lib/unkey")).unkey.keys
			.verify as Mock;
		mockVerify.mockResolvedValue({
			result: { valid: true },
			error: null,
		});

		(detectLabelsMock as Mock).mockResolvedValue({ Labels: labels });

		const req = new NextRequest("https://test123.com", {
			method: "POST",
			headers: {
				Authorization: "Bearer tags_valid-api-key",
			},
			body: JSON.stringify({
				image_url: "https://www.gstatic.com/webp/gallery/1.jpg",
			}),
		});
		const res = await POST(req);
		expect(res.status).toBe(200);
		const json = await res.json();
        expect (json).toEqual({
            tags: expectedLabels
        });
	});
});
