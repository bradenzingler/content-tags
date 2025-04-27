export default function ApiKeyDisplay({
	apiKeyStart,
    rateLimit,
	setShowRegenerateKeyWarning,
}: {
	apiKeyStart: string;
    rateLimit: number;
	setShowRegenerateKeyWarning: (value: boolean) => void;
}) {
	return (
		<div className="mt-6">
			<p className="text-white/85 mb-6">
				Use your API key in requests with the Authorization header.
                With your current plan, you can make up to {rateLimit} request{rateLimit > 1 ? "s" : ""} per second.
			</p>
			<div className="flex items-center gap-2">
				<code className="text-white/85 select-none border-white/50 border px-4 py-1 rounded-md">
					{apiKeyStart}*******
				</code>
				<button
					onClick={() => setShowRegenerateKeyWarning(true)}
					className="bg-red-600 hover:bg-red-600/85 active:scale-105 transition-colors 
                    cursor-pointer text-white font-semibold rounded-md px-2 py-1"
				>
					Regenerate
				</button>
			</div>
		</div>
	);
}
