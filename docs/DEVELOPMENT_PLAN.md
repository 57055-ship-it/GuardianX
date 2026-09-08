# GuardianX Development Plan & Phase Progression

## Completed Phases

### Phase 1 — Monorepo Foundation & Core Auth
- Project structure created (`mobile/`, `server/`, `docs/`, `README.md`).
- Node.js/Express backend setup with MongoDB connection configuration.
- Flutter app initialized with Material 3 Theme, Provider state management, and role-based shell routing.
- Auth endpoints: Register, Login, Refresh, Logout, Profile.

### Phase 2 — Family Multi-Tenancy & Secure Device Pairing
- Mongoose models: `Tenant`, `User`, `ChildProfile`, `Device`, `PairingCode`.
- Temporary 6-character pairing code API (`POST /api/pairing/create` & `POST /api/pairing/join`).
- Tenant isolation middleware (`tenantIsolationMiddleware`).

### Phase 3 — Parent & Child Role Dashboards
- ONE Flutter application serving `ParentShell` and `ChildShell`.
- Parent Dashboard: Child cards, online status, battery level, location summary, screen time, safety score, quick actions, recent alerts.
- Child Dashboard: Friendly greeting, status badges, screen time progress, prominent SOS button, family routine tracker.

### Phase 4 — Location Services & Safe Zones (Geofencing)
- `LocationRecord` & `Geofence` models.
- Haversine distance formula for boundary detection.
- Geofence enter/exit automatic alerts.
- Parent location history timeline & safe zone management screen.

### Phase 5 — Digital Wellbeing & App Usage Abstraction
- `AppUsage` & `ScreenTime` models.
- Android UsageStats service abstraction.
- Daily screen time totals and app usage breakdown.

### Phase 6 — Emergency SOS & Alert Engine
- `SOSEvent` & `Alert` models.
- Child one-tap SOS distress trigger with double-confirmation dialog.
- Automated creation of critical severity alerts on Parent dashboard.

### Phase 7 — Family Routine, Prayer Reminders & Hadith Sessions
- `FamilyRoutine` & `RoutineCompletion` models.
- Prayer reminders (Fajr, Dhuhr, Asr, Maghrib, Isha).
- Interactive Hadith session player (Arabic, English, Urdu, Authenticity, Audio simulator).

### Phase 8 — Comprehensive Reports & Explainable Safety Insights
- Daily & Weekly safety reports.
- Explainable rule-based safety insights engine (Screen time anomalies, device inactivity, safe zone exits).
- Transparent Safety Score (0–100).

### Phase 9 — Subscription-Ready SaaS Entitlements
- Plan configuration (`FREE`, `FAMILY`, `PREMIUM`).
- Server-side entitlement middleware (`checkEntitlement`).
- Child limits and location history restriction.

### Phase 10 — Testing, Verification & Hardening
- Backend integration test suite (`server/tests/api.test.js`).
- Flutter unit tests (`mobile/test/widget_test.dart`).
- Full architectural and static analysis check.
