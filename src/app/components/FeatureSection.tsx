import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { FaArrowRight, FaCheck } from "react-icons/fa";

export default async function FeatureSection({
	headline,
	videoSrc,
	videoSide,
	pText,
	featureList,
	buttonText,
	belowButtonText,
}: {
	headline: string;
	videoSrc: string;
	videoSide: "right" | "left";
	pText: string;
	featureList: { boldText: string; contentText: string }[];
	buttonText: string;
	belowButtonText: string;
}) {
	const user = await auth();
	const isSignedIn = user.userId !== null;

	return (
		<section
			className={`flex mb-32 ${
				videoSide === "right" ? "flex-row-reverse" : "flex-row"
			}
                             w-11/12 md:w-11/12 items-center justify-center gap-8`}
		>
			<video
				width={550}
				className="rounded-xl border-2 shadow-lg border-white/10"
				autoPlay={true}
                loop={true}
                controls={true}
				src={videoSrc}
			/>
			<div className="w-1/3">
				<h3 className="text-white text-4xl font-extrabold tracking-tight">
					{headline}
				</h3>
				<h4 className="text-white/90 text-lg mt-4">{pText}</h4>
				<ul className="mt-12 space-y-4">
					{featureList.map((feature, idx) => (
						<li
							key={idx}
							className="flex gap-4 items-start text-white"
						>
							<FaCheck size={35} className="text-teal-500" />
							<p>
								<span className="font-semibold">
									{feature.boldText}{" "}
								</span>
								{feature.contentText}
							</p>
						</li>
					))}
				</ul>
				<Link
					href={isSignedIn ? "/dashboard" : "/sign-in"}
					className="bg-teal-600 mt-12 hover:bg-teal-600/85 active:scale-105 transition-all
                   text-white font-semibold rounded-lg px-6 gap-2 py-3 inline-flex items-center"
				>
					{buttonText}
                    <FaArrowRight />
				</Link>
                <p className="text-white/85 mt-2">{belowButtonText}</p>
			</div>
		</section>
	);
}
