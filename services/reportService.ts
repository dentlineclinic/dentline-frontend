import api from "@/lib/axios";

// ============================================
// REPORT TYPES
// ============================================

export type ClinicLocation = "IKEJA" | "GBAGADA";

/**
 * Compact per-location view returned inside the "all locations" report.
 */
export interface LocationSnapshot {
  totalAmountPaid: number;
  totalOutstanding: number;
  totalHistories: number;
  newPatients: number;
  oldPatients: number;
  procedureCounts: Record<string, number>;
}

export interface MonthlyReport {
  year: number;
  month: number;
  label: string;
  periodStart: string;
  periodEnd: string;

  /** null when the report covers all locations combined */
  location: ClinicLocation | null;

  totalAmountPaid: number;
  totalOutstanding: number;
  totalHistories: number;
  newPatients: number;
  oldPatients: number;

  procedureCounts: Record<string, number>;
  revenueByStatus: Record<string, number>;
  historiesByType: Record<string, number>;

  /** Populated only when location === null */
  byLocation: Record<ClinicLocation, LocationSnapshot> | null;
}

export interface MonthlyReportResponse {
  success: boolean;
  message: string;
  data: MonthlyReport;
}

export interface RecentMonthlyReportsResponse {
  success: boolean;
  message: string;
  data: MonthlyReport[];
}

// ============================================
// LABELS & OPTIONS (mirrors patientHistoryService)
// ============================================

export const CLINIC_LOCATION_LABELS: Record<ClinicLocation, string> = {
  IKEJA: "Ikeja",
  GBAGADA: "Gbagada",
};

export const PROCEDURE_LABELS: Record<string, string> = {
  S_AND_P: "S&P",
  CURETTAGE: "Curettage",
  FILLING: "Filling",
  X_RAY: "X-ray",
  EXTRACTION: "Extraction",
  TEETH_WHITENING: "Teeth Whitening",
  RCT: "RCT",
  METALLIC_BRACES: "Metallic Braces",
  IMPLANT: "Implant",
  CROWN: "Crown",
  BRIDGE: "Bridge",
};

export const CLINIC_LOCATION_OPTIONS: ClinicLocation[] = ["IKEJA", "GBAGADA"];

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch the monthly report for a specific year + month.
 * Pass `location` to scope the report to a single branch.
 * Omit it (or pass null) for the all-locations report, which also
 * includes a per-location breakdown in `byLocation`.
 */
export const fetchMonthlyReport = async (
  year: number,
  month: number,
  location?: ClinicLocation | null
): Promise<MonthlyReportResponse> => {
  const params: Record<string, any> = { year, month };
  if (location) params.location = location;

  const res = await api.get<MonthlyReportResponse>(
    "/admin/reports/monthly",
    { params }
  );
  return res.data;
};

/**
 * Fetch the last N months (default 6), most recent first.
 * Optionally scoped to a single location.
 */
export const fetchRecentMonthlyReports = async (
  months = 6,
  location?: ClinicLocation | null
): Promise<RecentMonthlyReportsResponse> => {
  const params: Record<string, any> = { months };
  if (location) params.location = location;

  const res = await api.get<RecentMonthlyReportsResponse>(
    "/admin/reports/monthly/recent",
    { params }
  );
  return res.data;
};