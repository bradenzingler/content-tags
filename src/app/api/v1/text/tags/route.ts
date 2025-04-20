import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_TEXT_API_KEY });

export async function POST(req: Request) {
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

    if (text.length < 10) {
        return Response.json(
            { error: "Text is too short. Minimum length is 10 characters." },
            { status: 400 }
        );
    }

    if (text.length > 1000) {
        return Response.json(
            { error: "Text is too long. Maximum length is 1000 characters." },
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
                The tags must be accurate and relevant to the content.
                `,
            },
            { role: "user", content: text.trim() },
        ],
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
