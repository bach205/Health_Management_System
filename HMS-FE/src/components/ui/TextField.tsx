interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const TextField = ({
  label,
  error,
  helperText,
  className,
  ...props
}: TextFieldProps) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm
          placeholder:text-gray-400 focus:border-primary-500 focus:outline-none
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
          ${error ? "border-red-500" : ""}
          ${className}`}
        {...props}
      />
      {(error || helperText) && (
        <p className={`text-sm ${error ? "text-red-500" : "text-gray-500"}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default TextField;
