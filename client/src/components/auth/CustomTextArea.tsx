import { FormControl, FormField, FormLabel } from "@/components/ui/form";
import { Control, FieldPath } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

interface CustomTexAreaProps {
	control: Control<any>;
	name: FieldPath<any>;
	label: string;
	placeholder: string;
	characterCounter: number;
	characterLimit?: number;
}

export const CustomTextArea = ({
	control,
	name,
	label,
	placeholder,
	characterCounter,
	characterLimit,
}: CustomTexAreaProps) => {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<div className="space-y-1 w-full">
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Textarea
							placeholder={placeholder}
							className={`resize-none h-20 ${
								characterCounter >= 201 && "focus-visible:!ring-red-500"
							} ${
								characterCounter >= 150 &&
								characterCounter <= 200 &&
								"focus-visible:!ring-yellow-500"
							}`}
							{...field}
							onChange={e => {
								// Prevent typing beyond the character limit
								if (
									characterLimit !== undefined &&
									e.target.value.length >= characterLimit
								) {
									return;
								}
								field.onChange(e); // Update the value in the form state
							}}
						/>
					</FormControl>
				</div>
			)}
		/>
	);
};
