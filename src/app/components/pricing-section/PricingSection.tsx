"use client";
import { useUser } from "@clerk/nextjs";
import React from "react";

export default function PricingSection() {
    const user = useUser();
	return (
		<section id="pricing" className="w-full lg:w-5/6 xl:w-3/4">
			<h2 className="text-teal-500 text-center font-bold mb-4 text-lg">
				Pricing
			</h2>
			<h3 className="text-4xl text-center text-white/85 font-bold tracking-tighter mb-12">
				Built to scale with you
			</h3>
			{React.createElement("stripe-pricing-table", {
				"pricing-table-id": "prctbl_1RIb6fIdMOU0zo25MZCI5QNP",
                "client-reference-id": user.user?.id ?? null,
                "customer-email": user.user?.primaryEmailAddress ?? null,
				"publishable-key":
					"pk_test_51RIa7PIdMOU0zo25f7Lapvx2rKwqni5sv5UBIfZVzS126YcEfyaDpfDyySaz16QJz9i5hbSTcPcjvNzfBhCQoELx003KfQfrpC",
			})}
		</section>
	);
}
