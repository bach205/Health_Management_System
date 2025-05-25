interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string | number; label: string }[];
}

const SelectField = ({
  label,
  error,
  helperText,
  className,
  options,
  ...props
}: SelectFieldProps) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <select
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm
          placeholder:text-gray-400 focus:border-primary-500 focus:outline-none
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
          ${error ? "border-red-500" : ""}
          ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <p className={`text-sm ${error ? "text-red-500" : "text-gray-500"}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default SelectField;
