"use client";
import { useState } from "react";
import { AiOutlineDashboard } from "react-icons/ai";
import { CiCreditCard1 } from "react-icons/ci";
import { LuKeyRound } from "react-icons/lu";
import UsageBar from "../components/dashboard/UsageBar";
import NoApiKey from "../components/dashboard/NoApiKey";
import CreateApiKeyModal from "../components/dashboard/CreateApiKey";

export default function DashboardSections({
	apiKeyStart,
	apiKeyId,
	remainingRequests,
	totalRequests,
	refillDay,
	lastRefilled,
    planName,
	createNewKey,
}: {
	apiKeyStart: string;
	apiKeyId: string | null;
	remainingRequests: number;
	totalRequests: number;
	refillDay: number;
	lastRefilled: number;
    planName: string;
	createNewKey: () => Promise<{ keyId: string, key: string }>;
}) {
	const [tab, setCurrentTab] = useState("usage");
    const [createdNewApiKey, setCreatedNewApiKey] = useState(false);
    const [apiKey, setApiKey] = useState("");

	const today = new Date();
	const currentDay = today.getDate();
	const currentMonth = today.getMonth();
	const currentYear = today.getFullYear();

	// Calculate next refill date
	const nextRefillDate =
		currentDay > refillDay
			? new Date(currentYear, currentMonth + 1, refillDay)
			: new Date(currentYear, currentMonth, refillDay);

	// Calculate time since last refill
	const lastRefillDate = new Date(lastRefilled);
	const timeSinceLastRefill = Math.floor(
		(today.getTime() - lastRefillDate.getTime()) / (1000 * 60 * 60 * 24)
	);
    
    const createApiKey = async () => {
        const response = await createNewKey();
        setApiKey(response.key);
        setCreatedNewApiKey(true);
    }
    
	return (
		<div className="flex flex-row w-full gap-8 justify-between">
            {createdNewApiKey && <CreateApiKeyModal apiKey={apiKey} setCreatedNewApiKey={setCreatedNewApiKey} />}

			<aside className="w-full lg:w-1/4 border-r pr-4 border-r-teal-50/5">
				<nav className="w-full flex flex-col items-center justify-center">
					<ul className="space-y-4 w-full flex flex-col items-center">
						<li className="w-full">
							<button
								className={`text-gray-200 w-full items-center gap-2 flex px-4 py-2 border border-white/25
                                         hover:border-white/50 cursor-pointer rounded-lg transition-colors ${
												tab === "usage"
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
                                        ${
											tab === "api-keys"
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
                                        ${
											tab === "billing"
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
						{apiKeyId ? (
							<div className="mt-8">
								<UsageBar
									totalRequests={totalRequests}
									remainingRequests={remainingRequests}
								/>
								<p className="text-gray-100 mt-4">
									Usage resets on{" "}
									{nextRefillDate.toLocaleDateString(
										"en-US",
										{
											year: "numeric",
											month: "long",
											day: "numeric",
										}
									)}
								</p>
								<p className="text-gray-100">
									Last reset {timeSinceLastRefill} days ago
								</p>
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
						{apiKeyId ? (
							<div className="mt-8">
                                <p className="text-white/85 mb-2">User your API key in requests with the x-api-key header.</p>
								<code className="text-white/85 border-white/50 border px-4 py-1 rounded-md">
                                    {apiKeyStart}*******
                                </code>
							</div>
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
                            <span className="capitalize">
                                {" "}{planName}{" "}
                            </span> 
                            plan.
                            <br />
                            You can upgrade your plan in the future.
                            <br />
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