# Dentline Clinic — API Endpoint Reference

All endpoints are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <accessToken>`.

Standard response envelope (most endpoints):
```json
{ "success": true, "message": "...", "data": ... }
```
Exceptions are noted per endpoint.

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register/request-otp` | Public | Step 1: request OTP. Body: `{ identifier, recaptchaToken }` |
| `POST` | `/auth/register/verify-otp` | Public | Step 2: verify OTP. Body: `{ identifier, otp }` |
| `POST` | `/auth/register` | Public | Step 3: complete registration (full profile, optional `referralCode`) |
| `POST` | `/auth/login` | Public | Patient/doctor login. Body: `{ identifier, password, role }` |
| `POST` | `/auth/admin/login` | Public | Admin login. Body: `{ identifier, password }` |
| `POST` | `/auth/refresh` | Public | Refresh access token. Body: `{ refreshToken }` |
| `POST` | `/auth/logout` | Any role | Invalidate tokens |
| `POST` | `/auth/forgot-password/request` | Public | Request password-reset OTP |
| `POST` | `/auth/forgot-password/verify` | Public | Verify reset OTP |
| `POST` | `/auth/forgot-password/reset` | Public | Set new password |
| `POST` | `/auth/change-password` | Patient / Doctor / Instructor | Change own password. Body: `{ currentPassword, newPassword }` |

---

## Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users/patients/me/profile` | Patient | Get own patient profile. Returns `data.patientId` |
| `PATCH` | `/users/patients/me` | Patient | Update own profile |
| `POST` | `/users/patients/me/photo` | Patient | Upload patient profile photo (multipart) |
| `PATCH` | `/users/patients/{id}/unlock` | Admin | Unlock a locked patient account |
| `PATCH` | `/users/doctors/{id}/activate` | Admin | Activate a doctor account |
| `PATCH` | `/users/doctors/{id}/suspend` | Admin | Suspend a doctor account |
| `POST` | `/users/pilates-instructors` | Admin | Create Pilates instructor login account |
| `GET` | `/users/pilates-instructors` | Admin | List instructor accounts. Params: `page`, `size`, `search` |
| `GET` | `/users/pilates-instructors/me` | Instructor | Get own instructor profile |
| `POST` | `/users/pilates-instructors/{id}/profile/photo` | Admin / Instructor | Upload instructor profile photo (multipart) |

---

## Appointments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/appointments` | Admin | List all appointments. Params: `page`, `size` |
| `GET` | `/appointments/search` | Admin | Search by patient name. Params: `name`, `page`, `size` |
| `GET` | `/appointments/my` | Patient | Patient's own appointments |
| `GET` | `/appointments/doctor` | Doctor | Doctor's assigned appointments |
| `POST` | `/appointments` | Patient | Book individual appointment. Body: `{ appointmentDate }` |
| `POST` | `/appointments/family` | Patient | Book family appointment. Body: `{ appointmentDate, includeHeadPatient, familyMemberIds }` |
| `POST` | `/appointments/admin-book` | Admin | Admin books for a patient. Body: `{ patientId, appointmentDate }` |
| `POST` | `/appointments/admin/family-book` | Admin | Admin books family appointment. Body: `{ headPatientId, appointmentDate, includeHeadPatient, familyMemberIds }` |
| `PATCH` | `/appointments/{id}/arrive` | Admin | Mark patient as arrived |
| `PATCH` | `/appointments/{id}/assign` | Admin | Assign doctor. Body: `{ doctorId }` |
| `PATCH` | `/appointments/{id}/reschedule` | Admin / Patient | Reschedule. Body: `{ newAppointmentDate }` |
| `PATCH` | `/appointments/{id}/cancel` | Admin / Patient | Cancel appointment |
| `GET` | `/appointments/calendar` | Admin | Monthly summary. Params: `year`, `month` |
| `GET` | `/appointments/calendar/{date}` | Admin | Day-level detail. Path param: `YYYY-MM-DD` |

---

