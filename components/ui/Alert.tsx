import { ReactNode } from "react";

interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  success: "bg-[#DCFCE7] text-[#166534] border-[#86EFAC]",
  error: "bg-[#FFDAD6] text-[#93000A] border-[#FCA5A5]",
  warning: "bg-[#FEF3C7] text-[#92400E] border-[#FDE047]",
  info: "bg-[#E5EEFF] text-[#1E40AF] border-[#93C5FD]",
};

export default function Alert({ variant = "info", children, className = "" }: AlertProps) {
  return (
    <div
      className={`text-sm font-semibold px-4 py-3 rounded-lg border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
