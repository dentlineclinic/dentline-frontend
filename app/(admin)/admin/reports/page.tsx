"use client";

import { useEffect, useState } from "react";
import {
  fetchMonthlyReport,
  fetchRecentMonthlyReports,
  type ClinicLocation,
  type MonthlyReport,
  CLINIC_LOCATION_LABELS,
  PROCEDURE_LABELS,
} from "@/services/reportService";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);

export default function MonthlyReportPage() {
  const [selected, setSelected] = useState<MonthlyReport | null>(null);
  const [recent, setRecent] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  /** null = all locations; "IKEJA" / "GBAGADA" = single branch */
  const [location, setLocation] = useState<ClinicLocation | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [single, recentRes] = await Promise.all([
          fetchMonthlyReport(year, month, location),
          fetchRecentMonthlyReports(6, location),
        ]);
        setSelected(single.data);
        setRecent(recentRes.data);
      } catch (err: any) {
        setError(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year, month, location]);

  if (loading) return <div className="p-10 text-[#3D4946]">Loading report…</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;
  if (!selected) return null;

  const maxProcedure = Math.max(1, ...Object.values(selected.procedureCounts));

  return (
    <main className="p-10 flex flex-col gap-6">
      {/* Header with filters */}
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1C30]">
            Monthly Report{location ? ` — ${CLINIC_LOCATION_LABELS[location]}` : ""}
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Clinical activity and revenue summary
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Location toggle */}
          <div className="flex border border-[#E2E8F0] rounded-lg overflow-hidden">
            <button
              onClick={() => setLocation(null)}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                location === null
                  ? "bg-[#00685C] text-white"
                  : "bg-white text-[#3D4946] hover:bg-[#F8FAFC]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setLocation("IKEJA")}
              className={`px-4 py-2 text-sm font-semibold border-l border-[#E2E8F0] transition-colors ${
                location === "IKEJA"
                  ? "bg-[#00685C] text-white"
                  : "bg-white text-[#3D4946] hover:bg-[#F8FAFC]"
              }`}
            >
              Ikeja
            </button>
            <button
              onClick={() => setLocation("GBAGADA")}
              className={`px-4 py-2 text-sm font-semibold border-l border-[#E2E8F0] transition-colors ${
                location === "GBAGADA"
                  ? "bg-[#00685C] text-white"
                  : "bg-white text-[#3D4946] hover:bg-[#F8FAFC]"
              }`}
            >
              Gbagada
            </button>
          </div>

          {/* Month picker */}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm text-[#0B1C30]"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString("en-US", { month: "long" })}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-[#E2E8F0] rounded-lg px-4 py-2 w-28 text-sm text-[#0B1C30]"
          />
        </div>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Paid" value={fmt(selected.totalAmountPaid)} />
        <KpiCard label="Outstanding" value={fmt(selected.totalOutstanding)} />
        <KpiCard label="Total Histories" value={selected.totalHistories} />
        <KpiCard
          label="New vs Old"
          value={`${selected.newPatients} new · ${selected.oldPatients} old`}
        />
      </div>

      {/* Per-location breakdown — only when viewing ALL */}
      {selected.byLocation && (
        <section className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0B1C30] mb-4">By Location</h2>
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] text-[#3D4946]">
              <tr>
                <th className="text-left px-4 py-2">Location</th>
                <th className="text-right px-4 py-2">Histories</th>
                <th className="text-right px-4 py-2">New</th>
                <th className="text-right px-4 py-2">Old</th>
                <th className="text-right px-4 py-2">Amount Paid</th>
                <th className="text-right px-4 py-2">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(selected.byLocation) as ClinicLocation[]).map((loc) => {
                const snap = selected.byLocation![loc];
                return (
                  <tr key={loc} className="border-t border-[#F8FAFC]">
                    <td className="px-4 py-2 font-medium text-[#0B1C30]">
                      {CLINIC_LOCATION_LABELS[loc]}
                    </td>
                    <td className="px-4 py-2 text-right">{snap.totalHistories}</td>
                    <td className="px-4 py-2 text-right text-[#0D9488]">
                      {snap.newPatients}
                    </td>
                    <td className="px-4 py-2 text-right text-[#3D4946]">
                      {snap.oldPatients}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {fmt(snap.totalAmountPaid)}
                    </td>
                    <td className="px-4 py-2 text-right text-[#93000A]">
                      {fmt(snap.totalOutstanding)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* Procedures bar chart */}
      <section className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#0B1C30] mb-4">
          Procedures Performed
          {location && (
            <span className="text-sm font-normal text-[#94A3B8]">
              {" "}
              — {CLINIC_LOCATION_LABELS[location]}
            </span>
          )}
        </h2>
        <div className="flex flex-col gap-2">
          {Object.entries(selected.procedureCounts).map(([key, count]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-40 text-sm text-[#3D4946]">
                {PROCEDURE_LABELS[key] ?? key}
              </span>
              <div className="flex-1 bg-[#F1F5F9] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#00685C] h-full rounded-full"
                  style={{ width: `${(count / maxProcedure) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right text-sm font-bold text-[#0B1C30]">
                {count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent months table */}
      <section className="bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#0B1C30] mb-4">
          Last 6 Months
          {location && (
            <span className="text-sm font-normal text-[#94A3B8]">
              {" "}
              — {CLINIC_LOCATION_LABELS[location]}
            </span>
          )}
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC] text-[#3D4946]">
            <tr>
              <th className="text-left px-4 py-2">Month</th>
              <th className="text-right px-4 py-2">Histories</th>
              <th className="text-right px-4 py-2">New</th>
              <th className="text-right px-4 py-2">Old</th>
              <th className="text-right px-4 py-2">Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={`${r.year}-${r.month}`} className="border-t border-[#F8FAFC]">
                <td className="px-4 py-2 font-medium text-[#0B1C30]">{r.label}</td>
                <td className="px-4 py-2 text-right">{r.totalHistories}</td>
                <td className="px-4 py-2 text-right text-[#0D9488]">
                  {r.newPatients}
                </td>
                <td className="px-4 py-2 text-right text-[#3D4946]">
                  {r.oldPatients}
                </td>
                <td className="px-4 py-2 text-right font-semibold">
                  {fmt(r.totalAmountPaid)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm">
      <p className="text-xs text-[#3D4946]">{label}</p>
      <p className="text-2xl font-bold text-[#0B1C30] mt-1">{value}</p>
    </div>
  );
}