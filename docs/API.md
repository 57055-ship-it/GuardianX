# GuardianX REST API Documentation

Base URL: `http://localhost:5000/api`

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Human readable error message"
}
```

---

## Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a parent and initialize family tenant.
- `POST /api/auth/login` — Authenticate parent or child user.
- `POST /api/auth/refresh` — Issue new JWT access token using refresh token.
- `POST /api/auth/logout` — Invalidate user session.
- `GET  /api/auth/me` — Fetch current user profile.

### Family & Subscription (`/api/families`)
- `GET /api/families/me` — Get family tenant details and entitlements.
- `PUT /api/families/plan` — Update SaaS subscription plan (`FREE`, `FAMILY`, `PREMIUM`).

### Children (`/api/children`)
- `GET    /api/children` — List children for current tenant.
- `POST   /api/children` — Create new child profile (Enforces plan max limit).
- `GET    /api/children/:id` — Fetch child details by ID.
- `PUT    /api/children/:id` — Update child profile.
- `DELETE /api/children/:id` — Delete child profile and linked device.

### Secure Device Pairing (`/api/pairing`)
- `POST /api/pairing/create` — Parent generates 6-character 15-min pairing code.
- `POST /api/pairing/join` — Child enters code to pair device and obtain Child JWT token.

### Devices (`/api/devices`)
- `POST /api/devices/heartbeat` — Report device battery, online status, and last seen timestamp.
- `GET  /api/devices/:childId` — Get device status for a child.

### Location & Safe Zones (`/api/location`, `/api/geofences`)
- `POST /api/location` — Child submits latitude/longitude update.
- `GET  /api/location/:childId/latest` — Fetch latest recorded location.
- `GET  /api/location/:childId/history` — Fetch location history timeline (Requires `FAMILY` or `PREMIUM` plan).
- `GET    /api/geofences?childId=:childId` — Fetch safe zone geofences.
- `POST   /api/geofences` — Create new safe zone.
- `PUT    /api/geofences/:id` — Update safe zone.
- `DELETE /api/geofences/:id` — Remove safe zone.

### App Usage & Screen Time (`/api/usage`)
- `POST /api/usage/record` — Record app usage duration & calculate total screen time.
- `GET  /api/usage/app-usage/:childId` — Fetch daily app usage breakdown.
- `GET  /api/usage/screen-time/:childId` — Fetch total daily screen time.

### Emergency SOS & Alerts (`/api/sos`, `/api/alerts`)
- `POST /api/sos` — Child triggers emergency distress signal.
- `GET  /api/sos/:childId` — Fetch SOS events.
- `PUT  /api/sos/:id/resolve` — Mark SOS as resolved.
- `GET  /api/alerts` — Fetch alert feed and unread badge count.
- `POST /api/alerts` — Create alert.
- `PUT  /api/alerts/:id/read` — Mark alert as read.

### Family Routines & Hadith (`/api/routines`)
- `POST /api/routines` — Parent creates routine (Prayer reminder / Hadith session).
- `GET  /api/routines` — Fetch today's routines and completion status.
- `POST /api/routines/complete` — Mark routine as completed.
- `GET  /api/routines/hadith/today` — Get today's Hadith content (Arabic, English, Urdu, Authenticity).

### Reports & Analytics (`/api/reports`, `/api/analytics`)
- `GET /api/reports/daily` — Daily safety summary report.
- `GET /api/reports/weekly` — Weekly screen time and usage trends (Requires `FAMILY` or `PREMIUM` plan).
- `GET /api/analytics/insights` — Explainable rule-based safety insights and score.
