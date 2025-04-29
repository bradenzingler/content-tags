import UsageBar from "@/app/components/dashboard_sections/dashboard/UsageBar";
import UsageGraph from "@/app/components/dashboard_sections/dashboard/UsageGraph";
import { createOrGetUserApiKeyInfo } from "@/lib/ddb";
import { auth } from "@clerk/nextjs/server";

export default async function UsagePage() {
	const user = await auth();
	const apiKeyInfo = await createOrGetUserApiKeyInfo(user.userId!);

	return (
		<section className="flex flex-col w-11/12 mx-8">
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
