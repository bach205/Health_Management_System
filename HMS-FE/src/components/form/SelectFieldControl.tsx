import SelectField from "@/components/ui/SelectField";
import React from "react";
import { Controller } from "react-hook-form";

interface SelectFieldControlProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  control: any;
  label?: string;
  helperText?: string;
  options: { value: string | number; label: string }[];
}

const SelectFieldControl = ({
  name,
  control,
  label,
  helperText,
  options,
  ...props
}: SelectFieldControlProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <SelectField
          {...field}
          {...props}
          label={label}
          error={fieldState.error?.message}
          helperText={helperText}
          options={options}
        />
      )}
    />
  );
};

export default SelectFieldControl;
