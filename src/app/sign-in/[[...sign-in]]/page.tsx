import { SignIn } from "@clerk/nextjs";

export default function Page() {
	return (
		<main className="flex justify-center items-center mt-36">
			<SignIn />
		</main>
	);
}
