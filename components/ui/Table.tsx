import { ReactNode } from "react";

interface TableProps {
  headers: string[];
  children: ReactNode;
  minWidth?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table({ headers, children, minWidth = "640px", isLoading, emptyMessage }: TableProps) {
  return (
    <div className="bg-white border border-[#F1F5F9] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth }}>
          <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="text-left px-6 py-4 text-xs font-bold text-[#3D4946] tracking-widest"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
}

export function TableRow({ children, onClick, isSelected }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`border-t border-[#F8FAFC] transition-colors ${
        onClick ? "cursor-pointer hover:bg-[#F8FAFC]" : ""
      } ${isSelected ? "bg-[#F0FDFA]" : ""}`}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return <td className={`px-6 py-4 ${className}`}>{children}</td>;
}

interface TableLoadingProps {
  rows?: number;
  cols: number;
}

export function TableLoading({ rows = 5, cols }: TableLoadingProps) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="border-t border-[#F8FAFC]">
          {[...Array(cols)].map((__, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface TableEmptyProps {
  colSpan: number;
  message?: string;
}

export function TableEmpty({ colSpan, message = "No data found." }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center text-sm text-[#94A3B8]">
        {message}
      </td>
    </tr>
  );
}
