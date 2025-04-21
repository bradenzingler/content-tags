import Link from "next/link";
import { FaTags } from "react-icons/fa";
import Demo from "./components/hero-section/Demo";
import PricingSection from "./components/pricing-section/page";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
	const user = await auth();

	const isSignedIn = user.userId !== null;

	const makeTagsRequest = async (
		content: string,
		inputType: "text" | "image"
	): Promise<string[] | null> => {
        "use server";
        const requestUrl = inputType === "text" ? "/api/v1/text/tags/" : "/api/v1/image/tags/";
        const requestBody = inputType === "text" ? { text: content } : { image_url: content };
        
        try {
            const response = await fetch(process.env.URL + requestUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.TAGS_API_KEY!}`,
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                console.error("Error:", response.statusText);
                return null;
            }
            const data = await response.json();
            return data.tags;
        } catch (error) {
            console.error("Error while generating tags:", error);
            return null;
        }
	};

	return (
		<main className="flex flex-col justify-center items-center mt-36 mb-24">
			<header
				className="flex flex-col mb-24 md:mb-72 lg:flex-row w-11/12 
            lg:w-10/12 xl:w-7/12 items-center justify-between gap-12"
			>
				<div className="w-full lg:w-1/2">
					<h1 className="text-5xl tracking-tighter md:text-6xl font-extrabold text-white">
						Turn content into context
					</h1>
					<h2 className="text-white/75 mt-4 mb-8 md:text-xl">
						Get relevant tags for text and images with one simple
						API call.
					</h2>
					<Link
						href={isSignedIn ? "/dashboard" : "/sign-in"}
						className="bg-teal-600 hover:bg-teal-600/85 active:bg-teal-600/85
                   text-white font-semibold lg:text-lg rounded-lg px-6 py-3 inline-flex items-center"
					>
						<FaTags className="mr-2 h-5 w-5" />
						Tag my content
					</Link>
				</div>

				<Demo makeTagsRequest={makeTagsRequest} />
			</header>

			<div className="border-teal-100/15 border-b border-dashed mb-24 w-full"></div>

			<PricingSection />
		</main>
	);
}
