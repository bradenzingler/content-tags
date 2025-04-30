import { auth } from "@clerk/nextjs/server";
import DashboardSideNav from "../components/dashboard_sections/dashboard/DashboardSideNav";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await auth();

	if (!user.userId) {
		return redirect("/login");
	}

	return (
		<div className="flex flex-col mb-24 justify-center gap-8 md:flex-row md:gap-0 md:w-2/3 items-start mx-auto mt-28">
			<DashboardSideNav />
			{children}
		</div>
	);
}
