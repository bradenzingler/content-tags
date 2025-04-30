import ApiKeyDisplay from "@/app/components/dashboard_sections/api-key/ApiKeyDisplay";
import { getUserApiKey } from "@/lib/ddb";
import { auth } from "@clerk/nextjs/server";

export default async function ApiKeyPage() {
	const user = await auth();
	const apiKey = await getUserApiKey(user.userId!);
	return (
		<section className="flex w-full flex-col  md:mx-8">
			<h1 className="text-white text-2xl tracking-tight font-semibold">
				API Key
			</h1>
			<ApiKeyDisplay apiKey={apiKey!} />
		</section>
	);
}
