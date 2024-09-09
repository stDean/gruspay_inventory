import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

export const OtpInput = ({
  value,
  handleChange,
}: {
  value: string;
  handleChange: (value: string) => void;
}) => {
  return (
    <InputOTP
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
      value={value}
      onChange={handleChange}
    >
      <InputOTPGroup className="space-x-2">
        <InputOTPSlot
          index={0}
          className="!rounded-md border-2 border-[#D0D5DD] !text-2xl !font-semibold p-5 md:p-7 "
        />
        <InputOTPSlot
          index={1}
          className="!rounded-md border-2 border-[#D0D5DD] !text-2xl !font-semibold p-5 md:p-7"
        />
        <InputOTPSlot
          index={2}
          className="!rounded-md border-2 border-[#D0D5DD] !text-2xl !font-semibold p-5 md:p-7"
        />
        <InputOTPSlot
          index={3}
          className="!rounded-md border-2 border-[#D0D5DD] !text-2xl !font-semibold p-5 md:p-7"
        />
        <InputOTPSlot
          index={4}
          className="!rounded-md border-2 border-[#D0D5DD] !text-2xl !font-semibold p-5 md:p-7"
        />
        <InputOTPSlot
          index={5}
          className="!rounded-md border-2 border-[#D0D5DD] !text-2xl !font-semibold p-5 md:p-7"
        />
      </InputOTPGroup>
    </InputOTP>
  );
};
