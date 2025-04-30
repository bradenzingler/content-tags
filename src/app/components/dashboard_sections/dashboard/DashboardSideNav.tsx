"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlineDashboard } from "react-icons/ai";
import { CiCreditCard1 } from "react-icons/ci";
import { LuKeyRound } from "react-icons/lu";

export default function DashboardSideNav() {
	const pathname = usePathname();
	return (
		<aside className="w-full lg:w-1/5 border-r pr-4 border-r-teal-50/5">
			<nav className="w-full flex flex-col items-center justify-center">
				<ul className="space-y-4 w-full flex flex-col items-center">
					<li className="w-full">
						<Link
							className={`
                            text-gray-200 w-full items-center gap-2 flex px-4 py-2 border border-white/25
                            hover:border-white/50 cursor-pointer rounded-lg transition-colors 
                            ${
								pathname === "/dashboard/usage"
									? "bg-teal-500/85 text-white hover:bg-teal-500/90"
									: "text-white/80 hover:border-white/50"
							}`}
							href={"/dashboard/usage"}
						>
							<AiOutlineDashboard size={20} />
							Dashboard
						</Link>
					</li>
					<li className="w-full">
						<Link
							className={`text-gray-200 gap-2 items-center w-full flex px-4 py-2 border border-white/25
                                        hover:border-white/50 cursor-pointer rounded-lg transition-colors
                                        ${
											pathname === "/dashboard/api-key"
												? "bg-teal-500/85 text-white hover:bg-teal-500/90"
												: "text-white/80 hover:border-white/50"
										}`}
							href={"/dashboard/api-key"}
						>
							<LuKeyRound size={20} />
							API Key
						</Link>
					</li>
					<li className="w-full">
						<Link
							className={`text-gray-200 items-center w-full gap-2 px-4 py-2 flex border border-white/25
                                        hover:border-white/50 cursor-pointer rounded-lg transition-colors
                                        ${
											pathname === "/dashboard/billing"
												? "bg-teal-500/85 text-white hover:bg-teal-500/90"
												: "text-white/80 hover:border-white/50"
										}`}
							href={"/dashboard/billing"}
						>
							<CiCreditCard1 size={20} />
							Billing
						</Link>
					</li>
				</ul>
			</nav>
		</aside>
	);
}
