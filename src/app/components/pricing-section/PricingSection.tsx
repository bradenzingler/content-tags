import { auth, clerkClient } from "@clerk/nextjs/server";
import React from "react";
import PriceOption from "./PriceOption";

export default async function PricingSection() {
	const currUser = await auth();
	const authClient = await clerkClient();

	const userId = currUser.userId;
	const userEmail = userId ? (await authClient.users.getUser(userId)).emailAddresses[0]?.emailAddress : null;

	const pricingOptions = [
		{
			title: "Startup",
			price: 30,
			frequency: "month",
			description: "For solo developers and indie hackers with basic image metadata needs.",
			features: [
				"2,000 API calls",
				"Basic data analysis",
				"Email support",
				"Limited data retention",
                "Per-tag confidence scores",
                "Color profiles",
                "Contextually relevant tags",
                "Text descriptions",
                "Image format, size, and other metadata"
			],
			ctaText: userId ? "Subscribe" : "Start for free",
			isPopular: false,
			href: userId ? `/api/create-checkout-session?tier=startup&email=${userEmail}` : "/sign-up"
		},
		{
			title: "Growth",
			price: 79,
			frequency: "month",
			description: "A plan with advanced features for growing teams and businesses.",
			features: [
				"10,000 API calls",
				"Basic data analysis",
				"Priority email support",
				"30-day data retention",
                "Per-tag confidence scores",
                "Contextually relevant tags",
                "Color profiles",
                "Text descriptions",
                "Image format, size, and other metadata",
                "Custom tags and categories",
			],
			ctaText: userId ? "Subscribe" : "Start for free",
			isPopular: true,
			href: userId ? `/api/create-checkout-session?tier=pro&email=${userEmail}` : "/sign-up"
		},
		{
			title: "Scale",
			price: 209,
			frequency: "month",
			description: "For organizations with advanced metadata requirements.",
			features: [
				"50,000 API calls",
				"Advanced data analysis",
				"Dedicated support line",
				"90-day data retention",
                "Per-tag confidence scores",
                "Color profiles",
                "Contextually relevant tags",
                "Text descriptions",
                "Image format, size, and other metadata",
                "Custom tags and categories",
                "Scene and context detection",
			],
			ctaText: userId ? "Subscribe" : "Start for free",
			isPopular: false,
			href: "/sign-up"
		}
	];

	return (
		<section id="pricing" className="w-11/12 lg:w-5/6 xl:w-3/4">
			<h2 className="text-teal-500 text-center font-bold mb-4 text-lg">
				Pricing
			</h2>
			<h3 className="text-4xl text-center text-white/85 font-bold tracking-tighter mb-12">
				Built to scale with you
			</h3>
			<div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{pricingOptions.map((option, index) => (
					<PriceOption
						key={index}
						title={option.title}
						price={option.price}
						frequency={option.frequency}
						description={option.description}
						features={option.features}
						ctaText={option.ctaText}
						isPopular={option.isPopular}
						href={option.href}
					/>
				))}
			</div>
		</section>
	);
}
