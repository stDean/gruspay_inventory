// The loading animation
export const Spinner = () => {
	return (
		<div className="h-[60vh] w-full  flex items-center justify-center">
			<div className="inline-block w-[50px] h-[50px] border-[3px] border-gray-300 border-t-[#F9AE19] rounded-full animate-spin" />
		</div>
	);
};
