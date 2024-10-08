import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChoosePlan } from "./ChoosePlan";

export default function page() {
	return (
		<div className="mx-10 pt-5 pb-10 lg:max-w-7xl lg:mx-auto flex flex-col min-h-screen gap-3">
			{/* Nav Here */}
			<div className="flex justify-between items-center pb-4 border-b">
				<div>
					<img src="/logo.png" className="w-44 md:w-64" />
				</div>

				<Button
					className="bg-blue-500 hover:bg-blue-400 md:py-6 md:px-10 md:text-lg"
					asChild
				>
					<Link href="/login">Login</Link>
				</Button>
			</div>

			{/* Main Content */}
			<div className="flex flex-col flex-1 items-center gap-6 md:gap-10 mt-10 md:mt-24">
				<div className="flex flex-col items-center gap-6 lg:gap-14">
					<div className="flex flex-col items-center justify-center gap-5">
						<h1 className="text-3xl text-center font-semibold sm:text-4xl lg:text-5xl xl:text-7xl max-w-[500px] lg:max-w-[750px]">
							Manage your inventory more efficiently.
						</h1>

						<Button className="md:py-7 md:px-10 md:text-lg" asChild>
							<Link href="#plan">Get Started</Link>
						</Button>
					</div>

					{/* The Image */}
					<div className="border-2 rounded-lg overflow-hidden">
						<img src="/theimg.PNG" alt="the welcome shot" />
					</div>
				</div>

				{/* The Plans */}
				<div className="border-2 rounded-lg w-full flex justify-center py-6">
					<div className="flex flex-col w-full gap-6">
						<div className="text-center">
							<h1 className="text-2xl md:text-5xl font-semibold">
								Choose Your Right Plan!
							</h1>
							<p className="text-sm md:text-lg">
								Select the plan that best suits your business.
							</p>
						</div>

						<ChoosePlan />
					</div>
				</div>
			</div>
		</div>
	);
}
