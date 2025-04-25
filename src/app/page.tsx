import Link from "next/link";
import { FaTags } from "react-icons/fa";
import Demo from "./components/hero-section/Demo";
import PricingSection from "./components/pricing-section/page";
import { auth } from "@clerk/nextjs/server";
import FeatureSection from "./components/FeatureSection";

export default async function Home() {
	const user = await auth();

	const isSignedIn = user.userId !== null;

	const makeTagsRequest = async (
		content: string,
	): Promise<string[] | null> => {
		"use server";
		const requestUrl = "https://api.inferly.org/image/tags";
		const requestBody = { image_url: content };
		try {
			const response = await fetch(requestUrl, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.TAGS_API_KEY!}`,
				},
				body: JSON.stringify(requestBody),
			});
			const data = await response.json();
            console.log(data);
			if (!response.ok) {
				console.error("Error:", response);
				return null;
			}
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
						Get relevant tags for images with one
						simple API call.
					</h2>
					<Link
						href={isSignedIn ? "/dashboard" : "/sign-in"}
						className="bg-teal-600 hover:bg-teal-600/85 active:bg-teal-600/85
                   text-white font-semibold lg:text-lg rounded-lg px-6 py-3 inline-flex items-center"
					>
						<FaTags className="mr-2 h-5 w-5" />
						Start for free
					</Link>
					<p className="text-white/85 mt-2">
						No credit card required.
					</p>
				</div>

				<Demo makeTagsRequest={makeTagsRequest} />
			</header>

			<FeatureSection
				headline="Enrich your content"
				videoSrc="/demo-1.mov"
				videoSide="left"
				pText="Automatically categorize and tag your content. Spot trends, uncover patterns, and take smarter actions."
				featureList={[
					{
						boldText: "Categorize any format and any content.",
						contentText:
							"Upload image or text - any file format is supported.",
					},
					{
						boldText: "Improve SEO with relevant keywords.",
						contentText:
							"Our tags are contextually aware to maximize your search engine rankings.",
					},
					{
						boldText: "Detect trends and signals.",
						contentText:
							"We don't just detect - we understand what your content means.",
					},
				]}
				buttonText="Enrich my content"
				belowButtonText="No credit card required."
			/>

			<FeatureSection
				headline="Understand your audience"
				videoSrc="/demo-1.mov"
				videoSide="right"
				pText="Learn what your audience cares about by tagging and classifying your most engaging content."
				featureList={[
					{
						boldText: "Reveal top-performing themes.",
						contentText:
							"Find the content types that resonate most across platforms.",
					},
					{
						boldText: "Break down content by topic.",
						contentText:
							"Group blogs, assets, and more into digestible categories.",
					},
					{
						boldText: "Export insights in seconds.",
						contentText:
							"Get CSV's, charts, or dashboards with on click.",
					},
				]}
				buttonText="Start analyzing"
				belowButtonText="Free to try - easy setup."
			/>

			<FeatureSection
				headline="Simplify your content management"
				videoSrc="/demo-1.mov"
				videoSide="left"
				pText="Effortlessly organize and track your content with automated tagging and categorization tools."
				featureList={[
					{
						boldText: "Tag once, organize forever.",
						contentText:
							"Let our intelligent tagging system categorize your content in seconds.",
					},
					{
						boldText: "Search and filter with ease.",
						contentText:
							"Find exactly what you need in your library with smart filters and tags.",
					},
					{
						boldText: "Automatic content tracking.",
						contentText:
							"Monitor the performance and evolution of your content automatically.",
					},
				]}
				buttonText="Start organizing"
				belowButtonText="No setup fee — get started today"
			/>

			<div className="border-teal-100/15 border-b border-dashed mb-24 w-full mt-24"></div>

			<PricingSection />
		</main>
	);
}