## Patients

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/patients` | Admin | List all patients. Params: `page`, `size`, `search` |
| `GET` | `/patients/{id}` | Admin | Get patient by ID |
| `POST` | `/patients` | Admin | Create a patient |
| `GET` | `/patients/dashboard` | Patient | Patient dashboard stats |

---

## Patient Histories (Clinical Records)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/patient-history` | Admin | List all histories. Params: `page`, `size` |
| `GET` | `/patient-history/{id}` | Admin / Doctor / Patient | Get single history |
| `GET` | `/patient-history/patient/{patientId}` | Admin / Doctor | Histories for a patient |
| `GET` | `/patient-history/my` | Patient | Own history list |
| `POST` | `/patient-history` | Admin / Doctor | Create history. Body: `{ appointmentId, observation, location, procedures, amount, discount }` |
| `PATCH` | `/patient-history/{id}` | Admin / Doctor | Update history |
| `PATCH` | `/patient-history/{id}/complete` | Admin / Doctor | Mark history complete |
| `POST` | `/patient-history/{id}/observation` | Admin / Doctor | Add observation text |
| `POST` | `/patient-history/{id}/tooth-observation` | Admin / Doctor | Add FDI tooth observation. Body: `{ fdiCode/fdiCodes, toothType, diagnosis, treatment }` |
| `POST` | `/patient-history/{id}/payment` | Admin | Record payment. Body: `{ amountPaid }` |
| `PATCH` | `/patient-history/{id}/mark-unpaid` | Admin | Reset payment status to unpaid |
| `POST` | `/patient-history/{id}/upload/image` | Admin / Doctor | Upload clinical image (multipart) |
| `POST` | `/patient-history/{id}/upload/video` | Admin / Doctor | Upload clinical video (multipart) |
| `DELETE` | `/patient-history/{id}/image/{imageId}` | Admin / Doctor | Delete clinical image |
| `DELETE` | `/patient-history/{id}/video/{videoId}` | Admin / Doctor | Delete clinical video |

---

## Doctors

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/doctors` | Admin | List all doctors. Params: `page`, `size`, `search` |
| `POST` | `/doctors` | Admin | Create doctor account |
| `GET` | `/doctors/{id}` | Admin | Get doctor by ID |
| `POST` | `/doctors/{id}/photo` | Admin / Doctor | Upload doctor profile photo (multipart) |
| `GET` | `/doctors/dashboard` | Doctor | Doctor dashboard stats |
| `GET` | `/doctors/me` | Doctor | Own doctor profile |
| `PATCH` | `/doctors/me` | Doctor | Update own profile |

---

## Families

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/families` | Admin | List all family groups |
| `GET` | `/families/{id}` | Admin | Get family group |
| `POST` | `/families` | Admin | Create family group. Body: `{ headPatientId, name }` |
| `POST` | `/families/{id}/members` | Admin | Add member to family |
| `DELETE` | `/families/{id}/members/{memberId}` | Admin | Remove member |
| `POST` | `/families/{id}/promote/{memberId}` | Admin | Promote family member to full patient account |
| `GET` | `/families/my` | Patient | Own family group |

---

## Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/payments` | Admin | List all payment records. Params: `page`, `size`, `search` |
| `GET` | `/payments/stats` | Admin | Payment statistics (total billed, revenue, outstanding) |

---

## Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/reports/monthly` | Admin | Monthly report. Params: `year`, `month`, `location` (`IKEJA` or `GBAGADA`; omit for both) |

---

## Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/reviews` | Admin | All reviews. Params: `page`, `size` |
| `GET` | `/reviews/doctor/{doctorId}` | Admin / Doctor | Reviews for a doctor |
| `GET` | `/reviews/my` | Doctor | Own reviews |
| `POST` | `/reviews` | Patient | Submit a review |

---

## Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/notifications` | Admin | List notifications. Params: `page`, `size` |
| `PATCH` | `/notifications/{id}/read` | Admin | Mark notification as read |

---

## Reference Points (Referral)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/reference-points/{patientId}` | Admin | Get patient's reference points |
| `POST` | `/admin/reference-points/add` | Admin | Add points. Body: `{ patientId, points }` |
| `POST` | `/admin/reference-points/remove` | Admin | Remove points. Body: `{ patientId, points }` |

---

## Broadcasts (Email)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/broadcasts` | Admin | List all broadcasts. Params: `page`, `size` |
| `POST` | `/broadcasts` | Admin | Send broadcast. Multipart: `subject`, `body`, optional `flyer` image |
| `GET` | `/broadcasts/recipients` | Admin | List recipients. Params: `page`, `size`, `search` |
| `POST` | `/broadcasts/recipients` | Admin | Add single recipient |
| `POST` | `/broadcasts/recipients/import` | Admin | Bulk import recipients (CSV multipart) |
| `PATCH` | `/broadcasts/recipients/{id}/opt-in` | Admin | Opt recipient in |
| `PATCH` | `/broadcasts/recipients/{id}/opt-out` | Admin | Opt recipient out |

