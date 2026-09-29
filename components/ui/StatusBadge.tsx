interface StatusBadgeProps {
  status: string;
  variant?:
    | "appointment"
    | "payment"
    | "history"
    | "dermatology"
    | "severity";
}

const STATUS_COLORS: Record<string, Record<string, string>> = {
  appointment: {
    BOOKED: "bg-[#E5EEFF] text-[#1E40AF]",
    ARRIVAL: "bg-[#F0FDFA] text-[#0F766E]",
    ASSIGN: "bg-[#FEF3C7] text-[#92400E]",
    COMPLETE: "bg-[#DCFCE7] text-[#166534]",
    CANCEL: "bg-[#F1F5F9] text-[#475569]",
    MISSED: "bg-[#FFDAD6] text-[#93000A]",
    ARRIVED: "bg-[#F0FDFA] text-[#0F766E]",
    ASSIGNED: "bg-[#FEF3C7] text-[#92400E]",
    COMPLETED: "bg-[#DCFCE7] text-[#166534]",
    CANCELLED: "bg-[#F1F5F9] text-[#475569]",
  },
  payment: {
    PAID: "bg-[#DCFCE7] text-[#166534]",
    PENDING: "bg-[#FEF3C7] text-[#92400E]",
    UNPAID: "bg-[#FFDAD6] text-[#93000A]",
    Paid: "bg-[#F0FDFA] text-[#0F766E]",
    Pending: "bg-[#FEF3C7] text-[#92400E]",
    Unpaid: "bg-[#FFDAD6] text-[#93000A]",
  },
  history: {
    COMPLETED: "bg-[#F0FDFA] text-[#0F766E]",
    IN_PROGRESS: "bg-[#E5EEFF] text-[#435B7E]",
    PENDING: "bg-[#FEF3C7] text-[#92400E]",
  },
  dermatology: {
    PENDING: "bg-[#FEF3C7] text-[#92400E]",
    COMPLETED: "bg-[#DCFCE7] text-[#166534]",
  },
  severity: {
    MILD: "bg-[#DCFCE7] text-[#166534]",
    MODERATE: "bg-[#FEF3C7] text-[#92400E]",
    SEVERE: "bg-[#FFDAD6] text-[#93000A]",
  },
};

export default function StatusBadge({
  status,
  variant = "appointment",
}: StatusBadgeProps) {
  const colorClass =
    STATUS_COLORS[variant]?.[status] ?? "bg-[#F1F5F9] text-[#64748B]";
  const displayText = status.replace(/_/g, " ");

  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${colorClass}`}>
      {displayText}
    </span>
  );
}