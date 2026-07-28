import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface WrapperProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FieldWrapper({ label, error, required, children }: WrapperProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-stone-700 dark:text-stone-300">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}

const inputClasses =
  "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:bg-stone-900 dark:border-stone-700";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, required, className = "", ...props }: FormFieldProps) {
  return (
    <FieldWrapper label={label} error={error} required={required}>
      <input className={`${inputClasses} ${className}`} required={required} {...props} />
    </FieldWrapper>
  );
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextareaField({ label, error, required, className = "", ...props }: TextareaFieldProps) {
  return (
    <FieldWrapper label={label} error={error} required={required}>
      <textarea className={`${inputClasses} min-h-24 ${className}`} required={required} {...props} />
    </FieldWrapper>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export function SelectField({
  label,
  error,
  required,
  options,
  placeholder,
  className = "",
  ...props
}: SelectFieldProps) {
  return (
    <FieldWrapper label={label} error={error} required={required}>
      <select className={`${inputClasses} ${className}`} required={required} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
