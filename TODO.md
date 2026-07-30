# Fix PatientHistoriesPage Error - TODO

## Issue
`PatientHistory` interface in `services/patientHistoryService.ts` is missing family-related fields causing TypeScript error in `app/(admin)/admin/patient-histories/page.tsx`.

## Steps

- [x] 1. Add family fields to `PatientHistory` interface in `services/patientHistoryService.ts`
- [x] 2. Add family fields to mock data in `app/api/routes.ts` for consistency

## Changes Made

**`services/patientHistoryService.ts`**
- Added optional family fields to the `PatientHistory` interface:
  - `familyMemberId?: string`
  - `familyMemberName?: string`
  - `appointmentType?: "INDIVIDUAL" | "FAMILY"`

**`app/api/routes.ts`**
- Added `familyMemberId`, `familyMemberName`, and `appointmentType` fields to the mock `getPatientHistories()` return data (set to `undefined` / `"INDIVIDUAL"` for mock consistency)

