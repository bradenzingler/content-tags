"use client";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { FaTags } from "react-icons/fa";
import { MdClear, MdFileUpload } from "react-icons/md";

export default function Demo({
	makeTagsRequest,
}: {
	makeTagsRequest: (
		content: string,
		inputType: "text" | "image"
	) => Promise<string[] | null>;
}) {

	const [inputType, setInputType] = useState<string>("text");
	const [textInput, setTextInput] = useState<string>("");
	const [dragActive, setDragActive] = useState<boolean>(false);
	const [uploadedImage, setUploadedImage] = useState<
		string | ArrayBuffer | null
	>(null);
	const [tags, setTags] = useState<string[]>([]);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const handleTextChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
		setTextInput(e.target.value);
	};

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

    const handlePaste = (e: React.ClipboardEvent) => {
        const clipboardData = e.clipboardData;
    
        // Check for image files
        const items = clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
                const file = items[i].getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setUploadedImage(event.target?.result || null);
                    };
                    reader.readAsDataURL(file);
                }
                return;
            }
        }
    
        // Check for image URLs
        const text = clipboardData.getData("text");
        if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
            if (/\.(jpeg|jpg|png|gif|webp)$/i.test(text)) {
                setUploadedImage(text);
            }
        }
    };

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleImageUpload(e.dataTransfer.files[0]);
		}
	};

	const handleImageUpload = (file: File) => {
		if (file && file.type.startsWith("image/")) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setUploadedImage(e.target!.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			handleImageUpload(e.target.files[0]);
		}
	};

	const handleClearImage = () => {
		setUploadedImage(null);
	};

	const processContent = async () => {
		setIsProcessing(true);
        const content = inputType === "text" ? textInput : uploadedImage as string;
        const tags = await makeTagsRequest(content, inputType as "text" | "image");
        console.log(tags);
        if (tags) {
            setTags(tags);
        }
        setIsProcessing(false);
	};

	return (
		<div className="w-full lg:w-1/2">
			<div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
				<h3 className="text-white text-xl font-bold mb-4">
					Try it yourself
				</h3>

				<div className="flex mb-4 bg-gray-700 p-1 rounded-lg w-fit">
					<button
						className={`px-4 py-2 rounded-md cursor-pointer ${
							inputType === "text"
								? "bg-teal-600 text-white"
								: "text-gray-300 hover:text-gray-300/50"
						}`}
						onClick={() => setInputType("text")}
					>
						Text
					</button>
					<button
						className={`px-4 py-2 rounded-md cursor-pointer ${
							inputType === "image"
								? "bg-teal-600 text-white"
								: "text-gray-300 hover:text-gray-300/50"
						}`}
						onClick={() => setInputType("image")}
					>
						Image
					</button>
				</div>

				{/* Text input */}
				<div className="h-52">
					{inputType === "text" && (
						<div className="mb-4">
							<textarea
								className="w-full resize-none h-40 p-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
								placeholder="Enter text here..."
								value={textInput}
								onChange={handleTextChange}
							></textarea>
							<div className="text-right text-gray-400 text-sm">
								{textInput.length}/10,000 characters
							</div>
						</div>
					)}

					{/* Image upload */}
					{inputType === "image" && (
						<div
							className={`mb-4 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-48 ${
								uploadedImage
									? "border-teal-500"
									: dragActive
									? "border-teal-500"
									: "border-gray-600"
							}`}
							onDragEnter={handleDrag}
							onDragLeave={handleDrag}
							onDragOver={handleDrag}
							onDrop={handleDrop}
                            onPaste={handlePaste}
						>
							{!uploadedImage ? (
								<>
									<MdFileUpload className="h-12 w-12 text-gray-400 mb-2" />
									<p className="text-gray-300 mb-2">
										Drag and drop an image, or
									</p>
									<label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
										Browse files
										<input
											type="file"
											className="hidden"
											accept="image/*"
											onChange={handleFileChange}
										/>
									</label>
								</>
							) : (
								<div className="relative w-full h-full">
									<Image
										src={uploadedImage as string}
										alt="Uploaded"
										width={250}
										height={250}
										className="max-h-full max-w-full mx-auto object-contain rounded"
									/>
									<button
										onClick={handleClearImage}
										className="absolute top-0 cursor-pointer hover:bg-gray-700 right-0 bg-gray-800 rounded-full p-1 shadow-lg"
									>
										<MdClear className="h-5 w-5 text-white" />
									</button>
								</div>
							)}
						</div>
					)}
				</div>

				<button
					className={`w-full font-medium py-3 cursor-pointer rounded-lg flex items-center justify-center ${
						(inputType === "text" && textInput.length >= 10) ||
						(inputType === "image" && uploadedImage)
							? "bg-teal-600 hover:bg-teal-500 text-white"
							: "bg-gray-700 text-gray-400 cursor-not-allowed"
					}`}
					onClick={processContent}
					disabled={
						isProcessing ||
						(inputType === "text" && textInput.length < 10) ||
						(inputType === "image" && !uploadedImage)
					}
				>
					{isProcessing ? (
						<AiOutlineLoading className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
					) : (
						<FaTags className="mr-2 h-5 w-5" />
					)}
					{isProcessing ? "Processing..." : "Generate Tags"}
				</button>

				{tags.length > 0 && (
					<div className="mt-4">
						<h4 className="text-white font-medium mb-2">
							Tags:
						</h4>
						<div className="flex flex-wrap gap-2">
							{tags.map((tag, index) => (
								<span
									key={index}
									className="bg-teal-600/30 text-teal-300 px-3 py-1 rounded-full text-sm"
								>
									{tag}
								</span>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
