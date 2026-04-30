# Requirements Document

## Introduction

This feature adds a Next.js middleware layer that enforces authentication and role-based access control across all protected routes in the Dentline Clinic application. The middleware intercepts every incoming request, inspects a JWT access token stored in an HTTP-only cookie, and either grants access or redirects the user appropriately. It also prevents authenticated users from reaching public auth pages (login, register) and enforces that each role can only access its own route group.

> **Architectural note:** Next.js middleware runs on the Edge Runtime, which has no access to `localStorage`. The current auth flow stores tokens in `localStorage` via `hooks/useLogin.ts`. To make tokens available to the middleware, the login flow must also write the access token (and optionally the refresh token) to cookies. This requirement is captured below.

## Glossary

- **Middleware**: The Next.js `middleware.ts` file executed on the Edge Runtime before a request reaches a route handler or page.
- **Access_Token**: A short-lived JWT that identifies the authenticated user and encodes the user's role. Stored in an HTTP-only cookie named `token`.
- **Refresh_Token**: A long-lived JWT used to obtain a new Access_Token. Stored in an HTTP-only cookie named `refreshToken`.
- **Protected_Route**: Any URL path that begins with `/admin`, `/doctor`, or `/patient`.
- **Auth_Page**: Any URL path that begins with `/login` or `/register`.
- **Public_Route**: Any URL path that is neither a Protected_Route nor an API route — including `/`, `/about`, `/contact`, `/services`, and `/verify`.
- **Role**: A string encoded in the Access_Token JWT payload under the key `role`. Valid values are `ADMIN`, `DOCTOR`, and `PATIENT`.
- **Role_Route_Map**: The mapping between roles and their permitted route prefix: `ADMIN → /admin`, `DOCTOR → /doctor`, `PATIENT → /patient`.
- **Login_Hook**: The `hooks/useLogin.ts` mutation that stores tokens after a successful login response.
- **Unauthorized_Access**: A request to a Protected_Route by a user whose Role does not match the route's required role.

---

## Requirements

### Requirement 1: Token Cookie Persistence

**User Story:** As an authenticated user, I want my access token to be stored in a cookie after login, so that the middleware can read it on every request.

#### Acceptance Criteria

1. WHEN the Login_Hook receives a successful login response, THE Login_Hook SHALL write the `accessToken` value to a cookie named `token` with the `path=/` attribute.
2. WHEN the Login_Hook receives a successful login response, THE Login_Hook SHALL write the `refreshToken` value to a cookie named `refreshToken` with the `path=/` attribute.
3. THE Login_Hook SHALL continue to write both tokens to `localStorage` to preserve compatibility with the existing `lib/axios.ts` interceptor.
4. WHEN a user logs out, THE Login_Hook SHALL delete the `token` and `refreshToken` cookies in addition to clearing `localStorage`.

---

### Requirement 2: Middleware Route Matching

**User Story:** As a system operator, I want the middleware to run only on relevant routes, so that static assets and API routes are not unnecessarily intercepted.

#### Acceptance Criteria

1. THE Middleware SHALL apply its matcher configuration to intercept requests whose paths begin with `/admin`, `/doctor`, or `/patient`.
2. THE Middleware SHALL apply its matcher configuration to intercept requests whose paths begin with `/login` or `/register`.
3. THE Middleware SHALL exclude paths that match `/_next/static`, `/_next/image`, `/favicon.ico`, and `/api` from middleware execution.

---

### Requirement 3: Unauthenticated Access to Protected Routes

**User Story:** As an unauthenticated user, I want to be redirected to the login page when I try to access a protected route, so that I cannot view content that requires authentication.

#### Acceptance Criteria

1. WHEN a request targets a Protected_Route and no `token` cookie is present, THE Middleware SHALL redirect the request to `/login`.
2. WHEN a request targets a Protected_Route and the `token` cookie contains a value that cannot be decoded as a valid JWT, THE Middleware SHALL redirect the request to `/login`.
3. WHEN a request targets a Protected_Route and the Access_Token JWT has an `exp` claim that is in the past, THE Middleware SHALL redirect the request to `/login`.

---

### Requirement 4: Authenticated Access to Auth Pages

**User Story:** As an already-authenticated user, I want to be redirected away from the login and register pages, so that I am not shown forms I do not need.

#### Acceptance Criteria

1. WHEN a request targets an Auth_Page and a valid, non-expired `token` cookie is present, THE Middleware SHALL redirect the request to the route prefix that corresponds to the user's Role according to the Role_Route_Map.
2. WHEN a request targets an Auth_Page and the `token` cookie is absent or invalid, THE Middleware SHALL allow the request to proceed to the Auth_Page.

---

### Requirement 5: Role-Based Access Control

**User Story:** As a system operator, I want each authenticated user to access only the route group that matches their role, so that doctors cannot view admin pages and patients cannot view doctor pages.

#### Acceptance Criteria

1. WHEN a request targets a Protected_Route and the Access_Token contains a Role that matches the route's required role per the Role_Route_Map, THE Middleware SHALL allow the request to proceed.
2. WHEN a request targets a Protected_Route and the Access_Token contains a Role that does not match the route's required role per the Role_Route_Map, THE Middleware SHALL redirect the request to the route prefix that corresponds to the user's Role.
3. IF the Access_Token contains a Role value that is not one of `ADMIN`, `DOCTOR`, or `PATIENT`, THEN THE Middleware SHALL redirect the request to `/login`.

---

### Requirement 6: JWT Decoding on the Edge Runtime

**User Story:** As a developer, I want the middleware to decode JWTs without relying on Node.js-only APIs, so that it runs correctly on the Next.js Edge Runtime.

#### Acceptance Criteria

1. THE Middleware SHALL decode the Access_Token by parsing the Base64URL-encoded payload segment of the JWT without using Node.js `crypto` or `Buffer` APIs that are unavailable on the Edge Runtime.
2. WHEN JWT decoding throws an exception for any reason, THE Middleware SHALL treat the token as invalid and redirect the request to `/login`.
3. THE Middleware SHALL read the `role` claim and the `exp` claim from the decoded JWT payload to make routing decisions.

---

### Requirement 7: Middleware Response Integrity

**User Story:** As a developer, I want the middleware to pass through all valid requests without modifying response headers or body, so that downstream pages and API routes behave normally.

#### Acceptance Criteria

1. WHEN a request is permitted to proceed, THE Middleware SHALL call `NextResponse.next()` without modifying request or response headers beyond what is required for routing.
2. WHEN the Middleware issues a redirect, THE Middleware SHALL use a 307 Temporary Redirect status code so that the HTTP method is preserved.
