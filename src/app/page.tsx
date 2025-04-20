import Link from "next/link";

export default function Home() {
	return (
		<main className="flex flex-col justify-center items-center mt-56">
			<header className="flex flex-col w-full md:w-3/4 lg:w-1/2 items-center justify-center">
				<h1 className="text-4xl tracking-tighter text-center md:text-6xl font-extrabold text-white">
					Turn content into context
				</h1>
				<p className="text-white/75 text-center mt-4 md:text-xl">
					Generate relevant tags for text and images with one simple
					API call.
				</p>
				<Link
					href={"/docs"}
					className="bg-teal-500 hover:bg-teal-500/85 mt-8 text-white/85 font-semibold lg:text-lg rounded-full px-2 py-1"
				>
					See the docs
				</Link>
			</header>
		</main>
	);
}
