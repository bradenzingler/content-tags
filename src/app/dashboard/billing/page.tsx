import { createOrGetUserApiKeyInfo } from "@/lib/ddb";
import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function BillingPage() {
    const user = await auth();
	const client = await clerkClient();
	const clerkUser = await client.users.getUser(user.userId!);
	const stripeId = clerkUser.privateMetadata.stripeId as string;
	const apiKeyInfo = await createOrGetUserApiKeyInfo(user.userId!, stripeId);

	return (
		<section className="flex flex-col w-11/12 mx-8">
			<h1 className="text-white text-2xl tracking-tight font-semibold">
				Billing
			</h1>
		</section>
	);
}
