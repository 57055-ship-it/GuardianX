# GuardianX Security Architecture & Privacy Policy

## Security Principles

### 1. Multi-Tenant Data Isolation
- Every core MongoDB collection features a mandatory `tenantId` field.
- Database queries inside controllers and service layers strictly filter by `req.tenantId` derived from the authenticated JWT token.
- Cross-tenant data leakage is prevented at the server query level — frontend restrictions are never relied upon as the sole security boundary.

### 2. Authentication & Authorization
- **Password Hashing**: Passwords are hashed using `bcryptjs` with a cost factor of 10. Plain-text passwords are never logged or stored.
- **JWT Tokens**: Short-lived access tokens (1 day) and long-lived refresh tokens (7 days).
- **Role-Based Access Control (RBAC)**: Middleware `roleMiddleware(['parent', 'admin'])` restricts parent management endpoints.

### 3. Network & Infrastructure Security
- **Helmet Headers**: Express uses `helmet` to set secure HTTP headers (XSS Protection, HSTS, No-Sniff).
- **CORS Configuration**: Restricts unauthorized cross-origin requests.
- **Rate Limiting**: `express-rate-limit` prevents brute-force login attempts (200 requests per 15 mins).

### 4. Privacy & Data Minimization
- Data collected is strictly limited to child safety metrics: GPS location, battery level, online status, app usage durations, emergency SOS signals, and family routine completions.
- Secrets (`JWT_SECRET`, `MONGODB_URI`) are loaded from environment variables (`.env`).
