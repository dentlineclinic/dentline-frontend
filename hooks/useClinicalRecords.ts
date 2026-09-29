import { useQuery } from "@tanstack/react-query";
import {
  fetchAllClinicalRecords,
  fetchClinicalRecordsByPatient,
  fetchClinicalRecordsByDoctor,
  ClinicalModule,
} from "@/services/clinicalRecordService";

export const useAllClinicalRecords = (
  page: number,
  size: number,
  recordType?: ClinicalModule
) => {
  return useQuery({
    queryKey: ["clinical-records", "all", page, size, recordType ?? "ALL"],
    queryFn: () => fetchAllClinicalRecords(page, size, recordType),
    placeholderData: (prev) => prev,
  });
};

export const useClinicalRecordsByPatient = (
  patientId: string | null,
  page: number,
  size: number
) => {
  return useQuery({
    queryKey: ["clinical-records", "patient", patientId, page, size],
    queryFn: () => fetchClinicalRecordsByPatient(patientId!, page, size),
    enabled: !!patientId,
  });
};

export const useClinicalRecordsByDoctor = (
  doctorId: string | null,
  page: number,
  size: number
) => {
  return useQuery({
    queryKey: ["clinical-records", "doctor", doctorId, page, size],
    queryFn: () => fetchClinicalRecordsByDoctor(doctorId!, page, size),
    enabled: !!doctorId,
  });
};