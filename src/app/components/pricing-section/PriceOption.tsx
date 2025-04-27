import { convertTierToUsageAmount, getPlanCost } from "@/app/utils";
import { ApiKeyTier } from "@/lib/ddb";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { FaCheck } from "react-icons/fa";

export default async function PriceOption({
	title,
	description,
	features,
}: {
	title: ApiKeyTier;
	description: string;
	features: string[];
}) {
	const user = await auth();
	const isSignedIn = user.userId !== null;

    const numCredits = convertTierToUsageAmount(title);
    const numImages = (numCredits).toLocaleString();
    const price = getPlanCost(title);

	return (
		<div className="bg-white/5 w-11/12 mx-auto lg:w-1/4 lg:mx-0 rounded-lg p-8 flex flex-col justify-between">
			<h3 className="text-3xl capitalize text-white font-bold tracking-tight mb-1">
				{title}
			</h3>
			<p className="text-white/75 mb-6">{description}</p>
			<div className="flex items-end gap-1 mb-6">
				<span className="text-5xl font-bold text-white">${price}</span>
				<span className="text-white/75">per month</span>
			</div>
			<Link
				href={isSignedIn ? "/buy" : "/sign-in"}
				className="bg-teal-600 hover:bg-teal-600/85 text-center cursor-pointer text-white rounded-md py-2 mb-4"
			>
				Let&apos;s build
			</Link>
			<ul className="list-disc list-inside mb-6">
				<li className="text-white/75 flex items-center gap-2">
					<FaCheck className="text-teal-600/85" />
					{numImages} image requests
				</li>
				{features.map((feature, index) => (
					<li
						key={index}
						className="text-white/75 flex items-center gap-2"
					>
						<FaCheck className="text-teal-600/85" />
						{feature}
					</li>
				))}
			</ul>
		</div>
	);
}
