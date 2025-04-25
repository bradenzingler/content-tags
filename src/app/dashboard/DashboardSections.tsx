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
    const [apiKeyResponse, setApiKeyResponse] = useState<ApiKeyInfo | null>(apiKeyInfo);

    
    const createApiKey = async () => {
        const response = await createNewKey();
        setApiKeyResponse(response);
        setCreatedNewApiKey(true);
    };

    const regenerateApiKey = async () => {
        if (!apiKeyResponse) return;
        const newKeyResponse = await regenerateKey(apiKeyResponse.apiKey, apiKeyResponse.userId);
        setApiKeyResponse(newKeyResponse);
        setCreatedNewApiKey(true);
    };

    return (
        <div className="flex flex-row w-full gap-8 justify-between">
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

            <aside className="w-full lg:w-1/4 border-r pr-4 border-r-teal-50/5">
                <nav className="w-full flex flex-col items-center justify-center">
                    <ul className="space-y-4 w-full flex flex-col items-center">
                        <li className="w-full">
                            <button
                                className={`text-gray-200 w-full items-center gap-2 flex px-4 py-2 border border-white/25
                                         hover:border-white/50 cursor-pointer rounded-lg transition-colors ${tab === "usage"
                                        ? "bg-teal-500/85 text-white hover:bg-teal-500/90"
                                        : "text-white/80 hover:border-white/50"
                                    }`}
                                onClick={() => setCurrentTab("usage")}
                            >
                                <AiOutlineDashboard size={20} />
                                Dashboard
                            </button>
                        </li>
                        <li className="w-full">
                            <button
                                className={`text-gray-200 gap-2 items-center w-full flex px-4 py-2 border border-white/25
                                        hover:border-white/50 cursor-pointer rounded-lg transition-colors
                                        ${tab === "api-keys"
                                        ? "bg-teal-500/85 text-white hover:bg-teal-500/90"
                                        : "text-white/80 hover:border-white/50"
                                    }`}
                                onClick={() => setCurrentTab("api-keys")}
                            >
                                <LuKeyRound size={20} />
                                API Key
                            </button>
                        </li>
                        <li className="w-full">
                            <button
                                className={`text-gray-200 items-center w-full gap-2 px-4 py-2 flex border border-white/25
                                        hover:border-white/50 cursor-pointer rounded-lg transition-colors
                                        ${tab === "billing"
                                        ? "bg-teal-500/85 text-white hover:bg-teal-500/90"
                                        : "text-white/80 hover:border-white/50"
                                    }`}
                                onClick={() => setCurrentTab("billing")}
                            >
                                <CiCreditCard1 size={20} />
                                Billing
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>
            <div className="w-full lg:w-3/4">
                {tab === "usage" ? (
                    <section className="flex flex-col">
                        <h1 className="text-white text-2xl tracking-tight font-semibold">
                            Dashboard
                        </h1>
                        {apiKeyInfo?.apiKey ? (
                            <div className="mt-8 space-y-12">
                                <UsageBar
                                    apiKeyInfo={apiKeyInfo}
                                />
                                <UsageGraph requestCounts={apiKeyInfo.requestCounts} />
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
                            />
                        ) : (
                            <NoApiKey createNewKey={createApiKey} />
                        )}
                    </section>
                ) : (
                    <section className="flex flex-col">
                        <h1 className="text-gray-200 text-2xl tracking-tight font-semibold">
                            Billing
                        </h1>
                        <p className="text-gray-100 mt-4">
                            You are currently on the
                            <span className="capitalize"> {apiKeyInfo?.tier ?? "free"} </span>
                            plan. (${getPlanCost(apiKeyInfo?.tier ?? "free")}/month)
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
}

function getPlanCost(planName: string) {
    switch (planName) {
        case "free":
            return 0;
        case "pro":
            return 10;
        case "business":
            return 55;
        default:
            return 0;
    }
}
