import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  badge?: string;
  icon?: ReactNode;
  subtitle?: string;
  isLoading?: boolean;
}

export default function StatsCard({ label, value, badge, icon, subtitle, isLoading }: StatsCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/2 mb-3" />
        <div className="h-8 bg-[#F1F5F9] rounded animate-pulse w-3/4 mb-2" />
        <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/3" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#F1F5F9] rounded-xl p-4 sm:p-6 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        {icon && (
          <div className="w-10 h-10 bg-[#F0FDFA] rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
        {badge && (
          <span className="text-xs font-bold px-2 py-1 rounded bg-[#F0FDFA] text-[#0D9488]">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm sm:text-base text-[#3D4946]">{label}</p>
      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B1C30]">{value}</p>
      {subtitle && <p className="text-xs text-[#0D9488]">{subtitle}</p>}
    </div>
  );
}
