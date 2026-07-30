# Must Change Password Flow - Implementation

## Step 1: Login page redirect
- [x] Edit `app/(landing)/login/page.tsx` - Check `mustChangePassword` after login and redirect to `/patient/profile`

## Step 2: Dashboard page banner
- [x] Edit `app/(patient)/patient/page.tsx` - Show prominent banner when `mustChangePassword` is true

## Step 3: Profile page banner
- [x] Edit `app/(patient)/patient/profile/page.tsx` - Show "change your temporary password" banner and clear flag on success

