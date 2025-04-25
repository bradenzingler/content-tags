import { ApiKeyInfo } from "@/lib/ddb";
import CopyButton from "./CopyButton";

export default function CreateApiKeyModal({
    apiKeyInfo,
    setCreatedNewApiKey
}: {
    setCreatedNewApiKey: (createdNewApiKey: boolean) => void;
    apiKeyInfo: ApiKeyInfo | null;
}) {

    if (!apiKeyInfo) return null;
    
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/75">
			<div className="bg-teal-950/50 p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 xl:w-1/4">
				<h2 className="text-lg text-white font-semibold mb-4">Your new API key</h2>
				<p className="text-sm text-white/90 mb-4">
					This is your new API key. Please copy it now, as you
					won&apos;t be able to see it again.
				</p>
				<div className="bg-white/85 p-2 rounded mb-4">
					<code className="text-sm break-all flex  justify-between items-center">
                    {apiKeyInfo.apiKey}
                        <CopyButton apiKey={apiKeyInfo.apiKey} />
                    </code>
				</div>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setCreatedNewApiKey(false)}
                        className="bg-teal-600 hover:bg-teal-600/85 transition-colors 
                        cursor-pointer text-white active:scale-105 font-semibold rounded-md px-2 py-1 mt-4"
                    >
                        Close
                    </button>
                </div>
			</div>
		</div>
	);
}
