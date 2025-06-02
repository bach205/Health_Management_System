import TextField from "../../components/ui/TextField";
import React from "react";
import { Controller } from "react-hook-form";

interface TextFieldControlProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  control: any;
  label?: string;
  helperText?: string;
  rules?: any;
}

const TextFieldControl = ({
  name,
  control,
  label,
  helperText,
  rules,
  ...props
}: TextFieldControlProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
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