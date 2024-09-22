"use client";

import {
	FormControl,
	FormField,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Control, FieldPath } from "react-hook-form";

interface CustomInputProps {
	control: Control<any>;
	name: FieldPath<any>;
	label: string;
	placeholder: string;
	show?: boolean;
	handleShow?: () => void;
	c?: boolean;
	small?: boolean;
	disabled?: boolean;
	withSpan?: boolean;
	add?: boolean;
	profile?: boolean;
}

export const CustomInput = ({
	control,
	name,
	label,
	placeholder,
	show,
	handleShow,
	c,
	small,
	disabled,
	withSpan,
	add,
	profile,
}: CustomInputProps) => {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<div
					className={cn("flex flex-col gap-1.5 w-full", {
						"flex-1": add,
						"flex-row justify-between": profile,
					})}
				>
					<FormLabel
						className={cn(
							"text-14 w-full max-w-[280px] font-medium text-gray-700 relative",
							{ "w-28": profile }
						)}
					>
						{label}
						{withSpan && <span className="text-red-500 absolute">*</span>}
					</FormLabel>
					<div
						className={cn("flex w-full flex-col", {
							"!w-[420px]": profile,
						})}
					>
						<FormControl>
							{name === "confirmPassword" || name === "password" ? (
								<div
									className={cn("flex justify-between items-center relative")}
								>
									<Input
										id={name}
										placeholder={placeholder}
										className={cn(
											"input-text-16 placeholder:text-16 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 pr-[44px] py-5"
										)}
										type={show ? "text" : "password"}
										{...field}
									/>

									<div
										className="w-[18px] h-[18px] absolute right-1 top-3 md:top-2 md:right-3"
										onClick={handleShow}
									>
										{show ? (
											<Eye className="w-[14px] h-[14px] md:w-[18px] md:h-[18px] cursor-pointer" />
										) : (
											<EyeOff className="w-[14px] h-[14px] md:w-[18px] md:h-[18px] cursor-pointer" />
										)}
									</div>
								</div>
							) : (
								<Input
									id={name}
									placeholder={placeholder}
									className={cn(
										"input-text-16 placeholder:text-16 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 py-5"
									)}
									type="text"
									{...field}
									disabled={disabled}
								/>
							)}
						</FormControl>

						<FormMessage className="text-12 text-red-500 mt-2" />
					</div>
				</div>
			)}
		/>
	);
};
