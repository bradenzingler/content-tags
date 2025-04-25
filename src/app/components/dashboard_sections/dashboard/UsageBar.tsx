import { ApiKeyInfo } from "@/lib/ddb";
import React from "react";
import { convertTierToUsageAmount } from "@/app/utils";

interface UsageBarProps {
	apiKeyInfo: ApiKeyInfo;
}

const UsageBar: React.FC<UsageBarProps> = ({
	apiKeyInfo,
}) => {
	const totalRequestsAvailabled = convertTierToUsageAmount(apiKeyInfo.tier);
	const remainingRequests = totalRequestsAvailabled - apiKeyInfo.totalUsage;
	const usagePercentage = ((remainingRequests / totalRequestsAvailabled) * 100).toFixed(
		2
	);

    const nextRefill = new Date(apiKeyInfo.nextRefill);

	return (
		<div className="w-full">
            <h3 className="text-white/85 mb-2 font-semibold">Usage resets on {nextRefill.toLocaleDateString()}</h3>
			<div className="flex justify-between items-center mb-2">
				<span className="text-sm font-medium text-gray-400">
					{remainingRequests} credits remaining
				</span>
				<span className="text-sm font-medium text-gray-400">
					{usagePercentage}%
				</span>
			</div>
			<div className="w-full bg-gray-200 rounded-full h-4">
				<div
					className="bg-teal-500 h-4 rounded-full"
					style={{ width: `${usagePercentage}%` }}
				></div>
			</div>
		</div>
	);
};

export default UsageBar;
