# Phase 4 Staging Deployment Preparation Report

**Project Name**: GUARDIANX  
**Title**: "GuardianX: A SaaS-Based Mobile Platform for Child Safety and Digital Wellbeing"  
**Phase**: Phase 4 — Staging Deployment Preparation  
**Date**: September 7, 2026  

---

## 1. Environment Variables Specification

The GuardianX Node.js Express backend requires the following environment variables. In staging and production environments, configure these variables in your hosting provider's dashboard (e.g. Render, Railway, Heroku, AWS Parameter Store, or Docker `.env`).

| Environment Variable | Description | Development Default | Staging / Production Example |
|---|---|---|---|
| `PORT` | HTTP Server Listening Port | `5050` | `5050` (or assigned by host via `$PORT`) |
| `NODE_ENV` | Runtime Execution Mode | `development` | `production` |
| `MONGODB_URI` | MongoDB Connection String | `mongodb://localhost:27017/guardianx` | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/guardianx?retryWrites=true&w=majority` |
| `JWT_SECRET` | Cryptographic key for Access JWTs | `guardianx_super_secret_jwt_access_key_2026` | High-entropy random 256-bit string |
| `JWT_REFRESH_SECRET` | Cryptographic key for Refresh JWTs | `guardianx_super_secret_jwt_refresh_key_2026` | High-entropy random 256-bit string |
| `JWT_EXPIRES_IN` | Access token lifespan | `1d` | `1d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` | `7d` |
| `CORS_ORIGIN` | Allowed HTTP origin for web clients | `*` | `https://admin.guardianx.app` or `*` for mobile clients |

---

## 2. Backend Deployment Requirements

1. **Node.js Runtime**: Node.js v18.x, v20.x, or v26.x.
2. **Process Manager / Container**: Managed container service (Render, Railway, Fly.io, AWS App Runner, or PM2 on EC2).
3. **Database Driver**: Mongoose ODM v8.12.1 using native MongoDB SRV connections.
4. **Security Middleware**:
   - `helmet` for secure HTTP headers.
   - `cors` configured via `CORS_ORIGIN`.
   - `express-rate-limit` restricting requests (200 requests / 15 mins per IP).
5. **Production Error Masking**: `NODE_ENV === 'production'` masks unhandled exception stack traces from API responses.

---

## 3. MongoDB Requirements & Atlas Integration

1. **MongoDB Version**: MongoDB 6.0+ or MongoDB Atlas (M0 Free Tier, M10, or Serverless).
2. **Database Indexes**: Ensure indexes on `tenantId`, `email` (User), `childId`, `code` (PairingCode), `timestamp` (LocationRecord, SOSEvent).
3. **Network Access**: Configure MongoDB Atlas IP Access List:
   - Allow host IP or `0.0.0.0/0` (with strong password authentication) for cloud PaaS deployments.
4. **Connection Pool**: Mongoose handles automatic reconnection and connection pooling.

---

## 4. Security Checklist & Audit Findings

- [x] **No Committed Secrets**: Repository scanned; zero passwords, tokens, or private credentials committed to Git.
- [x] **Git Hygiene**: `.env` is listed in `.gitignore`; `.env.example` provides non-sensitive placeholders.
- [x] **Role-Based Access Control (RBAC)**: `roleMiddleware(['parent'])` blocks child JWTs from invoking administrative endpoints (HTTP 403).
- [x] **Multi-Tenant Data Segregation**: Server controllers enforce `tenantId: req.tenantId` on all database queries.
- [x] **Password Protection**: User passwords hashed via `bcryptjs` with cost factor 10.
- [x] **Pairing Security**: Pairing codes are single-use 6-character strings with a 15-minute TTL expiration.
- [x] **Health Check Endpoints**: `GET /health` and `GET /api/health` respond with service status HTTP 200.

---

## 5. CORS Requirements

Mobile applications (Flutter iOS / Android) communicate directly via native HTTP clients and do not send browser `Origin` headers. For web dashboards or admin tools:
- Set `CORS_ORIGIN=*` for universal mobile client access.
- Or set `CORS_ORIGIN=https://admin.guardianx.app` if deploying a dedicated web management console.

---

## 6. Flutter Production API Configuration

The Flutter mobile application supports building against HTTPS production endpoints without modifying source code.

### Compile-Time API Endpoint Selection:
```bash
# Build Android APK pointing to staging HTTPS API
cd mobile
flutter build apk --release --dart-define=API_BASE_URL=https://api.guardianx.app/api

# Run Flutter in debug mode pointing to staging API
flutter run --dart-define=API_BASE_URL=https://api.guardianx.app/api
```

### Runtime Dynamic Override:
`ApiConstants.customHostOverride` permits setting a custom API URL at runtime within app settings.

---

## 7. Step-by-Step Manual Deployment Guide

### Option A: Deploying Backend to Render / Railway
1. **Connect Repository**: Push GuardianX monorepo to GitHub / GitLab and connect repository in Render or Railway dashboard.
2. **Root Directory**: Set root directory to `server`.
3. **Build & Start Commands**:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Environment Variables**: Add `PORT`, `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN` in host dashboard.

### Option B: Deploying Database to MongoDB Atlas
1. Create cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create database user (e.g. `guardianx_admin`) with strong password.
3. Obtain connection string: `mongodb+srv://guardianx_admin:<password>@cluster0.mongodb.net/guardianx?retryWrites=true&w=majority`.
4. Add string to host environment variables under `MONGODB_URI`.

---

## 8. Remaining Manual Deployment Tasks

1. Register production domain name (e.g. `api.guardianx.app`) and configure SSL/TLS certificate.
2. Provision MongoDB Atlas production cluster and configure database user access.
3. Configure cloud hosting environment variables on Render / Railway / AWS EC2.
4. Compile production release APK: `flutter build apk --release --dart-define=API_BASE_URL=https://api.guardianx.app/api`.
5. Conduct post-deployment sanity test using `GET https://api.guardianx.app/api/health`.

---

## 9. Known Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Cloud host sleeping on free tier (e.g. Render 50s cold start) | Upgrade to paid instance or configure lightweight uptime pinger |
| Database connection drops | Mongoose automatic retry logic handles reconnects |
| HTTP rate limit exceeded | `express-rate-limit` window reset every 15 minutes; adjust `max` parameter if needed |

---

## 10. Verification & Readiness Status Matrix

| Component | Status | Details |
|---|---|---|
| **Server Configuration Audit** | **PASS** | `app.js` security middlewares, health endpoints, error handlers verified |
| **Environment Template** | **PASS** | `server/.env.example` updated with placeholders (NO real secrets) |
| **MongoDB Atlas Support** | **PASS** | Mongoose SRV string support verified |
| **Security Audit** | **PASS** | Zero hardcoded secrets; `.env` ignored; RBAC & Tenant isolation verified |
| **Production Health Check** | **PASS** | `GET /health` and `GET /api/health` returning HTTP 200 |
| **Flutter HTTPS Support** | **PASS** | `-DAPI_BASE_URL` compile-time flag and `ApiConstants` verified |
| **Automated Tests** | **PASS** | `flutter analyze`, `flutter test`, `npm test` passing |

---

## 11. Final Phase 4 Readiness Evaluation

- **Staging Deployment Preparation**: **PASS** — GuardianX is fully prepared for manual deployment to cloud hosting (Render / Railway / AWS EC2) and MongoDB Atlas.
