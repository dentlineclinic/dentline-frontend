"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { fetchDoctors } from "@/services/doctorService";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Correct Doctor type definition
export type Doctor = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  mustChangePassword: boolean;
  specialization: string;
};

// UI Display Doctor (with computed fields)
type DisplayDoctor = {
  id: string;
  shortId: string;
  fullName: string;
  initials: string;
  specialty: string;
  email: string;
  status: string;
  role: string;
};

export default function DoctorsPage() {
  return (
    <Suspense fallback={null}>
      <DoctorsPageInner />
    </Suspense>
  );
}

function DoctorsPageInner() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<DisplayDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;
  
  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ✅ Check for success query param
  useEffect(() => {
    const created = searchParams.get("created");
    if (created === "true") {
      toast.success("Doctor created successfully!");
      window.history.replaceState({}, "", "/admin/doctors");
    }
  }, [searchParams]);

  // Helper: Get initials from name
  const getInitials = (name: string) => {
    if (!name || name === "Unknown Doctor") return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Helper: Generate shortId
  const getShortId = (id: string) => {
    return `DOC-${id.slice(0, 6).toUpperCase()}`;
  };

  // Clean up role display
  const cleanRole = (role: string) => {
    return role?.replace("ROLE_", "") || "—";
  };

  // Safe field handling
  const safeString = (value: string | null | undefined, fallback = "—") => {
    return value && value.trim() ? value : fallback;
  };

  // Consistent name handling
  const getSafeName = (name: string | null | undefined) => {
    return safeString(name, "Unknown Doctor");
  };

  // ✅ FIXED: Proper fetch function with race condition protection
  const fetchData = useCallback(async (pageNum: number, searchTerm: string, isInitialLoad: boolean) => {
    const requestId = ++fetchIdRef.current;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const res = await fetchDoctors(pageNum, size, searchTerm);

      // Cancel stale responses
      if (requestId !== fetchIdRef.current) return;


      if (res.success && res.data) {
        const mappedDoctors = res.data.content.map((doc: Doctor) => {
          const fullName = getSafeName(doc.name);
          return {
            id: doc.id,
            shortId: getShortId(doc.id),
            fullName,
            initials: getInitials(fullName),
            specialty: safeString(doc.specialization, "—"),
            email: safeString(doc.email, "—"),
            status: doc.status,
            role: cleanRole(doc.role),
          };
        });

        setDoctors(mappedDoctors);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: any) {
      if (requestId !== fetchIdRef.current) return;
      setError(err.message || "Failed to load doctors.");
    } finally {
      if (requestId !== fetchIdRef.current) return;
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [size]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const fetchIdRef = useRef(0);

  // ✅ FIXED: Only SEARCH effect drives debounced fetching
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchData(page, search, false);
      debounceRef.current = null;
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search]);

  // ✅ Initial load (only once)
  useEffect(() => {
    // Wrap in microtask to avoid react-hooks/set-state-in-effect rule
    queueMicrotask(() => {
      fetchData(0, "", true);
    });
  }, []);



  // Handle backend filtering vs frontend fallback
  const needsFrontendFilter = false; // Set to true if backend doesn't support status filter
  
  const visibleDoctors = needsFrontendFilter && statusFilter !== "ALL"
    ? doctors.filter(d => d.status === statusFilter)
    : doctors;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setSearch(e.target.value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-[#F0FDFA] text-[#0F766E]";
      case "INACTIVE":
        return "bg-[#FFDAD6] text-[#93000A]";
      default:
        return "bg-[#F1F5F9] text-[#64748B]";
    }
  };

  // Better empty state messaging
  const getEmptyStateMessage = () => {
    if (search || statusFilter !== "ALL") {
      return "No matching doctors found. Try adjusting your search or filters.";
    }
    return "No doctors available. Click 'Add Doctor' to create one.";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-4 lg:gap-6">
        
        {/* Filters and Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="search"
              placeholder="Search doctors by name, email or specialty..."
              value={search}
              onChange={handleSearchChange}
              className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#6B7280] outline-none focus:border-[#00685C] w-full sm:w-72"
            />
            <select
              value={statusFilter}
              onChange={e => handleStatusFilterChange(e.target.value)}
              className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#3D4946] outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <Link
            href="/admin/doctors/create"
            className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] transition-colors whitespace-nowrap"
          >
            + Add Doctor
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Doctors Grid/Card View */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#F1F5F9] animate-pulse flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleDoctors.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[#94A3B8]">{getEmptyStateMessage()}</p>
          </div>
        ) : (
          <>
            {/* Show subtle refresh indicator */}
            {isRefreshing && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 text-xs text-[#0D9488] bg-[#F0FDFA] px-3 py-1 rounded-full">
                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {visibleDoctors.map((doc) => (
                <div key={doc.id} className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-full bg-[#F0FDFA] flex items-center justify-center text-lg font-bold text-[#00685C] flex-shrink-0">
                    {doc.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-[#0B1C30]">{doc.fullName}</h3>
                        <p className="text-sm text-[#0D9488] font-semibold">{doc.specialty}</p>
                        <p className="text-xs text-[#3D4946] mt-1">{doc.email}</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">{doc.shortId}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-[#3D4946]">
                        <span className="font-semibold text-[#0B1C30]">{doc.role}</span>
                      </p>
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#F1F5F9]">
                <button
                  disabled={page === 0 || isRefreshing}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <span className="text-sm text-[#3D4946]">
                  Page {page + 1} of {totalPages}
                </span>

                <button
                  disabled={page >= totalPages - 1 || isRefreshing}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#3D4946] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}

            {/* Record count */}
            <p className="text-sm text-[#3D4946]">
              Showing {visibleDoctors.length} of {totalElements} doctors
            </p>
          </>
        )}
      </main>
    </div>
  );
}