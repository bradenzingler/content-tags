import { API_ID, unkey } from "@/lib/unkey";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_TEXT_API_KEY });
const TEXT_CREDIT_COST = 1;

export async function POST(req: NextRequest) {
    const apiKey =
		req.headers.get("Authorization")?.replace("Bearer ", "") ?? null;
	if (apiKey === null) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

    const res = await unkey.keys.verify({
		key: apiKey,
		remaining: { cost: TEXT_CREDIT_COST },
		apiId: API_ID,
	});

    if (res.error) {
        console.error("An error occurred with Unkey:", res.error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    if (!res.result.valid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

	const { text } = await req.json();

	if (!text) {
		return Response.json(
			{ error: "\'text\' field is required" },
			{ status: 400 }
		);
	}

    if (typeof text !== "string") {
        return Response.json(
            { error: "Invalid type for \'text\' field. Expected string." },
            { status: 400 }
        );
    }

    if (text.length < 1) {
        return Response.json(
            { error: "Text is too short. Minimum length is 10 characters." },
            { status: 400 }
        );
    }

    if (text.length > 10000) {
        return Response.json(
            { error: "Text is too long. Maximum length is 10,000 characters." },
            { status: 400 }
        );
    }

	const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
            {
                role: "system",
                content: `
                You are a text content tagger. Provided a text input, you will return 
                a comma separated list of 8-10 tags that best describe the content of the text.
                The tags must be accurate and relevant to the content. The tags should be
                1-2 words long, never any longer. If they must be longer, just remove them
                from the list. The tags should be about the general concept of the text.
                If there is not enough context to generate tags, simply output "NA" and nothing else.
                `,
            },
            { role: "user", content: text.trim() },
        ],
        temperature: 0.5,
        seed: 42,
    });

	const tags = response.choices[0].message.content?.split(",").map((tag) => tag.trim().toLowerCase()) || [];
	if (!tags || !tags.length) {
		return Response.json(
			{ error: "No tags could be found." },
			{ status: 404 }
		);
	}

	return Response.json({ tags });
}
