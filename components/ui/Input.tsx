import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-[#0B1C30] mb-2">
            {label}
            {props.required && <span className="text-[#93000A] ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-white border rounded-lg px-4 py-2 text-sm text-[#0B1C30] outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? "pl-10" : ""
            } ${rightIcon ? "pr-10" : ""} ${
              error
                ? "border-[#93000A] focus:border-[#BA1A1A]"
                : "border-[#F1F5F9] focus:border-[#00685C]"
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#93000A] mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#94A3B8] mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
