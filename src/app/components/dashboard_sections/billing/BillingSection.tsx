import { getPlanCost } from "@/app/utils";
import { ApiKeyInfo } from "@/lib/ddb";

export default function BillingSection({ apiKeyInfo }: { apiKeyInfo: ApiKeyInfo | null }) {
	return (
		<section className="flex flex-col">
			<h1 className="text-gray-200 text-2xl tracking-tight font-semibold">
				Billing
			</h1>
			<p className="text-gray-100 mt-4">
				You are currently on the
				<span className="capitalize">
					{" "}
					{apiKeyInfo?.tier ?? "free"}{" "}
				</span>
				plan (${getPlanCost(apiKeyInfo?.tier ?? "0")}/month).
			</p>
		</section>
	);
}
