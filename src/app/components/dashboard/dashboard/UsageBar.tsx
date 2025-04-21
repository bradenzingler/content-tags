import React from "react";

interface UsageBarProps {
	totalRequests: number;
	remainingRequests: number;
}

const UsageBar: React.FC<UsageBarProps> = ({
	totalRequests,
	remainingRequests,
}) => {
	const usagePercentage = ((remainingRequests / totalRequests) * 100).toFixed(
		2
	);

	return (
		<div className="w-full">
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
