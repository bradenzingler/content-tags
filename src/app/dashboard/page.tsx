import { getUserApiKey, createApiKey, deleteApiKey, getApiKeyInfo } from "@/lib/ddb";
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

    const deleteKey = async (apiKey: string) => {
        "use server";
        await deleteApiKey(apiKey, user.userId);
    }

    const createNewKey = async () => {
        "use server";
        const apiKey = generateApiKey();
        const apiKeyInfo = await createApiKey(user.userId, apiKey, "free");
        return apiKeyInfo;
    }

    return (
        <main className="flex items-center w-11/12 md:w-3/4 lg:w-7/12 mx-auto mt-28">
            <DashboardSections
                deleteKey={deleteKey}
                createNewKey={createNewKey}
                apiKeyInfo={apiKeyInfo}
            />
        </main>
    );
}
