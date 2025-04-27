import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";

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
        <ClerkProvider>
            <html lang="en">
                <head>
                    <Script src="https://js.stripe.com/v3/pricing-table.js" strategy="afterInteractive" />
                </head>
                <body className={`${karla.className} antialiased bg-zinc-900`}>
                    <NavBar />
                    {children}
                </body>
            </html>
        </ClerkProvider>
	);
}
