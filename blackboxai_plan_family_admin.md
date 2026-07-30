## Plan: Admin Family Page (UI) for Dentline Frontend

### Information Gathered
- Admin layout uses `Sidebar` with hardcoded `adminNavItems` in `app/(admin)/admin/layout.tsx`.
- There is already an admin doctors page at `app/(admin)/admin/doctors/page.tsx` that shows common UI patterns: search/filter, card grid, pagination, and success toast via query param.
- API client uses `@/lib/axios` and services wrap endpoint calls.
- `services/adminService.ts` currently exists but does not include family endpoints.
- Ripgrep search tool is unavailable (ripgrep binary missing), so file discovery is done via targeted `list_files` and `read_file`.

### Plan
1. **Navigation**: Update `app/(admin)/admin/layout.tsx` to add a new sidebar item:
   - Label: “Families”
   - Href: `/admin/families`
2. **API Service**: Add `services/familyService.ts` implementing:
   - `createFamily(payload)` -> POST `/admin/family`
   - `searchFamilies(name, page, size)` -> GET `/admin/family/search?name=...&page=...&size=...`
   - `getFamily(id)` -> GET `/admin/family/{id}`
3. **Families List Page**: Create `app/(admin)/admin/families/page.tsx`:
   - Client component
   - Search by family name/keyword (debounced like doctors page)
   - Pagination (page, totalPages)
   - Empty + loading states consistent with existing UI
   - “Create Family” CTA linking to `/admin/families/create`
4. **Create Family Page**: Create `app/(admin)/admin/families/create/page.tsx`:
   - Form fields:
     - familyName
     - headPatientId
     - members[]: at least 1 member (name, dateOfBirth, gender, relationship)
   - On submit call `createFamily`
   - On success route back to `/admin/families?created=true` and show toast

### Dependent Files to be edited/added
- Edit:
  - `app/(admin)/admin/layout.tsx`
- Add:
  - `services/familyService.ts`
  - `app/(admin)/admin/families/page.tsx`
  - `app/(admin)/admin/families/create/page.tsx`

### Followup steps after editing
- Run dev server and ensure routing:
  - `/admin/families`
  - `/admin/families/create`
- Validate that API base URL and auth bearer token flow works with axios interceptor.




