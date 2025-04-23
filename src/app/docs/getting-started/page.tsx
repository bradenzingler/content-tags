import SectionTitle from "@/app/components/docs/SectionTitle";
import Link from "next/link";

export default function GettingStartedPage() {
	return (
		<main className="flex-1 p-8 w-full lg:w-3/4 mx-auto">
			<SectionTitle title="Understand, categorize, and label your images" />

			<div className="prose prose-invert max-w-none">
				<p className="mb-4">
					You can use the API to automatically categorize and label
					your images and text content with relevant tags, making it
					easier to organize and search through your content. It can
					also be used to enhance the SEO of your site, adding
					relevant keywords to your blog posts or similar content.
				</p>

				<p className="mb-4">
					No matter your use case, I&apos;ve got you covered. And if
					you ever feel that a feature is missing, please reach out -
					I will help as fast as possible.
				</p>

				<h3 className="text-lg font-medium mt-6 mb-2">Requests</h3>
				<p className="mb-4">
					The Inferly API supports POST requests. To get tags for an
					image, send a request to:
				</p>
				<pre>
					<code className="text-teal-50 text-sm shadow-lg flex p-4 rounded-md bg-gray-800">
						{`POST https://api.inferly.com/image/tags \
                            \nContent-Type: application/json \
                            \nAuthorization: Bearer YOUR_API_KEY \
                            \n{\
                            \n\t...[options]\
                            \n}\
                            `}
					</code>
				</pre>
				<p className="text-sm text-white/85 mt-2">
					Gets tags for an image
				</p>

				<h3 className="text-lg font-medium mt-6 mb-2">
					Authentication
				</h3>
				<p className="mb-4">
					To use the API, you&apos;ll need to get an API key from your
					dashboard. Include the access token in your header as a
					bearer token. As the Inferly Tags API is currently in beta,
					please reach out directly if you&apos;d like to get access.
				</p>

				<h3 className="text-lg font-medium mt-6 mb-2">Basic example</h3>
				<pre className="bg-gray-800 language-js p-4 text-xs text-teal-50 lg:text-sm rounded-md overflow-x-auto mb-4">
					{`fetch("https://api.inferly.com/image/tags", {\n\t"method": "POST",\n\t"headers": { \n\t\t"Authorization": "Bearer YOUR API KEY", \n\t\t"Content-Type": "application/json" \n\t}\n})\n\t.then((response) => response.json())\n\t.then((data) => console.log(data));`}
				</pre>
				<h3 className="text-lg font-medium mt-6 mb-2">
					Basic response
				</h3>
				<p>
					The API response can vary depending on the specified
					options. Here is a basic example for the request made above.
					For more response formats and options, please refer to the{" "}
					<Link
						href="/docs/options"
						className="text-teal-500 hover:underline"
					>
						options documentation
					</Link>
				</p>
				<pre className="bg-gray-800 language-js mt-2 p-4 text-xs text-teal-50 lg:text-sm rounded-md overflow-x-auto mb-4">
					{`{ "tags": ["beach", "sunset", "ocean", "vacation"] }`}
				</pre>
			</div>
		</main>
	);
}
