import UsageBar from "@/app/components/dashboard_sections/dashboard/UsageBar";
import UsageGraph from "@/app/components/dashboard_sections/dashboard/UsageGraph";
import { createOrGetUserApiKeyInfo } from "@/lib/ddb";
import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function UsagePage() {
	const user = await auth();
	const client = await clerkClient();
	const clerkUser = await client.users.getUser(user.userId!);
	const stripeId = clerkUser.privateMetadata.stripeId as string;
	const apiKeyInfo = await createOrGetUserApiKeyInfo(user.userId!, stripeId);

	return (
		<section className="flex w-full flex-col md:mx-8">
			<h1 className="text-white text-2xl tracking-tight font-semibold">
				Dashboard
			</h1>
			<div className="mt-8 space-y-12">
				<UsageBar apiKeyInfo={apiKeyInfo} />
				<UsageGraph requestCounts={apiKeyInfo.requestCounts} />
			</div>
		</section>
	);
}
