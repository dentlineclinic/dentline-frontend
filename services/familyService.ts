// services/familyService.ts

import api from "@/lib/axios";

export type Gender = "MALE" | "FEMALE" | "OTHER" | string;
export type FamilyRelationship =
  | "SON"
  | "DAUGHTER"
  | "SPOUSE"
  | "PARENT"
  | "OTHER"
  | string;

export type CreateFamilyMemberRequest = {
  name: string;
  dateOfBirth?: string; // yyyy-MM-dd
  gender?: Gender;
  relationship?: FamilyRelationship;
  medicalHistory?: string;
};

export type CreateFamilyRequest = {
  familyName: string;
  headPatientId: string;
  members: CreateFamilyMemberRequest[];
};

export type FamilyMemberDto = {
  id: string;
  name?: string;
  dateOfBirth?: string;
  gender?: Gender;
  relationship?: FamilyRelationship;
  linkedPatientId?: string;
  promoted?: boolean;
  createdAt?: string;
  medicalHistory?: string;
};

export type FamilyGroupDto = {
  id: string;
  familyName: string;
  headPatientId?: string;
  headPatientName?: string;
  headPatientReferenceCode?: string;
  createdAt?: string;
  members?: FamilyMemberDto[];
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
};

export type CreateFamilyResponse = {
  success: boolean;
  message: string;
  data: FamilyGroupDto;
};

// ✅ Moved GetFamilyResponse before it's used
export type GetFamilyResponse = {
  success: boolean;
  message: string;
  data: FamilyGroupDto;
};

export type SearchFamiliesResponse = {
  success: boolean;
  message: string;
  data: {
    content: FamilyGroupDto[];
    totalElements: number;
    totalPages: number;
  };
};

// Only email and password - phone number removed
export type PromoteFamilyMemberRequest = {
  email: string;
  password: string;
};

export type AddFamilyMemberRequest = {
  name: string;
  dateOfBirth?: string;
  gender?: Gender;
  relationship?: FamilyRelationship;
  medicalHistory?: string;
};

// ✅ Moved function definitions after all type definitions
export const getFamilyByHeadPatient = async (
  patientId: string
): Promise<GetFamilyResponse> => {
  const res = await api.get<GetFamilyResponse>(`/admin/family/by-patient/${patientId}`);
  return res.data;
};

export const createFamily = async (
  payload: CreateFamilyRequest
): Promise<CreateFamilyResponse> => {
  const res = await api.post<CreateFamilyResponse>("/admin/family", payload);
  return res.data;
};

export const searchFamilies = async (
  name: string,
  page = 0,
  size = 10
): Promise<SearchFamiliesResponse> => {
  const params: Record<string, any> = { page, size };
  if (name.trim()) params.name = name;

  const res = await api.get<SearchFamiliesResponse>("/admin/family/search", {
    params,
  });

  return res.data;
};

export const getFamily = async (id: string): Promise<GetFamilyResponse> => {
  const res = await api.get<GetFamilyResponse>(`/admin/family/${id}`);
  return res.data;
};

export const promoteFamilyMember = async (
  memberId: string,
  payload: PromoteFamilyMemberRequest
): Promise<{ success: boolean; message: string; data: any }> => {
  const res = await api.post(`/admin/family/members/${memberId}/promote`, payload);
  return res.data;
};

export const addMemberToFamily = async (
  familyId: string,
  payload: AddFamilyMemberRequest
): Promise<{ success: boolean; message: string; data: FamilyGroupDto }> => {
  const res = await api.post(`/admin/family/${familyId}/members`, payload);
  return res.data;
};