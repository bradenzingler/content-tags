import SideNav from "../components/docs/SideNav";

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
        className="flex flex-col lg:flex-row items-center lg:items-start 
        mt-24 w-full overflow-none md:w-3/4 lg:w-7/12 mx-auto text-white/90"
    >
        <SideNav />
        {children}
    </div>
    )
}