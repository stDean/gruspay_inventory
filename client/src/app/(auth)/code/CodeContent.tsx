"use client";
import { ResendOTP, verifyOTPToken } from "@/actions/registration";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { OtpInput } from "@/components/auth/OtpInput";
import { Button } from "@/components/ui/button";
import { setLoggedInUser, setToken } from "@/state";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export const CodeContent = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { email } = useAppSelector(({ global }) => global);

	const [isPending, startTransition] = useTransition();
	const [value, setValue] = useState("");

	const verifyOTP = () => {
		startTransition(async () => {
			// verifyOTP
			const { error, success } = await verifyOTPToken({ email, otp: value });
			if (success) {
				dispatch(setLoggedInUser(true));
				dispatch(setToken(success.jwtToken));

				// TODO:get user by email and dispatch the user into the state

				router.push("/dashboard");
				toast.success("Success", {
					description: "OTP verified successfully",
				});
			}

			if (error) {
				toast.error("Error", {
					description: error,
				});
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
				Enter the OTP sent to <span className="font-semibold">{email}</span>{" "}
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
