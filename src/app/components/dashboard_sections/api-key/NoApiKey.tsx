import Link from "next/link";

export default function NoApiKey({ createNewKey }: { createNewKey: () => Promise<void> }) {
	return (
		<div className="mt-8 flex flex-col items-center">
			<p className="text-gray-100">You need to subscribe to a plan to generate an API key.</p>
			<Link
				href="/#pricing"
				className="bg-teal-600 hover:bg-teal-600/85 transition-colors cursor-pointer text-white font-semibold rounded-md px-2 py-1 mt-4"
			>
				View Pricing Plans
			</Link>
		</div>
	);
}
