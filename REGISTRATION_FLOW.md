# Registration Flow Implementation

## Overview
A complete 3-step OTP-first registration flow has been implemented following the existing codebase patterns and styling conventions.

## Architecture

### Routes
- `/register` → Redirects to `/register/request-otp`
- `/register/request-otp` → Step 1: Email OTP request
- `/register/verify-otp` → Step 2: OTP verification
- `/register/complete` → Step 3: Full registration form

### API Integration

#### Services (`services/authService.ts`)
Three new API functions added:
- `requestRegistrationOtp(payload)` → `POST /auth/register/request-otp`
- `verifyRegistrationOtp(payload)` → `POST /auth/register/verify-otp`
- `completeRegistration(payload)` → `POST /auth/register`

#### Hooks
Three new React Query mutation hooks:
- `useRequestOtp()` - handles OTP request
- `useVerifyOtp()` - handles OTP verification
- `useRegister()` - handles final registration

### State Management
Uses `sessionStorage` to persist registration progress:
- `reg_email` - stores verified email
- `reg_otp_verified` - flag indicating OTP verification success

### Flow Protection
Each step validates that previous steps are completed:
- Step 2 checks for `reg_email`
- Step 3 checks for both `reg_email` and `reg_otp_verified`
- Missing state redirects back to Step 1

## Features

### Step 1: Request OTP (`/register/request-otp`)
- Email input with validation
- Loading state during API call
- Error handling with user-friendly messages
- Progress indicator showing current step
- Stores email in sessionStorage on success
- Auto-navigates to Step 2

### Step 2: Verify OTP (`/register/verify-otp`)
- 6-digit OTP input with auto-focus
- Paste support (full OTP paste)
- Backspace navigation between inputs
- Visual feedback (green border on filled digits)
- 60-second countdown timer for resend
- Resend OTP functionality
- Success/error alerts
- Back button to change email
- Stores verification flag on success
- Auto-navigates to Step 3

### Step 3: Complete Registration (`/register/complete`)
- Pre-filled, read-only email field (verified)
- All required fields with validation:
  - Full Name
  - Password (with visibility toggle)
  - Confirm Password (with match validation)
  - Phone Number
  - Date of Birth (with max date = today)
  - Gender (dropdown)
  - Emergency Contact Name
  - Emergency Contact Phone
  - Medical History (textarea)
  - Reference Code (optional)
- Client-side validation before submission
- Field-level error messages
- Server error handling
- Clears sessionStorage on success
- Redirects to `/login` after successful registration

## Design Consistency

### Styling
- Matches existing color palette (teal primary, navy text, slate secondary)
- Uses same gradient backgrounds with blur decorations
- Consistent border radius, shadows, and spacing
- Reuses existing form input patterns
- Responsive design (mobile-first)

### Components
- Uses existing patterns from login page
- Consistent button styles with loading states
- Matching error/success alert styling
- Same footer and typography

### UX Patterns
- Step indicator shows progress
- Loading spinners during async operations
- Disabled states prevent double-submission
- Clear error messages
- Success feedback
- Smooth navigation flow

## Technical Details

### Dependencies
- TanStack React Query for mutations
- Axios for HTTP requests (via existing `lib/axios.ts`)
- Next.js App Router with client components
- TypeScript for type safety

### Error Handling
- Network errors caught and displayed
- Validation errors shown per-field
- Server errors displayed at form level
- Graceful fallback messages

### Security
- OTP verification required before registration
- Password confirmation
- Read-only verified email
- Session-based flow protection

## Testing Checklist
- [ ] Step 1: Email submission sends OTP
- [ ] Step 2: OTP verification works
- [ ] Step 2: Resend OTP after countdown
- [ ] Step 2: Paste full OTP works
- [ ] Step 3: All validations work
- [ ] Step 3: Password visibility toggle
- [ ] Step 3: Form submission creates account
- [ ] Flow protection: can't skip steps
- [ ] Error handling: network failures
- [ ] Error handling: invalid OTP
- [ ] Error handling: registration failures
- [ ] Redirect to login after success
- [ ] Mobile responsive design
