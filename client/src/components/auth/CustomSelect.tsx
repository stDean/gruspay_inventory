import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export const CustomSelect = ({
  items,
  value,
  label,
  handleChange,
  width,
  width2,
}: {
  items: ReactNode;
  value: string;
  label: string;
  width?: boolean;
  width2?: boolean;
  handleChange: (value: string, id?: number) => void;
}) => {
  return (
    <Select
      value={value}
      onValueChange={(value: string, id?: number) => handleChange(value, id!)}
    >
      <SelectTrigger
        className={cn({
          "w-[220px] md:w-full": width,
          "w-[295px] md:w-[170px] text-xs": width2,
        })}
      >
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {items}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
