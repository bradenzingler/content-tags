import SectionTitle from "@/app/components/docs/SectionTitle";

export default function RateLimitsPage() {
	return (
		<main className="flex-1 p-8 w-full lg:w-3/4 mx-auto">
			<SectionTitle title="Rate limits" />

			<div className="prose prose-invert max-w-none">
				<p className="mb-4">
					This documentation explains rate limits for the API.
				</p>

                <p className="mb-4">
                    If you are ever restricted by the rate limits for a project,
                    please reach out to me. We can discuss a custom plan that better fits your needs.
				</p>

				<p className="mb-4">
					Rate limits are applied based on the tier of your API key.
                    For example, a free API key can make up to 5 requests per 
                    minute. Upgrading to the Growth tier increases the limit
                    to 60 requests per minute.
				</p>

			</div>
		</main>
	);
}
