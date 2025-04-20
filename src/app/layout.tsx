import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";

const karla = Karla({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Inferly",
	description:
		"Generate relevant tags for text and images with one simple API call.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${karla.className} antialiased bg-zinc-900`}>
				<NavBar />
				{children}
			</body>
		</html>
	);
}
