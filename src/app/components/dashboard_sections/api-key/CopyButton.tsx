"use client";
import { useState } from "react";
import { IoCheckmarkCircle, IoCopyOutline } from "react-icons/io5";

export default function CopyButton({ apiKey }: { apiKey: string }) {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(apiKey);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			onClick={copyToClipboard}
			className="bg-teal-600 hover:bg-teal-600/85 transition-colors 
            cursor-pointer text-white font-semibold rounded-md p-1 active:scale-105"
		>
			{copied ? <IoCheckmarkCircle size={20} /> : <IoCopyOutline size={20} />}
		</button>
	);
}
