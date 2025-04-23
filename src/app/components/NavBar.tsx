"use client";
import Image from "next/image";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function NavBar() {
	const { isSignedIn } = useUser();

	return (
		<nav className="absolute top-0 left-0 p-4 border-b-teal-100/5 border-b w-full overflow-clip">
			<div className="flex items-center justify-between w-full md:w-3/4 lg:w-7/12 mx-auto ">
				<Link
					href={"/"}
					title="Inferly home page"
					className="flex items-center group"
				>
					<Image
						src={"/logo.png"}
						alt="Inferly Logo"
						width={32}
						height={32}
						className="group-hover:scale-110 transition-transform duration-100"
					/>
					<h2 className="text-white tracking-tight text-2xl font-bold active:text-white/85 hover:text-white/85">
						Inferly
					</h2>
				</Link>
				<ul className="flex items-center gap-8">
					<li>
						<Link
							href={"/docs/getting-started"}
							title="Read the docs"
							className="text-white/85 hover:text-white"
						>
							Docs
						</Link>
					</li>
					<li>
						<Link
							href={"/#pricing"}
							title="Read the docs"
							className="text-white/85 hover:text-white"
						>
							Pricing
						</Link>
					</li>
                    <li>
						<Link
							href={"/blog"}
							title="Read the blog"
							className="text-white/85 hover:text-white"
						>
							Blog
						</Link>
					</li>
				</ul>
				<div className="flex items-center gap-4">
					{isSignedIn && (
						<Link
							href={"/dashboard"}
							title="Dashboard"
							className="text-white/85 hover:text-white"
						>
							Dashboard
						</Link>
					)}
					{isSignedIn ? (
						<div className="items-center flex">
							<UserButton />
						</div>
					) : (
						<SignInButton>
							<button className="text-white/85 cursor-pointer hover:border-white/85 border border-white/50 rounded-lg px-2 py-1">
								Sign in
							</button>
						</SignInButton>
					)}
				</div>
			</div>
		</nav>
	);
}
