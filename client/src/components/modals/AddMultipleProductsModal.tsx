"use client";

import { useAppDispatch } from "@/app/redux";
import { DropzoneContainer } from "@/components/DropzoneContainer";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import useAddMultipleProductModal from "@/hook/useAddMultipleProductsModal";
import { setPreviewProducts } from "@/state";
import { Download, File, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { parse } from "papaparse";
import { useCallback, useEffect, useState } from "react";
import { FileRejection } from "react-dropzone";
import { toast } from "sonner";

enum STEPS {
	UPLOAD = 0,
	PREVIEW = 1,
}

export const AddMultipleProductsModal = () => {
	const addMultipleProductModal = useAddMultipleProductModal();
	const dispatch = useAppDispatch();
	const router = useRouter();

	const [data, setData] = useState<Array<any>>([]);
	const [uploadedFile, setUploadedFile] = useState<{
		name: string;
		size: number;
	}>({ name: "", size: 0 });
	const [progress, setProgress] = useState<{
		percentage: number;
		show: boolean;
	}>({
		percentage: 0,
		show: false,
	});
	const [step, setStep] = useState(STEPS.UPLOAD);

	const onNext = useCallback(() => {
		setStep(value => value + 1);
	}, []);

	const onBack = useCallback(() => {
		setStep(value => value - 1);
	}, [setStep]);

	// File upload
	const handleDropRejected = (rejectedFiles: FileRejection[]) => {
		rejectedFiles.forEach(file => {
			file.errors.forEach(error => {
				if (error.code === "file-invalid-type") {
					toast.error("Error", { description: "Invalid file type" });
					return;
				}

				if (error.code === "file-too-large") {
					toast.error("Error", { description: "File too large" });
					return;
				}
			});
		});
	};

	const extension = uploadedFile.name.split(".")[1];
	const size = (uploadedFile.size / 1000000).toFixed(3);

	const handleDropAccepted = async (acceptedFiles: File[]) => {
		setUploadedFile({
			name: acceptedFiles[0].name,
			size: acceptedFiles[0].size,
		});

		Array.from(acceptedFiles).map(async file => {
			const data = await file.text();
			const parsedData = parse(data, { header: true });
			setData(parsedData.data);
		});
	};

	useEffect(() => {
		if (data.length !== 0) {
			onNext();
		}
	}, [data, onNext]);

	useEffect(() => {
		setData([]);
		setStep(STEPS.UPLOAD);
		setUploadedFile({ name: "", size: 0 });
		setProgress({ percentage: 0, show: false });
	}, [addMultipleProductModal.isOpen]);

	const handleDelete = useCallback(() => {
		onBack();
		setProgress({ percentage: 0, show: false });
		setData([]);
	}, [onBack, setProgress, setData]);

	const handleUpload = useCallback(() => {
		setProgress({ percentage: 0, show: true });
		const products = data.filter(product => product?.product_name !== "");
		dispatch(setPreviewProducts(products));
    setProgress({ percentage: 100, show: true });
		setTimeout(() => {
			router.push("/inventory/preview");
			addMultipleProductModal.onClose();
		}, 500);
	}, [setProgress, data, dispatch, router, addMultipleProductModal]);

	const headerContent = (
		<div className="flex flex-col gap-1">
			<h1 className="text-xl font-semibold text-black">Bulk Items Upload</h1>
			<p className="text-sm text-gray-500">Upload multiple items at once</p>
		</div>
	);

	let bodyContent = (
		<div className="relative p-6 flex-auto border-b-[1px] mb-6 space-y-5">
			<div className="px-6 py-4 bg-[#F2F4F7] rounded-md">
				<p className="">Preparing template</p>

				<ul className="text-[#475467] text-sm list-inside list-disc indent-4">
					<li>Download template </li>
					<li>Use supported headings represented in the template</li>
					<li>You can import a maximum of 100 items </li>
				</ul>

				<p className="text-[#FF4405] text-lg font-semibold mt-4 flex gap-2 items-center cursor-pointer">
					Download template <Download className="h-5 w-5" />
				</p>
			</div>

			<div className="border-2 border-[#EAECF0] rounded-md py-5">
				<DropzoneContainer
					acceptedType={{
						"text/plain": [],
						"text/csv": [],
						"application/vnd.ms-excel": [],
						"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
							[],
					}}
					handleDropAccepted={handleDropAccepted}
					handleDropRejected={handleDropRejected}
					notPend="CSV (max 5mb)"
					maxSize={5242880}
				/>
			</div>
		</div>
	);

	if (step === STEPS.PREVIEW) {
		bodyContent = (
			<>
				<div className="relative p-4 flex-auto border-b-[1px] mb-4 space-y-5">
					<div className="border-2 border-[#EAECF0] rounded-md p-4 flex gap-4 items-center">
						<div className="relative">
							<File className="h-16 w-16 text-[#D0D5DD]" strokeWidth={"0.5"} />{" "}
							<p className="text-white bg-[#079455] px-[6px] py-[2px] text-sm absolute top-7 rounded-md">
								{extension}
							</p>
						</div>

						<div className="flex flex-col flex-1">
							<div className="flex justify-between">
								<div>
									<p className="text-[#344054] font-semibold text-xl">
										{uploadedFile.name}
									</p>
									<p className="text-sm text-[#475467]">{size}MB</p>
								</div>
								<div onClick={handleDelete}>
									<Trash2 className="cursor-pointer" />
								</div>
							</div>

							{progress.show && (
								<div className="flex flex-col items-center flex-1">
									<Progress
										value={progress.percentage}
										className="mt-2 h-2 bg-gray-300 "
									/>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="px-4 pb-4 flex justify-end">
					<Button onClick={handleUpload}>
						Add Products
					</Button>
				</div>
			</>
		);
	}

	return (
		<Modal
			isOpen={addMultipleProductModal.isOpen}
			onClose={addMultipleProductModal.onClose}
			headerContent={headerContent}
			body={bodyContent}
		/>
	);
};
