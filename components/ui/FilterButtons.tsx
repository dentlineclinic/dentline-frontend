interface FilterButtonsProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  className?: string;
}

export default function FilterButtons({
  filters,
  activeFilter,
  onFilterChange,
  className = "",
}: FilterButtonsProps) {
  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeFilter === filter
              ? "bg-[#00685C] text-white"
              : "bg-white border border-[#F1F5F9] text-[#3D4946] hover:bg-[#F8FAFC]"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
