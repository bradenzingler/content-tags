import CopyButton from "./CopyButton";

export default function ApiKeyDisplay({ apiKey }: { apiKey: string }) {
	return (
		<div className="mt-6">
			<p className="text-white/85 mb-6">
				Use your API key in requests with the Authorization header.
			</p>
			<div className="flex items-center gap-2">
				<code className="text-white/85 select-none border-white/50 border px-4 py-1 rounded-md">
					{apiKey.slice(0, 8)}*******
				</code>
				<CopyButton apiKey={apiKey} />
			</div>
		</div>
	);
}
