import UsageBar from "@/app/components/dashboard_sections/dashboard/UsageBar";
import { createOrGetUserApiKeyInfo } from "@/lib/ddb";
import { auth, clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";
import { FaArrowRight, FaExternalLinkAlt } from "react-icons/fa";

export default async function BillingPage() {
	const user = await auth();
	const client = await clerkClient();
	const clerkUser = await client.users.getUser(user.userId!);
	const stripeId = clerkUser.privateMetadata.stripeId as string;
	const apiKeyInfo = await createOrGetUserApiKeyInfo(user.userId!, stripeId);

	return (
		<section className="flex flex-col w-full md:w-1/2 md:mx-8">
			<header className="flex items-center justify-between">
				<h1 className="text-white text-2xl tracking-tight font-semibold">
					Billing
				</h1>
				<button
					className="cursor-pointer flex items-center gap-2
                        rounded-md px-4 py-1 bg-teal-500/85 text-white
                         hover:bg-teal-500/90 font-semibold active:scale-105"
				>
					Manage subscription
					<FaExternalLinkAlt />
				</button>
			</header>
			<section className="mt-4">
				<UsageBar apiKeyInfo={apiKeyInfo} />
			</section>
			
            <div className="mt-16 col-span-1">
				<div className="flex justify-between items-start mb-4">
					<h2 className="text-xl text-white/85 font-semibold">
						Current Plan
					</h2>
					<span
						className={`bg-teal-200 capitalize text-gray-700 px-3 py-1 rounded-full text-sm font-medium`}
					>
						{apiKeyInfo.tier}
					</span>
				</div>

				<div className="mb-6 text-white/85 space-y-4">
					<div className="flex justify-between text-sm">
						<span className="text-white">Billing Period</span>
						<span>Monthly</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-white">Next Billing Date</span>
						<span>
							{new Date(apiKeyInfo.nextRefill).toLocaleDateString(
								"en-US",
								{
									year: "numeric",
									month: "long",
									day: "numeric",
								}
							)}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-white">Rate Limit</span>
						<span>
							{apiKeyInfo.rateLimit.toLocaleString()}{" "}
							requests/month
						</span>
					</div>
				</div>

				<Link href="/upgrade" className="block">
					<button
						className="w-1/2 mx-auto border border-white/25 
                        hover:border-white/50 bg-teal-500/85 hover:bg-teal-500/90
                         text-white py-2 px-4 rounded-md flex items-center justify-center
                          gap-2 transition mt-4 cursor-pointer font-semibold active:scale-105"
					>
						Upgrade Plan
						<FaArrowRight size={12} />
					</button>
				</Link>
			</div>
		</section>
	);
}
