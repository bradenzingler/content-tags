"use client";

import Link from "next/link";
import React from "react";
import { FaArrowRight, FaCheck } from "react-icons/fa";

type PriceOptionProps = {
	title: string;
	price: number;
	frequency?: string;
	description: string;
	features: string[];
	ctaText: string;
	isPopular?: boolean;
	href: string;
};

export default function PriceOption({
	title,
	price,
	frequency = "month",
	description,
	features,
	ctaText,
	isPopular = false,
	href,
}: PriceOptionProps) {
	return (
		<div
			className={`rounded-2xl border p-6 relative flex flex-col h-fit ${
				isPopular
					? "border-teal-500 shadow-lg shadow-teal-100/50"
					: "border-gray-200"
			}`}
		>
			{isPopular && (
				<div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
					Most Popular
				</div>
			)}

			<div className="mb-5">
				<h3 className="text-2xl font-semibold text-white">{title}</h3>
				<p className="text-white/85 mt-2">{description}</p>
			</div>

			<div className="mb-5">
				<div className="flex items-baseline">
					<span className="text-3xl font-bold text-white">
						${price}
					</span>
					<span className="text-white/50 ml-2">per {frequency}</span>
				</div>
			</div>

			<ul className="space-y-3 mb-6 flex-grow">
				{features.map((feature, index) => (
					<li key={index} className="flex items-start">
						<FaCheck className="h-5 w-5 flex-shrink-0 text-teal-500 mt-0.5" />
						<span className="ml-3 text-white/85">
							{feature}
						</span>
					</li>
				))}
			</ul>

			<Link
				href={href}
				className={`w-full flex items-center justify-center gap-2 py-3 text-white px-4 rounded-lg font-medium ${
					isPopular
						? "bg-teal-500  hover:bg-teal-600"
						: "border-white/20 border hover:border-white/50 "
				} transition-colors duration-200`}
			>
				{ctaText}
				<FaArrowRight />
			</Link>
		</div>
	);
}
