import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4.1-nano";
const INVALID_RESPONSE = "NO_TAGS";
const USER_PROMPT = "Analyze the image and produce relevant tags";
const SYSTEM_PROMPT = `
    You are a helpful assistant. Your task is to analyze an image and provide tags based on its content. 
    The tags should be relevant to the image and should not include any personal information or sensitive data.
    The tags should be concise and descriptive, ideally 1 word long, at most 2 words.
    If the image is not very detailed, try to provide tags based on the overall theme or subject of the image.
    The image will be provided as a URL. Format the tags in a comma separated list.
    if you cannot see the image, do not make anything up. Return 'NO_TAGS'.
    If you can not return tags for any reason, return 'NO_TAGS'.
`;

export async function getTags(imageUrl: string): Promise<string[]> {
	const response = await openai.responses.create({
		model: MODEL,
		input: [
			{
				role: "user",
				content: [
					{ type: "input_text", text: USER_PROMPT },
					{ type: "input_image", image_url: imageUrl, detail: "low" },
				],
			},
			{
				role: "system",
				content: [{ type: "input_text", text: SYSTEM_PROMPT }],
			},
		],
	});
    const tags = response.output_text;
    if (tags === INVALID_RESPONSE) {
        return [];
    }
    const tagsArray = tags.split(",").map(tag => tag.trim());
    return tagsArray.filter(tag => tag.length > 0);
}
