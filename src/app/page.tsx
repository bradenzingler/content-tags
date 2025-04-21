"use client";
import Link from "next/link";
import { FaTags } from "react-icons/fa";
import Demo from "./components/hero-section/Demo";
import PricingSection from "./components/pricing-section/page";
import { useUser } from "@clerk/nextjs";

export default function Home() {
    const user = useUser();

	return (
		<main className="flex flex-col justify-center items-center mt-36 mb-24">
			<header className="flex flex-col mb-24 md:mb-72 lg:flex-row w-11/12 lg:w-10/12 xl:w-7/12 items-center justify-between gap-12">
				<div className="w-full lg:w-1/2">
					<h1 className="text-5xl tracking-tighter md:text-6xl font-extrabold text-white">
						Turn content into context
					</h1>
					<h2 className="text-white/75 mt-4 mb-8 md:text-xl">
						Generate relevant tags for text and images with one
						simple API call.
					</h2>
					<Link
						href={user.isSignedIn ? "/dashboard" : "/sign-in"}
						className="bg-teal-600 hover:bg-teal-600/85 active:bg-teal-600/85
                   text-white font-semibold lg:text-lg rounded-lg px-6 py-3 inline-flex items-center"
					>
						<FaTags className="mr-2 h-5 w-5" />
						Tag my content
					</Link>
				</div>

				<Demo />
			</header>

            <PricingSection />
		</main>
	);
}
