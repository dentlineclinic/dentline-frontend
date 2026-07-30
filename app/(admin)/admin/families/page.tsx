// app/admin/families/page.tsx

"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { searchFamilies, type FamilyGroupDto } from "@/services/familyService";
import AdminFamilyModal from "@/components/modals/AdminFamilyModal";

export const dynamic = "force-dynamic";

type DisplayFamily = {
  id: string;
  familyName: string;
  headPatientName?: string;
  headPatientReferenceCode?: string;
  membersCount: number;
  promotedMembersCount: number;
};

function FamiliesPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [families, setFamilies] = useState<DisplayFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  const [search, setSearch] = useState("");

  useEffect(() => {
    const created = searchParams.get("created");
    if (created === "true") {
      toast.success("Family created successfully!");
      window.history.replaceState({}, "", "/admin/families");
    }
  }, [searchParams]);

  const fetchIdRef = useRef(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(
    async (pageNum: number, searchTerm: string, isInitialLoad: boolean) => {
      const requestId = ++fetchIdRef.current;

      if (isInitialLoad) setLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const res = await searchFamilies(searchTerm, pageNum, size);

        if (requestId !== fetchIdRef.current) return;

        if (res.success && res.data) {
          const mapped: DisplayFamily[] = (res.data.content || []).map(
            (f: FamilyGroupDto) => {
              const members = f.members || [];
              const promotedCount = members.filter(
                m => m.promoted || m.linkedPatientId
              ).length;
              
              return {
                id: String(f.id),
                familyName: f.familyName || "—",
                headPatientName: f.headPatientName || undefined,
                headPatientReferenceCode: f.headPatientReferenceCode || undefined,
                membersCount: members.length,
                promotedMembersCount: promotedCount,
              };
            }
          );

          setFamilies(mapped);
          setTotalPages(res.data.totalPages);
          setTotalElements(res.data.totalElements);
        }
      } catch (e: any) {
        if (requestId !== fetchIdRef.current) return;
        setError(e?.message || "Failed to load families.");
      } finally {
        if (requestId !== fetchIdRef.current) return;
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [size]
  );

  // Initial load
  useEffect(() => {
    queueMicrotask(() => {
      fetchData(0, "", true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchData(0, search, false);
      setPage(0);
      debounceRef.current = null;
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData(newPage, search, false);
  };

  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);

  const openFamilyModal = (id: string) => {
    setSelectedFamilyId(id);
    setIsFamilyModalOpen(true);
  };

  const closeFamilyModal = () => {
    setIsFamilyModalOpen(false);
    setSelectedFamilyId(null);
  };

  const handleFamilyUpdated = useCallback(() => {
    fetchData(page, search, false);
  }, [page, search, fetchData]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="search"
              placeholder="Search families by name or head patient..."
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
              className="bg-white border border-[#F1F5F9] rounded-lg px-4 py-2 text-sm text-[#6B7280] outline-none focus:border-[#00685C] w-full sm:w-72"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/families/book"
              className="bg-white text-[#00685C] border border-[#00685C] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#F0FDFA] transition-colors whitespace-nowrap"
            >
              + Book Family Appointment
            </Link>
            <Link
              href="/admin/families/create"
              className="bg-[#00685C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#008375] transition-colors whitespace-nowrap"
            >
              + Create Family
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-[#FFDAD6] text-[#93000A] text-sm font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm flex items-start gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-[#F1F5F9] animate-pulse flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : families.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[#94A3B8]">
              {search
                ? "No matching families found. Try a different keyword."
                : "No families available. Create one to get started."}
            </p>
          </div>
        ) : (
          <>
            {isRefreshing && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 text-xs text-[#0D9488] bg-[#F0FDFA] px-3 py-1 rounded-full">
                  <svg
                    className="animate-spin h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {families.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => openFamilyModal(f.id)}
                  className="text-left bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[#0B1C30] truncate">
                        {f.familyName}
                      </h3>
                      <p className="text-sm text-[#0D9488] font-semibold mt-1">
                        {f.headPatientName || "—"}
                      </p>
                      {f.headPatientReferenceCode && (
                        <p className="text-xs text-[#94A3B8] mt-1">
                          Ref: {f.headPatientReferenceCode}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F0FDFA] text-[#0F766E]">
                        {f.membersCount} member{f.membersCount === 1 ? "" : "s"}
                      </span>
                      {f.promotedMembersCount > 0 && (
                        <span className="text-xs text-[#0D9488]">
                          {f.promotedMembersCount} promoted
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

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

            <p className="text-sm text-[#3D4946]">
              Showing {families.length} of {totalElements} families
            </p>
          </>
        )}
        
        <AdminFamilyModal
          isOpen={isFamilyModalOpen}
          familyId={selectedFamilyId}
          onClose={closeFamilyModal}
          onUpdated={handleFamilyUpdated}
        />
      </main>
    </div>
  );
}

export default function FamiliesPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <FamiliesPageInner />
    </Suspense>
  );
}