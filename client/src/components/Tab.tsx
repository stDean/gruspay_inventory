export const Tab = ({
	val,
	handleTab,
	title,
	styles,
	first,
}: {
	val: boolean;
	handleTab: () => void;
	title: string;
	styles?: string;
	first?: boolean;
}) => {
	return (
		<p
			onClick={handleTab}
			className={`p-[6px] px-3 font-medium border-l ${val && styles} ${
				first && "!border-l-0"
			} `}
		>
			{title}
		</p>
	);
};
