import { headers } from "next/headers";
import Link from "next/link";

export default async function SideNav() {
	const path = (await headers()).get("x-current-path") || "";
	console.log("Current path:", path);
	return (
		<aside className="p-6 w-full lg:w-1/4">
			<div className="mb-8">
				<h3 className="text-lg font-bold text-white/95">
					Documentation
				</h3>
			</div>

			<nav>
				<ul className="space-y-2 flex flex-col">
					<Link
						href={"/docs/getting-started"}
						title="Getting started"
						className={`w-full text-left px-4 py-2 border cursor-pointer rounded-lg transition-colors ${
							path === "/docs/getting-started"
								? "bg-teal-500/85 text-white hover:bg-teal-500/90"
								: "text-white/80 border-white/25 hover:border-white/50"
						}`}
					>
						Getting started
					</Link>
					<Link
						href={"/docs/options"}
						title="API options"
						className={`w-full text-left px-4 py-2 border cursor-pointer rounded-lg transition-colors ${
							path === "/docs/options"
								? "bg-teal-500/85 text-white hover:bg-teal-500/90"
								: "text-white/80 border-white/25 hover:border-white/50"
						}`}
					>
						Options
					</Link>
					<Link
						href={"/docs/rate-limits"}
						title="API rate limits"
						className={`w-full text-left px-4 py-2 border cursor-pointer rounded-lg transition-colors ${
							path === "/docs/rate-limits"
								? "bg-teal-500/85 text-white hover:bg-teal-500/90"
								: "text-white/80 border-white/25 hover:border-white/50"
						}`}
					>
						Rate limits
					</Link>
					<Link
						href={"/docs/errors"}
						title="API errors"
						className={`w-full text-left px-4 py-2 border cursor-pointer rounded-lg transition-colors ${
							path === "/docs/errors"
								? "bg-teal-500/85 text-white hover:bg-teal-500/90"
								: "text-white/80 border-white/25 hover:border-white/50"
						}`}
					>
						Errors
					</Link>
					<Link
						href={"/docs/access"}
						title="API authentication"
						className={`w-full text-left px-4 py-2 border cursor-pointer rounded-lg transition-colors ${
							path === "/docs/access"
								? "bg-teal-500/85 text-white hover:bg-teal-500/90"
								: "text-white/80 border-white/25 hover:border-white/50"
						}`}
					>
						API keys
					</Link>
				</ul>
			</nav>
		</aside>
	);
}
