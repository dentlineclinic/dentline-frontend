interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-14 h-14 text-xl",
};

export default function Avatar({ initials, size = "sm", className = "" }: AvatarProps) {
  return (
    <div
      className={`rounded-full bg-[#CCFBF1] flex items-center justify-center font-bold text-[#0F766E] flex-shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
