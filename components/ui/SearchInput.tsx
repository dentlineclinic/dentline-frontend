import { InputHTMLAttributes } from "react";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  onSearch?: (value: string) => void;
}

export default function SearchInput({ onSearch, className = "", ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="search"
        className={`bg-white border border-[#F1F5F9] rounded-lg pl-10 pr-4 py-2 text-sm text-[#6B7280] outline-none focus:border-[#00685C] transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
