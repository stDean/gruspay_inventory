import { Button } from "@/components/ui/button";

export const AddButton = ({
	title,
	buttonText,
	handleAdd,
}: {
	title: string;
	buttonText: string;
	handleAdd?: () => void;
}) => {
	return (
		<div className="flex flex-col items-center justify-center min-h-[80vh] gap-3">
			<p className="font-semibold text-lg md:text-2xl">{title}</p>
			<Button className="md:py-6 md:px-6 md:text-lg" onClick={handleAdd}>
				{buttonText}
			</Button>
		</div>
	);
};
