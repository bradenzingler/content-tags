import { getUserApiKey, createApiKey, getApiKeyInfo, regenerateKey } from "@/lib/ddb";
import { auth } from "@clerk/nextjs/server";
import DashboardSections from "./DashboardSections";
import { generateApiKey } from "@/lib/generateApiKeys";
import { ApiKeyInfo } from "@/lib/ddb";
import { stripe } from "@/lib/stripe";

export default async function DashboardPage() {

    const user = await auth();

    if (!user.userId) {
        return user.redirectToSignIn();
    }
    
    const apiKey = await getUserApiKey(user.userId);
    let apiKeyInfo: ApiKeyInfo | null = null;
    if (apiKey) {
        apiKeyInfo = await getApiKeyInfo(apiKey);
    }

    const customer = await stripe.customers.search({
        query: `metadata["userId"]:"${user.userId}"`
    })
    const stripeSession = await stripe.billingPortal.sessions.create({
        customer: `${customer.data[0].id}`,
        return_url: process.env.NODE_ENV === "development" ? "http://localhost:3000/dashboard" : "https://inferly.org/dashboard"
    });
    console.log(stripeSession);
    
    const regenerateApiKey = async (apiKey: string, userId: string): Promise<ApiKeyInfo> => {
        "use server";
        const newKey = generateApiKey();
        const res = await regenerateKey(apiKey, userId, newKey);
        return res;
    }

    const createNewKey = async () => {
        "use server";
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
                stripePortalSessionUrl={stripeSession.url}
            />
        </main>
    );
}
