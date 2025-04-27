"use client";
import { ApiKeyTier } from "@/lib/ddb";
import PriceOption from "./PriceOption";
import React from "react";

export default function PricingSection({
	currentTier,
}: {
	currentTier?: ApiKeyTier;
}) {
	// return (
	//     <section id="pricing" className="lg:w-5/6 xl:w-3/4">
	//         <h2 className="text-teal-500 text-center font-bold mb-4 text-lg">
	//             Pricing
	//         </h2>
	//         <h3 className="text-4xl text-center text-white/85 font-bold tracking-tighter">
	//             Built to scale with you
	//         </h3>
	//         <div className="flex flex-col lg:flex-row justify-center items-start mt-8 gap-4">
	//             <PriceOption
	//                 buttonText={"Let's build"}
	//                 disabled={currentTier === "free"}
	//                 title="free"
	//                 description="For exploration and hobby projects. No credit card required."
	//                 features={["10 requests per minute"]}
	//             />
	//             <PriceOption
	//                 buttonText="Let's build"
	//                 disabled={currentTier === "startup"}
	//                 title="startup"
	//                 description="For solo developers and indie hackers with basic needs."
	//                 features={["Basic tag analytics", "20 requests per minute"]}
	//             />
	//             <PriceOption
	//                 buttonText="Let's build"
	//                 disabled={currentTier === "growth"}
	//                 title="growth"
	//                 description="For growing businesses with advanced use-cases."
	//                 features={["Advanced tag analytics for your content", "Custom categories", "60 requests per minute"]}
	//             />
	//             <PriceOption
	//                 buttonText="Let's build"
	//                 disabled={currentTier === "scale"}
	//                 title="scale"
	//                 description="For high traffic applications and companies."
	//                 features={["Advanced tag analytics for your content", "Custom categories", "Priority support and requests", "120 requests per minute", ]}
	//             />
	//         </div>
	//     </section>
	// );
	return (
		<section id="pricing" className="lg:w-5/6 xl:w-3/4">
			<h2 className="text-teal-500 text-center font-bold mb-4 text-lg">
				Pricing
			</h2>
			<h3 className="text-4xl text-center text-white/85 font-bold tracking-tighter mb-12">
				Built to scale with you
			</h3>
			{React.createElement("stripe-pricing-table", {
				"pricing-table-id": "prctbl_1RIb6fIdMOU0zo25MZCI5QNP",
				"publishable-key":
					"pk_test_51RIa7PIdMOU0zo25f7Lapvx2rKwqni5sv5UBIfZVzS126YcEfyaDpfDyySaz16QJz9i5hbSTcPcjvNzfBhCQoELx003KfQfrpC",
			})}
		</section>
	);
}
