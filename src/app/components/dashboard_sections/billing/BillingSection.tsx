import { getPlanCost } from "@/app/utils";
import { ApiKeyInfo } from "@/lib/ddb";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { FiExternalLink } from "react-icons/fi";
import Stripe from "stripe";

export default function BillingSection({
	apiKeyInfo,
	stripePortalUrl,
}: {
	apiKeyInfo: ApiKeyInfo | null;
	stripePortalUrl: string | null;
}) {

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
					Upgrade your plan to receive all the benefits of the Inferly
					API.
				</p>
			</header>
            <section>
                {stripePortalUrl ? (
                    <Link
                        href={stripePortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-teal-500/85 inline-flex items-center gap-2 rounded-md px-2 text-lg py-1 text-white hover:bg-teal-500/90"
                    >
                        Manage Billing
                        <FiExternalLink />
                    </Link>
                ) : <AiOutlineLoading className="animate-spin text-white" size={20} />}
            </section>
		</section>
	);
}
