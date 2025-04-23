export default function SectionTitle({ title }: { title: string }) {
	return (
		<header className="mb-6">
			<h1 className="text-4xl font-bold text-white/95 tracking-tight">
				{title}
			</h1>
			<div className="h-0.5 w-1/3 bg-teal-500/50 mt-2 rounded-full"></div>
		</header>
	);
}
