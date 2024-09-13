import { AddProductsType, cn } from "@/lib/utils";
import { Description, Label, Radio, RadioGroup } from "@headlessui/react";
import { Check } from "lucide-react";

interface SelectButtonProps {
	options: { add_products: (typeof AddProductsType.options)[number] };
	onChange: (value: (typeof AddProductsType.options)[number]) => void;
}

export const SelectButtons = ({ options, onChange }: SelectButtonProps) => {
	return (
		<>
			{[AddProductsType].map(({ name, options: selectedOptions }) => (
				<RadioGroup value={options[name]} onChange={onChange} key={name}>
					<div className="mt-3 space-y-4">
						{selectedOptions.map(option => (
							<Radio
								key={option.title}
								value={option}
								className={({ checked }) =>
									cn(
										"relative block cursor-pointer rounded-lg bg-white px-6 py-4 shadow-sm border-2 border-zinc-200 focus:outline-none ring-0 focus:ring-0 outline-none sm:flex sm:justify-between",
										{
											"border-[#F9AE19] bg-[#FEFDF0]": checked,
										}
									)
								}
							>
								<span className="flex items-center justify-between w-full">
									<span className="flex flex-col text-sm">
										<Label className="font-semibold text-gray-900" as="span">
											{option.title}
										</Label>

										<Description>{option.subTitle}</Description>
									</span>

									<span
										className={cn(
											"border-2 rounded-full p-[2px] self-start flex items-center justify-center",
											{
												"border-[#F9AE19]":
													options.add_products["title"] === option.title,
											}
										)}
									>
										<Check
											className={cn("h-3 w-3 text-gray-400", {
												"text-[#F9AE19]":
													options.add_products["title"] === option.title,
											})}
                      strokeWidth={3}
										/>
									</span>
								</span>
							</Radio>
						))}
					</div>
				</RadioGroup>
			))}
		</>
	);
};
