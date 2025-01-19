"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ReactElement, useCallback, useEffect, useState } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	headerContent?: ReactElement;
	body?: ReactElement;
	disabled?: boolean;
	actionLabel?: string;
	onSubmit: () => void;
	addedStyle?: string;
	footer?: boolean;
	addStyle?: string;
	lessPadd?: string;
	addStyle2?: boolean;
	shouldScroll?: boolean;
}

export const Modal = ({
	isOpen,
	onClose,
	headerContent,
	body,
	disabled,
	actionLabel,
	onSubmit,
	addedStyle,
	footer,
	addStyle,
	lessPadd,
	addStyle2,
	shouldScroll,
}: ModalProps) => {
	const [showModal, setShowModal] = useState<boolean>(isOpen);

	useEffect(() => {
		setShowModal(isOpen);
	}, [isOpen]);

	const handleClose = useCallback(() => {
		setShowModal(false);
		setTimeout(() => {
			onClose();
		}, 300);
	}, [onClose]);

	const handleSubmit = useCallback(() => {
		if (disabled) {
			return;
		}

		onSubmit();
	}, [onSubmit, disabled]);

	if (!isOpen) {
		return null;
	}

	return (
		<>
			<div className="justify-center items-center flex overflow-x-hidden overflow-y-hidden fixed inset-0 z-50 outline-none focus:outline-none bg-neutral-800/70">
				<div
					className={`relative w-[350px] md:w-[550px] my-6 mx-auto h-fit lg:h-auto md:h-auto `}
				>
					<div
						className={`translate duration-300 h-full ${
							showModal ? "translate-y-0" : "translate-y-full"
						} ${showModal ? "opacity-100" : "opacity-0"}
          `}
					>
						<div
							className={`translate h-full lg:h-auto md:h-auto border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none ${addStyle} ${
								addStyle2 && "overflow-y-scroll !h-[650px] scrollbar-thin"
							}`}
						>
							{/* Header */}
							<div
								className={`flex items-center p-6 rounded-t relative border-b-[1px] ${lessPadd} ${
									addStyle2 && "sticky top-0 bg-white z-10"
								}`}
							>
								{headerContent}
								<button
									className="p-1 border-0 hover:opacity-70 transition absolute right-4"
									onClick={handleClose}
								>
									<X size={18} />
								</button>
							</div>

							{/* Body */}
							<div
								className={`relative flex-auto ${
									shouldScroll &&
									"overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[550px]"
								}`}
							>
								{body}
							</div>

							{/* Footer */}
							{footer && (
								<div className="border-t flex flex-col gap-2 px-6 py-6">
									<div className="flex flex-row items-center gap-4 w-full">
										{actionLabel && (
											<Button
												disabled={disabled}
												onClick={handleSubmit}
												className={`px-6 py-5 ${addedStyle}`}
											>
												{actionLabel}
											</Button>
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
