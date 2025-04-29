import { getUserApiKey, createApiKey, getApiKeyInfo, regenerateKey, ApiKeyTier } from "@/lib/ddb";
import { auth, clerkClient } from "@clerk/nextjs/server";
import DashboardSections from "./DashboardSections";
import { generateApiKey } from "@/lib/generateApiKeys";
import { ApiKeyInfo } from "@/lib/ddb";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export default async function DashboardPage() {
    const authClient = await clerkClient();
    const user = await auth();
    
    if (!user.userId) {
        return user.redirectToSignIn();
    }
    const userMetadata = (await authClient.users.getUser(user.userId)).privateMetadata;

    const apiKey = await getUserApiKey(user.userId);
    let apiKeyInfo: ApiKeyInfo | null = null;
    if (apiKey) {
        apiKeyInfo = await getApiKeyInfo(apiKey);
    }

    if (!userMetadata.stripeId) {
        console.error("No stripeId found in user metadata");
        return new Response("Missing stripeId", { status: 400 });
    }
    
    const customer = await stripe.customers.retrieve(userMetadata.stripeId as string) as Stripe.Customer;

    // Check subscription status from Clerk metadata
    const hasActiveSubscription = userMetadata.hasActiveSubscription === true;

    const stripeSession = await stripe.billingPortal.sessions.create({
        customer: `${customer.id}`,
        return_url: process.env.NODE_ENV === "development" ? "http://localhost:3000/dashboard" : "https://inferly.org/dashboard"
    });
    
    const regenerateApiKey = async (apiKey: string, userId: string): Promise<ApiKeyInfo> => {
        "use server";
        const newKey = generateApiKey();
        const res = await regenerateKey(apiKey, userId, newKey);
        return res;
    }

    const createNewKey = async () => {
        "use server";
        if (!hasActiveSubscription) {
            throw new Error("You need an active subscription to generate an API key");
        }
        const apiKey = generateApiKey();
        const apiKeyInfo = await createApiKey(user.userId, apiKey, "startup");
        return apiKeyInfo;
    }

    return (
        <main className="flex items-center w-11/12 mx-auto mt-28">
            <DashboardSections
                regenerateKey={regenerateApiKey}
                createNewKey={createNewKey}
                apiKeyInfo={apiKeyInfo}
                currentTier={customer.metadata.tier as ApiKeyTier}
                stripePortalSessionUrl={stripeSession.url}
                hasActiveSubscription={hasActiveSubscription}
            />
        </main>
    );
}
