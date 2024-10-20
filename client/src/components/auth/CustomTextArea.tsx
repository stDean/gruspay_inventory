import { FormControl, FormField, FormLabel } from "@/components/ui/form";
import { Control, FieldPath } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

interface CustomTexAreaProps {
  control: Control<any>;
  name: FieldPath<any>;
  label: string;
  placeholder: string;
}

export const CustomTextArea = ({
  control,
  name,
  label,
  placeholder,
}: CustomTexAreaProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-1 w-full">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className="resize-none h-20"
              {...field}
            />
          </FormControl>
        </div>
      )}
    />
  );
};
