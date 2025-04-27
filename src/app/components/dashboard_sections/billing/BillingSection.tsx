import { getPlanCost } from "@/app/utils";
import { ApiKeyInfo } from "@/lib/ddb";
import PricingSection from "../../pricing-section/PricingSection";

export default function BillingSection({ apiKeyInfo }: { apiKeyInfo: ApiKeyInfo | null }) {
	return (
		<section className="flex flex-col gap-16">
            <header>
                <h1 className="text-gray-200 text-2xl tracking-tight font-semibold">
                    Billing
                </h1>
                <p className="text-gray-100 mt-4">
                    You are currently on the
                    <span className="capitalize">
                        {" "}
                        {apiKeyInfo?.tier ?? "startup"}{" "}
                    </span>
                    plan (${getPlanCost(apiKeyInfo?.tier ?? "startup")}/month).
                    Upgrade your plan to receive all the benefits of the Inferly API.
                </p>
            </header>
            <PricingSection />
		</section>
	);
}
