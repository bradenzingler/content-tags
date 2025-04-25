import { getUserApiKey, createApiKey, getApiKeyInfo, regenerateKey } from "@/lib/ddb";
import { auth } from "@clerk/nextjs/server";
import DashboardSections from "./DashboardSections";
import { generateApiKey } from "@/lib/generateApiKeys";
import { ApiKeyInfo } from "@/lib/ddb";

export default async function DashboardPage() {

    const user = await auth();

    if (!user.userId) {
        return user.redirectToSignIn();
    }

    const apiKey = await getUserApiKey(user.userId);
    let apiKeyInfo: ApiKeyInfo | null = null;
    if (apiKey) {
        apiKeyInfo = await getApiKeyInfo(apiKey);
        console.log(apiKeyInfo);
    }

    const regenerateApiKey = async (apiKey: string, userId: string): Promise<ApiKeyInfo> => {
        "use server";
        const newKey = generateApiKey();
        const res = await regenerateKey(apiKey, userId, newKey);
        return res;
    }

    const createNewKey = async () => {
        "use server";
        const apiKey = generateApiKey();
        const apiKeyInfo = await createApiKey(user.userId, apiKey, "free");
        return apiKeyInfo;
    }

    return (
        <main className="flex items-center w-11/12 md:w-3/4 lg:w-3/4 mx-auto mt-28">
            <DashboardSections
                regenerateKey={regenerateApiKey}
                createNewKey={createNewKey}
                apiKeyInfo={apiKeyInfo}
            />
        </main>
    );
}