---

## Products (Shop)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/products` | Public | List active products |
| `GET` | `/products/{id}` | Public | Get product by ID |
| `POST` | `/products` | Admin | Create product |
| `PATCH` | `/products/{id}` | Admin | Update product |
| `DELETE` | `/products/{id}` | Admin | Delete product |

---

## Orders (Shop)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/orders` | Admin | List all orders. Params: `page`, `size` |
| `GET` | `/orders/{id}` | Admin | Get order by ID |
| `POST` | `/orders` | Public | Place an order (unauthenticated) |
| `PATCH` | `/orders/{id}/approve` | Admin | Approve payment |
| `PATCH` | `/orders/{id}/reject` | Admin | Reject payment |
| `PATCH` | `/orders/{id}/shipping` | Admin | Update shipping status. Body: `{ status }` — `PROCESSING`, `SHIPPED`, or `DELIVERED` |

---

## Pilates — Programs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/admin/pilates/programs` | Admin | Create program |
| `GET` | `/admin/pilates/programs` | Admin | List programs. Params: `page`, `size` |
| `GET` | `/admin/pilates/programs/active` | Admin | List active programs |
| `GET` | `/admin/pilates/programs/{id}` | Admin | Get program by ID |
| `PATCH` | `/admin/pilates/programs/{id}` | Admin | Update program |
| `PATCH` | `/admin/pilates/programs/{id}/deactivate` | Admin | Deactivate program |

---

## Pilates — Packages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/pilates/packages` | Public | List active packages (patient-facing) |
| `GET` | `/pilates/packages/{id}` | Public | Get package by ID |
| `POST` | `/admin/pilates/packages` | Admin | Create package |
| `GET` | `/admin/pilates/packages` | Admin | List all packages. Params: `page`, `size` |
| `GET` | `/admin/pilates/packages/active` | Admin | List active packages (admin view) |
| `GET` | `/admin/pilates/packages/{id}` | Admin | Get package by ID (admin) |
| `PATCH` | `/admin/pilates/packages/{id}` | Admin | Update package |
| `PATCH` | `/admin/pilates/packages/{id}/deactivate` | Admin | Deactivate package |

---

## Pilates — Instructors (Catalog)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/admin/pilates/instructors` | Admin | Create instructor catalog entry |
| `GET` | `/admin/pilates/instructors` | Admin | List instructors. Params: `page`, `size` |
| `GET` | `/admin/pilates/instructors/active` | Admin | List active instructors |
| `GET` | `/admin/pilates/instructors/{id}` | Admin | Get instructor by ID |
| `PATCH` | `/admin/pilates/instructors/{id}` | Admin | Update instructor (name, bio, certifications) |
| `PATCH` | `/admin/pilates/instructors/{id}/deactivate` | Admin | Deactivate instructor |

---

## Pilates — Classes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/pilates/classes/active` | Authenticated | List active classes (patient/doctor/instructor view) |
| `POST` | `/admin/pilates/classes` | Admin | Create class |
| `GET` | `/admin/pilates/classes` | Admin | List all classes. Params: `page`, `size` |
| `GET` | `/admin/pilates/classes/active` | Admin | List active classes (admin view) |
| `GET` | `/admin/pilates/classes/{id}` | Admin | Get class by ID |
| `GET` | `/admin/pilates/classes/program/{programId}` | Admin | Classes for a program |
| `GET` | `/admin/pilates/classes/instructor/{instructorId}` | Admin | Classes for an instructor |
| `PATCH` | `/admin/pilates/classes/{id}` | Admin | Update class |
| `PATCH` | `/admin/pilates/classes/{id}/deactivate` | Admin | Deactivate class |
| `POST` | `/admin/pilates/classes/{classId}/sessions/generate` | Admin | Generate sessions. Body: `{ classId, startDate, endDate }` (YYYY-MM-DD) |
| `GET` | `/pilates/instructor/classes` | Instructor | Own assigned classes |

---

