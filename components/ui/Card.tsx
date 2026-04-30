import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({ children, className = "", padding = "md", hover = false }: CardProps) {
  return (
    <div
      className={`bg-white border border-[#F1F5F9] rounded-xl shadow-sm ${paddingClasses[padding]} ${
        hover ? "hover:shadow-md transition-shadow cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
