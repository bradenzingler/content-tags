import PriceOption from "./PriceOption";

export default function PricingSection() {
	return (
		<section id="pricing">
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
					description="For exploration and hobby projects. No credit card required."
					features={["150 text requests", "50 image requests", "5 requests per minute"]}
				/>
                <PriceOption
					title="Startup"
					price="15"
					description="For solo developers and indie hackers"
					features={["10,000 text requests", "5,000 image requests", "20 requests per month", "Faster response times"]}
				/>
                <PriceOption
					title="Scale"
					price="55"
					description="For high traffic applications and businesses"
					features={["Unlimited text requests", "20,000 image requests", "100 requests per month", "Priority support", "Fastest response times"]}
				/>
			</div>
		</section>
	);
}
