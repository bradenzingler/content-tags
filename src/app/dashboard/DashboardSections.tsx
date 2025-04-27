"use client";
import { useState } from "react";
import { AiOutlineDashboard } from "react-icons/ai";
import { CiCreditCard1 } from "react-icons/ci";
import { LuKeyRound } from "react-icons/lu";
import UsageBar from "../components/dashboard_sections/dashboard/UsageBar";
import NoApiKey from "../components/dashboard_sections/api-key/NoApiKey";
import CreateApiKeyModal from "../components/dashboard_sections/api-key/CreateApiKey";
import ApiKeyDisplay from "../components/dashboard_sections/api-key/ApiKeyDisplay";
import WarningModal from "../components/dashboard_sections/api-key/WarningModal";
import { ApiKeyInfo } from "@/lib/ddb";
import UsageGraph from "../components/dashboard_sections/dashboard/UsageGraph";
import BillingSection from "../components/dashboard_sections/billing/BillingSection";
import DashboardSideNav from "../components/dashboard_sections/DashboardSideNav";

export default function DashboardSections({
	apiKeyInfo,
	createNewKey,
	regenerateKey,
}: {
	apiKeyInfo: ApiKeyInfo | null;
	createNewKey: () => Promise<ApiKeyInfo>;
	regenerateKey: (apiKey: string, userId: string) => Promise<ApiKeyInfo>;
}) {
	const [tab, setCurrentTab] = useState("usage");
	const [createdNewApiKey, setCreatedNewApiKey] = useState(false);
	const [showRegenerateKeyWarning, setShowRegenerateKeyWarning] =
		useState(false);
	const [apiKeyResponse, setApiKeyResponse] = useState<ApiKeyInfo | null>(
		apiKeyInfo
	);

	const createApiKey = async () => {
		const response = await createNewKey();
		setApiKeyResponse(response);
		setCreatedNewApiKey(true);
	};

	const regenerateApiKey = async () => {
		if (!apiKeyResponse) return;
		const newKeyResponse = await regenerateKey(
			apiKeyResponse.apiKey,
			apiKeyResponse.userId
		);
		setApiKeyResponse(newKeyResponse);
		setCreatedNewApiKey(true);
	};

	return (
		<div className="flex flex-col md:flex-row w-full gap-8 justify-between mb-24">
			{createdNewApiKey && (
				<CreateApiKeyModal
					apiKeyInfo={apiKeyResponse}
					setCreatedNewApiKey={setCreatedNewApiKey}
				/>
			)}

			{showRegenerateKeyWarning && (
				<WarningModal
					regenerateKey={regenerateApiKey}
					setAcceptedWarning={setShowRegenerateKeyWarning}
				/>
			)}

            <DashboardSideNav tab={tab} setCurrentTab={setCurrentTab} />
			
			<div className="w-full lg:w-3/4">
				{tab === "usage" ? (
					<section className="flex flex-col">
						<h1 className="text-white text-2xl tracking-tight font-semibold">
							Dashboard
						</h1>
						{apiKeyInfo?.apiKey ? (
							<div className="mt-8 space-y-12">
								<UsageBar apiKeyInfo={apiKeyInfo} />
								<UsageGraph
									requestCounts={apiKeyInfo.requestCounts}
								/>
							</div>
						) : (
							<NoApiKey createNewKey={createApiKey} />
						)}
					</section>
				) : tab === "api-keys" ? (
					<section className="flex flex-col">
						<h1 className="text-white text-2xl tracking-tight font-semibold">
							Your API key
						</h1>
						{apiKeyResponse?.apiKey ? (
							<ApiKeyDisplay
								setShowRegenerateKeyWarning={
									setShowRegenerateKeyWarning
								}
								apiKeyStart={apiKeyResponse?.apiKey.slice(0, 8)}
                                rateLimit={apiKeyInfo?.rateLimit ?? 0}
							/>
						) : (
							<NoApiKey createNewKey={createApiKey} />
						)}
					</section>
				) : (
					<BillingSection apiKeyInfo={apiKeyResponse} />
				)}
			</div>
		</div>
	);
}
