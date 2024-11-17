"use client";

import { useState } from "react";
import Dropzone, { Accept, FileRejection } from "react-dropzone";

interface DropzoneContainerProps {
	handleDropRejected: (rejectedFiles: FileRejection[]) => void;
	handleDropAccepted: (acceptedFiles: File[]) => void;
	notPend?: string;
	acceptedType: Accept;
	maxSize: number;
	isPending?: boolean;
}

export const DropzoneContainer = ({
	handleDropRejected,
	handleDropAccepted,
	notPend,
	acceptedType,
	maxSize,
	isPending = false,
}: DropzoneContainerProps) => {
	const [isDragOver, setIsDragOver] = useState<boolean>(false);

	return (
		<Dropzone
			maxSize={maxSize}
			onDropRejected={(rejectedFiles: FileRejection[]) => {
				handleDropRejected(rejectedFiles);
				setIsDragOver(false);
			}}
			onDropAccepted={(acceptedFiles: File[]) => {
				handleDropAccepted(acceptedFiles);
				setIsDragOver(false);
			}}
			// the image mime type to accept
			accept={acceptedType}
			onDragEnter={() => setIsDragOver(true)}
			onDragLeave={() => setIsDragOver(false)}
		>
			{({ getInputProps, getRootProps }) => (
				<div
					className="h-full w-full flex-1 flex flex-col items-center justify-center cursor-pointer py-2"
					{...getRootProps()}
				>
					<input {...getInputProps()} />

					{/* The text beneath */}
					<div className="flex flex-col justify-center mb-2 text-sm text-zinc-700">
						{isDragOver ? (
							<p>
								<span className="font-semibold">Drop file</span> to upload
							</p>
						) : (
							<p>
								<span className="font-semibold">Click to upload</span> or drag
								and drop
							</p>
						)}
					</div>

					{/* MIME type accepted */}
					{isPending ? null : (
						<p className="text-xs text-zinc-500">{notPend}</p>
					)}
				</div>
			)}
		</Dropzone>
	);
};
