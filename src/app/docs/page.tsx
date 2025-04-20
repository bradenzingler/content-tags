"use client";
import { useState } from "react";

type Section = {
	navTitle: string;
	title: string;
	content: React.ReactNode;
};
type SectionKey = "getting-started" | "image-tags" | "text-tags";

export default function DocsPage() {
	const [activeSection, setActiveSection] = useState("getting-started");

	const sections: Record<SectionKey, Section> = {
		"getting-started": {
			navTitle: "Getting started",
			title: "Understand, categorize, and label your content",
			content: (
				<>
					<p className="mb-4">
						Inferly helps you automatically categorize and label
						your images and text content with relevant tags, making
						it easier to organize and search through your content.
					</p>

					<h3 className="text-lg font-medium mt-6 mb-2">
						Authentication
					</h3>
					<p className="mb-4">
						To use the API, you&apos;ll need to get an API key from
						your dashboard. As Inferly is currently in beta, please
						reach out directly if you&apos;d like to get access.
					</p>

					<h3 className="text-lg font-medium mt-6 mb-2">Basic example</h3>
					<pre className="bg-gray-800 p-4 text-xs lg:text-sm rounded-md overflow-x-auto text-green-400 mb-4">
						{`fetch("https://inferly.dev/api/v1/image/tags", {\n\t"headers": { "x-api-key": "YOUR API KEY" }\n})\n\t.then((response) => response.json())\n\t.then((data) => console.log(data));`}
					</pre>
				</>
			),
		},
		"image-tags": {
			navTitle: "Image tags",
			title: "Image Tags",
			content: (
				<>
					<p className="mb-4">
						Our image tagging system can identify objects, scenes,
						colors, and more in your images.
					</p>

					<h3 className="text-lg tracking-tight font-medium mt-6 mb-2">
						Basic Usage
					</h3>
					<p className="mb-4">
						Image inputs support <code>base64url</code>,{" "}
						<code>png</code>, <code>jpeg</code>, and{" "}
						<code>webp</code> files currently.
					</p>
					<pre className="bg-gray-800 p-4 text-xs lg:text-sm overflow-x-auto rounded-md text-green-400 mb-4">
						{`const tags = await fetch("https://inferly.dev/api/v1/image/tags", {\n    method: "POST",\n    headers: { "x-api-key": "YOUR API KEY" },\n    body: JSON.stringify({ image_url: "https://example.com/image.jpg" })\n});`}
					</pre>

					<h3 className="text-lg font-medium mt-6 mb-2">
						Response Format
					</h3>
					<p className="mb-2">
						The API returns an array of tags with confidence scores:
					</p>
					<pre className="bg-gray-800 p-4 text-xs lg:text-sm overflow-x-auto rounded-md text-green-400 mb-4">
						{`[\n\t{ tag: "beach", confidence: 0.98 },\n\t{ tag: "sunset", confidence: 0.95 },\n\t{ tag: "ocean", confidence: 0.92 },\n\t{ tag: "vacation", confidence: 0.87 }\n]`}
					</pre>
				</>
			),
		},
		"text-tags": {
			navTitle: "Text tags",
			title: "Text Tags",
			content: (
				<>
					<p className="mb-4">
						Our text tagging system identifies topics, sentiment,
						entities, and keywords in your text content.
					</p>

					<h3 className="text-lg font-medium mt-6 mb-2">
						Basic Usage
					</h3>
                    <p className="mb-4">
						Text inputs currently support any text from 10 to 5,000 characters.
					</p>
					<pre className="bg-gray-800 p-4 text-xs lg:text-sm rounded-md overflow-x-auto text-green-400 mb-4">
						{`const tags = await fetch("https://inferly.dev/api/v1/text/tags", {\n    method: "POST",\n    headers: { "x-api-key": "YOUR API KEY" },\n    body: JSON.stringify({ text: "Hello world!" })\n});`}
					</pre>

					<h3 className="text-lg font-medium mt-6 mb-2">
						Response Format
					</h3>
					<p className="mb-2">
						The API returns an array of 6-12 tags:
					</p>
					<pre className="bg-gray-800 p-4 text-xs lg:text-sm rounded-md overflow-x-auto text-green-400 mb-4">
						{`[\n\t"greeting",\n\t"hello",\n\t"world",\n\t"introduction",\n\t"basic",\n\t"programming",\n\t"message"\n]`}
					</pre>
				</>
			),
		},
	};

	return (
		<div className="flex flex-col lg:flex-row items-center lg:items-start mt-16 w-full overflow-none md:w-3/4 lg:w-7/12 mx-auto text-white/90">
			<aside className="p-6 w-full lg:w-1/4">
				<div className="mb-8">
					<h3 className="text-lg font-bold text-white/95">
						Documentation
					</h3>
				</div>

				<nav>
					<ul className="space-y-2">
						{Object.keys(sections).map((key: string) => (
							<li key={key}>
								<button
									onClick={() => setActiveSection(key)}
									className={`w-full text-left px-4 py-2 border border-white/25 cursor-pointer rounded-lg transition-colors ${
										activeSection === key
											? "bg-teal-500/85 text-white hover:bg-teal-500/90"
											: "text-white/80 hover:border-white/50"
									}`}
								>
									{sections[key as SectionKey].navTitle}
								</button>
							</li>
						))}
					</ul>
				</nav>
			</aside>

			<main className="flex-1 p-8 w-full lg:w-3/4 mx-auto">
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-white/95 tracking-tight">
						{sections[activeSection as SectionKey].title}
					</h1>
					<div className="h-0.5 w-1/3 bg-teal-500/50 mt-2 rounded-full"></div>
				</div>

				<div className="prose prose-invert max-w-none">
					{sections[activeSection as SectionKey].content}
				</div>
			</main>
		</div>
	);
}
