import TextField from "@/components/ui/TextField";
import React from "react";
import { Controller } from "react-hook-form";

interface TextFieldControlProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  control: any;
  label?: string;
  helperText?: string;
}

const TextFieldControl = ({
  name,
  control,
  label,
  helperText,
  ...props
}: TextFieldControlProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...props}
          label={label}
          error={fieldState.error?.message}
          helperText={helperText}
        />
      )}
    />
  );
};

export default TextFieldControl;
