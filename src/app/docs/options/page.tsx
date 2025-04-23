import SectionTitle from "@/app/components/docs/SectionTitle";

export default function OptionsPage() {
	return (
		<main className="flex-1 p-8 w-full lg:w-3/4 mx-auto">
			<SectionTitle title="Tagging options" />

			<div className="prose prose-invert max-w-none">
				<p className="mb-4">
					This documentation explains all available options
                    for the API.
				</p>

				<p className="mb-4">
					If there is ever an option that would make your life easier,
                    please reach out.
				</p>

                <p>Work in progress...</p>
				
			</div>
		</main>
	);
}
