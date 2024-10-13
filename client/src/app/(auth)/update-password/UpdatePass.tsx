"use client";
import { VerifyOTPAndUpdatePass } from "@/actions/login";
import { ResendOTP } from "@/actions/registration";
import { OtpInput } from "@/components/auth/OtpInput";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export const UpdatePass = () => {
	const router = useRouter();
	const { email, password } =
		typeof localStorage !== "undefined"
			? JSON.parse(localStorage.getItem("user")!)
			: null;

	const [isPending, startTransition] = useTransition();
	const [value, setValue] = useState("");

	const verifyOTP = () => {
		startTransition(async () => {
			// verifyOTP
			const { error, success } = await VerifyOTPAndUpdatePass({
				email,
				password,
				otp: value,
			});
			if (success) {
				router.push("/login");
				toast.success("Success", {
					description: "Password has been updated successfully",
				});

				typeof localStorage !== "undefined" && localStorage.removeItem("user");
			}
      
			if (error) {
				toast.error("Error", {
					description: error,
				});
        return
			}
		});
	};

	const resendOTP = () => {
		startTransition(async () => {
			await ResendOTP({ email });
		});
	};

	return (
		<div className="bg-white rounded-md shadow-md p-8 flex flex-col justify-center items-center gap-4">
			<img
				src="/logo.png"
				alt="logo"
				className="w-44 md:w-52 lg:w-56 cursor-pointer"
				// onClick={() => router.push("/dashboard")}
			/>
			<p className="text-sm md:text-base">
				Enter the OTP sent to <span className="font-semibold">{email}</span>
			</p>

			<OtpInput value={value} handleChange={value => setValue(value)} />

			<p>
				Didn't get OTP?{" "}
				<span
					className="font-semibold text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4 cursor-pointer"
					onClick={resendOTP}
				>
					Resend Code
				</span>
			</p>

			<hr />

			<Button onClick={verifyOTP} disabled={isPending} className="w-full">
				Verify OTP
			</Button>
		</div>
	);
};
