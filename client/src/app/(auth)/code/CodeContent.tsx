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
			const res = await verifyOTPToken({ email, otp: value });
			if (res?.success) {
				dispatch(setLoggedInUser(true));
				dispatch(setToken(res?.success.jwtToken));

				router.push("/dashboard");
				toast.success("Success", {
					description: "OTP verified successfully",
				});
				return;
			}

			if (res?.error) {
				toast.error("Error", { description: res?.error });
				return;
			}
		});
	};

	const resendOTP = (email: string) => {
		startTransition(async () => {
			const res = await ResendOTP({ email });
			if (res?.error) {
				toast.error("Error", { description: res?.error });
				return;
			}

			toast.success("Success", { description: res?.data.message });
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
					onClick={() => {
						resendOTP(email);
					}}
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
