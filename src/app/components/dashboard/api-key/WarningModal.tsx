
export default function WarningModal({
	setAcceptedWarning,
	regenerateKey,
}: {
	setAcceptedWarning: (createdNewApiKey: boolean) => void;
	regenerateKey: () => Promise<void>;
}) {

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/75">
			<div className="bg-teal-950/50 p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 xl:w-1/4">
				<h2 className="text-lg text-white font-semibold mb-4">
					Are you sure?
				</h2>
				<p className="text-white/90 mb-4">
					This action cannot be undone. Your existing API key will be
					deleted and any projects using it will need to use the new
					one.
				</p>
				<div className="flex items-center justify-center gap-4">
					<button
						onClick={() => setAcceptedWarning(false)}
						className="border-white/50 border hover:border-white/85 transition-colors 
                        cursor-pointer text-white active:scale-105 font-semibold rounded-md px-2 py-1 mt-4"
					>
						Cancel
					</button>
					<button
						onClick={async () => {
							await regenerateKey();
							setAcceptedWarning(false);
						}}
						className=" bg-red-600 hover:bg-red-600/85 transition-colors 
                        cursor-pointer text-white active:scale-105 font-semibold rounded-md px-2 py-1 mt-4"
					>
						Regenerate
					</button>
				</div>
			</div>
		</div>
	);
}
