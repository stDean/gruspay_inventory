"use client";

import Select from "react-select";
import countries from "world-countries";

const formattedCountries = countries.map(country => ({
	value: country.cca2,
	label: country.name.common,
	flag: country.flag,
	latlng: country.latlng,
	region: country.region,
}));

export const useCountries = () => {
	const getAll = () => formattedCountries;

	const getByValue = (value: string) => {
		return formattedCountries.find(item => item.value === value);
	};

	return {
		getAll,
		getByValue,
	};
};

export type CountrySelectValue = {
	flag: string;
	label: string;
	latlng: number[];
	// region: string;
	value: string;
};

interface CountrySelectProps {
	value?: CountrySelectValue;
	onChange: (value: CountrySelectValue) => void;
}

export const CountrySelect = ({ value, onChange }: CountrySelectProps) => {
	const { getAll } = useCountries();

	return (
		<div>
			<Select
				placeholder="Select from dropdown"
				isClearable
				options={getAll()}
				value={value}
				onChange={value => onChange(value as CountrySelectValue)}
				formatOptionLabel={(option: any) => (
					<div className="flex flex-row items-center gap-3">
						<div>{option.flag}</div>
						<div>
							{option.label}
							{/* <span className="text-neutral-500 ml-1">{option.region}</span> */}
						</div>
					</div>
				)}
				classNames={{
					control: () => "p-0 border-2",
					input: () => "text-lg cursor-pointer",
					option: () => "text-lg",
				}}
				theme={theme => ({
					...theme,
					borderRadius: 6,
					colors: {
						...theme.colors,
						primary: "black",
						primary25: "#ffe4e6",
					},
				})}
			/>
		</div>
	);
};
