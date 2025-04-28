import Image from "next/image";
import StoryPreview from "../components/blog/StoryPreview";

export default async function BlogPage() {
	return (
		<main
			className="flex flex-col lg:flex-row items-start 
        mt-36 w-11/12 justify-between overflow-none md:w-3/4 lg:w-7/12 mx-auto text-white/90"
		>
			<header>
				<p className="text-teal-500 text-lg font-bold text-center md:text-left">
					Blog
				</p>
				<h1 className="text-4xl font-bold text-center md:text-left tracking-tight mb-2">
					Automate image categorization with Inferly
				</h1>
				<p className="text-xl font-semi text-center md:text-left mb-12 md:mb-0">
					Product updates, detailed guides, and more from the Inferly
					API.
				</p>
			</header>
			<div className="flex flex-col items-center gap-4">
				<Image
					priority
					className="rounded-lg shadow-lg"
					title="Starry Night image with tags below it"
					alt="Starry Night by Van Gogh"
					width={400}
					height={400}
					src={
						"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/960px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg"
					}
				/>
				<div className="w-2/3">
					<p className="text-white/85 text-sm mb-2">
						Real tags from the Inferly API
					</p>
					<ul className="flex flex-wrap gap-2 text-sm">
						<span className="bg-teal-600 px-1 rounded-full text-white shadow-md">
							starry night
						</span>
						<span className="bg-teal-600 px-1 rounded-full text-white shadow-md">
							vincent van gogh
						</span>
						<span className="bg-teal-600 px-1 rounded-full text-white shadow-md">
							post-impressionism
						</span>
						<span className="bg-teal-600 px-1 rounded-full text-white shadow-md">
							landscape
						</span>
						<span className="bg-teal-600 px-1 rounded-full text-white shadow-md">
							night sky
						</span>
						<span className="bg-teal-600 px-1 rounded-full text-white shadow-md">
							swirling clouds
						</span>
						<span className="bg-teal-600 px-1 rounded-full text-white shadow-md">
							village
						</span>
						<span className="bg-teal-600 px-1 rounded-full text-white shadow-md">
							stars
						</span>
						<span className="bg-teal-600 px-1 rounded-full text-white shadow-md">
							moon
						</span>
						<span className="bg-teal-600 px-1 rounded-full text-white shadow-md">
							art
						</span>
						<span className="bg-teal-600 px-1 rounded-full text-white shadow-md">
							painting
						</span>
					</ul>
				</div>
			</div>
			<ul>
				<li>
					<StoryPreview
                        tags={["release", "javascript"]}
						title="Creating the Inferly API"
						description="The story of the creation of the Inferly API."
						author="Test"
						date={"04/27/2025"}
                        coverImageSrc="/release-demo.png"
					/>
				</li>
			</ul>
		</main>
	);
}
