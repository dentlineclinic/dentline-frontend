import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && (
        <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#0B1C30] mb-2">{title}</h3>
      {description && <p className="text-sm text-[#94A3B8] text-center mb-4">{description}</p>}
      {action}
    </div>
  );
}
