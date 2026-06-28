# TODO - Google reCAPTCHA v3 Integration (Frontend)

- [ ] Create/verify `.env.local` contains `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- [ ] Wrap app in `GoogleReCaptchaProvider` in `app/layout.tsx` (preserve existing providers/structure)
- [ ] Update registration OTP request page: `app/(landing)/register/request-otp/page.tsx`
  - [ ] Import and initialize `useGoogleReCaptcha`
  - [ ] Generate `captchaToken` in submit handler before calling mutation
  - [ ] Include `captchaToken` in mutation payload
  - [ ] Ensure submit handler remains consistent (convert to async only if needed)
- [ ] Update forgot password page: `app/(landing)/forgot-password/page.tsx`
  - [ ] Import and initialize `useGoogleReCaptcha`
  - [ ] Generate `captchaToken` in `handleRequestOtp` before calling mutation
  - [ ] Include `captchaToken` in mutation payload
- [ ] Update `services/authService.ts`
  - [ ] Update payload types for `requestRegistrationOtp` and `requestPasswordOtp` to include `captchaToken: string`
- [ ] Run `npm run lint` and `npm run build` (or at least `npm run lint`)

