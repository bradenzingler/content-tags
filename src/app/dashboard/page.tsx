import { getApiKeyId, setApiKeyId } from "@/lib/ddb";
import { createNewApiKey, unkey } from "@/lib/unkey";
import { auth } from "@clerk/nextjs/server";
import DashboardSections from "./DashboardSections";

export default async function DashboardPage() {

	const user = await auth();

	if (!user.userId) {
		return user.redirectToSignIn();
	}

	const apiKeyId = await getApiKeyId(user.userId);
    let apiKeyResult = null;
    if (apiKeyId) {
        apiKeyResult = await unkey.keys.get({ keyId: apiKeyId });
    }

    const deleteKey = async (keyId: string) => {
        "use server";
        await unkey.keys.delete({ keyId });
    }

    const createNewKey = async () => {
        "use server";
        const apiKeyResponse = await createNewApiKey(user.userId);
        await setApiKeyId(user.userId, apiKeyResponse.keyId);
        return apiKeyResponse;
    }

	return (
		<main className="flex items-center w-11/12 md:w-3/4 lg:w-7/12 mx-auto mt-28">
			<DashboardSections
                deleteKey={deleteKey}
                createNewKey={createNewKey}
				apiKeyStart={apiKeyResult?.result?.start ?? ""}
				apiKeyId={apiKeyId}
                totalRequests={apiKeyResult?.result?.refill?.amount ?? 0}
                remainingRequests={apiKeyResult?.result?.remaining ?? 0}
                refillDay={apiKeyResult?.result?.refill?.refillDay ?? 0}
                lastRefilled={apiKeyResult?.result?.refill?.lastRefillAt ?? 0}
                planName={apiKeyResult?.result?.meta?.tier as string ?? "free"}
			/>
		</main>
	);
}