## Pilates — Sessions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/pilates/sessions/{id}` | Authenticated | Get session by ID |
| `GET` | `/pilates/sessions/upcoming/{classId}` | Authenticated | Upcoming sessions for a class |
| `GET` | `/admin/pilates/sessions/calendar` | Admin | Monthly calendar. Params: `year`, `month` |
| `GET` | `/admin/pilates/sessions/by-date` | Admin | Sessions on a specific date. Param: `date` (YYYY-MM-DD) |
| `GET` | `/admin/pilates/sessions/date-range` | Admin | Sessions in range. Params: `start`, `end`, `page`, `size` |
| `GET` | `/admin/pilates/sessions/class/{classId}` | Admin | All sessions for a class |
| `GET` | `/admin/pilates/sessions/{id}` | Admin | Get session by ID (admin) |
| `PATCH` | `/admin/pilates/sessions/{id}/cancel` | Admin | Cancel a session |
| `GET` | `/pilates/instructor/sessions/upcoming` | Instructor | Own upcoming sessions. Params: `from`, `to` (YYYY-MM-DD) |

---

## Pilates — Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/pilates/bookings` | Patient | Book a session. Body: `{ sessionId, patientId, subscriptionId? }`. Returns HTTP 201 |
| `GET` | `/pilates/bookings/my` | Patient | Own bookings. Params: `page`, `size` |
| `GET` | `/pilates/bookings/{id}` | Patient / Admin | Get booking by ID |
| `PATCH` | `/pilates/bookings/{id}/cancel` | Patient | Cancel booking (no body). Blocked within 48h of session start |
| `GET` | `/pilates/bookings/session/{sessionId}` | Admin / Instructor | Bookings for a session (roster) |
| `GET` | `/pilates/bookings/patient/{patientId}` | Admin | Bookings for a patient. Params: `page`, `size` |
| `PATCH` | `/pilates/bookings/{id}/attendance` | Admin / Instructor | Mark attendance. Body: `{ attended: boolean, notes? }` |

---

## Pilates — Subscriptions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/pilates/subscriptions/checkout` | Patient | Initiate Flutterwave checkout. Body: `{ packageId }`. **No envelope** — returns `{ checkoutUrl, txRef }` directly |
| `GET` | `/pilates/subscriptions/checkout/{txRef}` | Patient | Poll payment status. **No envelope** — returns `{ status, packageName, credits, subscriptionId }`. Status values: `PENDING`, `SUCCESSFUL`, `FAILED`, `CANCELLED` |
| `GET` | `/pilates/subscriptions/payment/callback` | Flutterwave | Payment redirect callback. Params: `tx_ref`, `status`. Informational only — do not call from frontend |
| `POST` | `/pilates/subscriptions/webhook/flutterwave` | Flutterwave only | Webhook — backend-to-backend only, never call from frontend |
| `POST` | `/pilates/subscriptions` | Admin | Manual subscription grant (comps / cash). Body: `{ patientId, packageId }` |
| `GET` | `/pilates/subscriptions/my` | Patient | Own subscription history. Params: `page`, `size` |
| `GET` | `/pilates/subscriptions/my/active` | Patient | Active subscriptions only |
| `GET` | `/pilates/subscriptions/{id}` | Patient / Admin | Get subscription by ID |
| `PATCH` | `/pilates/subscriptions/{id}/cancel` | Patient / Admin | Cancel subscription |
| `GET` | `/pilates/subscriptions/patient/{patientId}` | Admin | Subscriptions for a patient. Params: `page`, `size` |
| `GET` | `/pilates/subscriptions/patient/{patientId}/active` | Admin | Active subscriptions for a patient |

---

## Notes

**Pagination** — Spring Boot defaults: `page` (0-indexed), `size` (default 10). All paged responses include `totalElements`, `totalPages`, `number`, `size`, `content`.

**Clinic locations** — `IKEJA` | `GBAGADA`

**Dental procedures** — `S_AND_P` | `CURETTAGE` | `FILLING` | `X_RAY` | `EXTRACTION` | `TEETH_WHITENING` | `RCT` | `METALLIC_BRACES` | `IMPLANT` | `CROWN` | `BRIDGE`

**Appointment statuses** — `BOOKED` → `ARRIVAL` → `ASSIGN` → `COMPLETE` | `CANCEL` | `MISSED`

**Payment statuses** — `PAID` | `PENDING` | `UNPAID`

**Pilates booking statuses** — `BOOKED` | `ATTENDED` | `CANCELLED` | `NO_SHOW`

**Subscription statuses** — `ACTIVE` | `EXPIRED` | `CANCELLED`

**Pilates session statuses** — `SCHEDULED` | `COMPLETED` | `CANCELLED`

**Order shipping statuses** — `PENDING` | `PROCESSING` | `SHIPPED` | `DELIVERED`
