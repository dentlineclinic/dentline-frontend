import { ReactNode } from "react";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
}

const widthClasses = {
  sm: "w-full sm:w-80",
  md: "w-full sm:w-96",
  lg: "w-full sm:w-[32rem]",
};

export default function SidePanel({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "sm",
}: SidePanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed top-0 right-0 bottom-0 bg-white shadow-2xl z-50 flex flex-col ${widthClasses[width]}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
          <div>
            <h2 className="text-base font-bold text-[#0B1C30]">{title}</h2>
            {subtitle && <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#475569]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && <div className="px-6 py-4 border-t border-[#F1F5F9]">{footer}</div>}
      </div>
    </>
  );
}
