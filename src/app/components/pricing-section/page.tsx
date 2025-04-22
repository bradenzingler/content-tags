import PriceOption from "./PriceOption";

export default function PricingSection() {
	return (
		<section id="pricing" className="lg:w-5/6 xl:w-3/4">
			<h2 className="text-teal-500 text-center font-bold mb-4 text-lg">
				Pricing
			</h2>
			<h3 className="text-4xl text-center text-white/85 font-bold tracking-tighter">
				Built to scale with you
			</h3>
			<div className="flex flex-col lg:flex-row justify-center items-start mt-8 gap-4">
				<PriceOption
					title="Free"
					price="0"
                    numCredits={80}
					description="For exploration and hobby projects. No credit card required."
					features={["5 requests per minute"]}
				/>
                <PriceOption
					title="Startup"
					price="29"
                    numCredits={8000}
					description="For solo developers and indie hackers with basic needs."
					features={["Basic tag analytics", "20 requests per minute"]}
				/>
                <PriceOption
					title="Growth"
					price="79"
                    numCredits={25000}
					description="For growing businesses with advanced use-cases."
					features={["Advanced tag analytics for your content", "Custom confidence thresholds", "Custom categories", "60 requests per minute"]}
				/>
                <PriceOption
					title="Scale"
					price="149"
                    numCredits={50000}
					description="For high traffic applications and companies."
					features={["Advanced tag analytics for your content", "Custom confidence thresholds", "Custom categories", "Priority support and requests", "120 requests per minute", ]}
				/>
			</div>
		</section>
	);
}
