# Phase 5 Staging Deployment & Configuration Report

**Project Name**: GUARDIANX  
**Title**: "GuardianX: A SaaS-Based Mobile Platform for Child Safety and Digital Wellbeing"  
**Phase**: Phase 5 — Staging Deployment & Cloud Readiness  
**Date**: September 8, 2026  

---

## 1. Deployment Architecture

The GuardianX staging deployment architecture establishes an isolated cloud environment for multi-tenant backend execution and physical two-device internet testing.

```
+------------------------------------+       +------------------------------------+
|          DEVICE A (Parent)         |       |           DEVICE B (Child)         |
|   Flutter App (ParentShell UI)     |       |    Flutter App (ChildShell UI)     |
|   Release APK / HTTPS Client       |       |    Release APK / HTTPS Client      |
+-----------------+------------------+       +-----------------+------------------+
                  |                                            |
                  |                HTTPS / WSS                 |
                  +---------------------+----------------------+
                                        |
                                        v
                       +---------------------------------+
                       |    Cloud Hosting (Render PaaS)  |
                       |    Node.js / Express Backend    |
                       |    HTTPS / TLS Terminated API   |
                       |    Port: 10000 / $PORT          |
                       +----------------+----------------+
                                        |
                                        | MONGODB_URI (TLS)
                                        v
                       +---------------------------------+
                       |      MongoDB Atlas Cluster      |
                       |      Multi-Tenant Database      |
                       +---------------------------------+
```

---

## 2. Backend Deployment Configuration (Render Blueprint)

The backend is configured for automated cloud deployment via [Render](https://render.com) using the root `render.yaml` blueprint specification.

### Infrastructure Blueprint (`render.yaml`):
- **Service Type**: `web`
- **Service Name**: `guardianx-backend`
- **Environment**: `node`
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`
- **Node.js Version Requirement**: Node.js v18.x, v20.x, or v22.x

---

## 3. MongoDB Atlas Configuration

For staging and production deployments, MongoDB Atlas (M0 Free Tier or Dedicated Cluster) is used.

### Requirements & Compatibility:
1. **Connection String Format**:
   `mongodb+srv://<db_username>:<db_password>@<cluster_domain>.mongodb.net/guardianx?retryWrites=true&w=majority`
2. **Database Name**: `guardianx`
3. **Network Access**: Configure IP Access List in Atlas to `0.0.0.0/0` (Allow Access from Anywhere) to permit cloud PaaS dynamic outbound IP access, backed by strong database user credentials.
4. **Database User**: Create a dedicated MongoDB user (e.g. `guardianx_staging_user`) with `readWriteAnyDatabase` or database-specific `readWrite` permissions on `guardianx`.
5. **Connection Options**: Mongoose ODM handles connection pooling, TLS handshake, and automatic reconnection.

---

## 4. Environment Variables Specification

Configure the following environment variables in the cloud hosting provider's dashboard (e.g. Render Dashboard -> Environment Variables):

| Environment Variable | Description | Recommended Staging Value |
|---|---|---|
| `PORT` | Listening Port | `10000` (auto-assigned by host via `$PORT`) |
| `NODE_ENV` | Runtime Execution Mode | `production` |
| `MONGODB_URI` | MongoDB Atlas SRV Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/guardianx?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for Access JWT signing | High-entropy 256-bit random string |
| `JWT_REFRESH_SECRET` | Secret key for Refresh JWT signing | High-entropy 256-bit random string |
| `JWT_EXPIRES_IN` | Access token lifespan | `1d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` |
| `CORS_ORIGIN` | Allowed HTTP origin headers | `*` (permits native mobile client requests) |

> [!IMPORTANT]
> Never commit real production secrets or credentials to source control. `.env` is listed in `.gitignore`.

---

## 5. HTTPS Requirements & TLS Enforcement

1. **API Transport Layer Security**: Android 9+ (API Level 28+) blocks non-secure cleartext HTTP traffic by default. All staging cloud deployments MUST terminate traffic behind standard HTTPS certificates (e.g. `https://guardianx-backend.onrender.com` or custom domain `https://api.guardianx.app`).
2. **TLS Verification**: Render automatically manages SSL/TLS certificates via Let's Encrypt.

---

## 6. Flutter API Configuration Audit

The Flutter application dynamically resolves its backend API target at compile time or runtime.

### Compile-Time Override:
```dart
const envUrl = String.fromEnvironment('API_BASE_URL');
```

### Static URL Codebase Audit Results:
Every occurrence of loopback/IP addresses in `mobile/` was inspected:
- `http://localhost:5050/api` ([`api_constants.dart`](file:///Users/Mirza/Desktop/My%20Work/GuardianX/GuardianX/mobile/lib/core/constants/api_constants.dart#L6)) -> **Development-Only Fallback** (Web/macOS local dev when `--dart-define` is omitted).
- `http://10.0.2.2:5050/api` ([`api_constants.dart`](file:///Users/Mirza/Desktop/My%20Work/GuardianX/GuardianX/mobile/lib/core/constants/api_constants.dart#L7)) -> **Development-Only Fallback** (Android Emulator loopback when `--dart-define` is omitted).
- XML Schema Namespace URLs (`http://schemas.android.com/apk/res/android`, `http://www.apple.com/DTDs/PropertyList-1.0.dtd`) -> **Documentation / XML Schema Standards**.

**Conclusion**: **ZERO** production-risk hardcoded URLs found in mobile application logic.

---

## 7. Release APK Build Procedure

Once the staging backend is deployed and its HTTPS domain is active, build the staging release APK:

```bash
cd mobile

# Clean previous build artifacts
flutter clean
flutter pub get

# Build Release APK pointing to staging HTTPS API
flutter build apk --release \
  --dart-define=API_BASE_URL=https://YOUR-STAGING-DOMAIN.onrender.com/api
```

The resulting APK will be located at:
`mobile/build/app/outputs/flutter-apk/app-release.apk`

---

## 8. Physical Two-Device Internet Testing Procedure

After building the staging APK with `--dart-define=API_BASE_URL=https://YOUR-STAGING-DOMAIN.onrender.com/api`:

### Test Environment Setup:
- **Device A**: Parent device (Android physical/emulator) on Wi-Fi or Mobile Data.
- **Device B**: Child device (Android physical/emulator) on separate Wi-Fi or Mobile Data network.

### Step-by-Step Test Sequence:
1. **Parent Account Creation & Shell Verification**:
   - Open app on Device A -> Register Parent (`parent.staging@guardianx.app`) -> Login -> Confirm `ParentShell` UI loads.
2. **Child Profile & Pairing Code Generation**:
   - On Device A -> Navigate to Children -> Tap "Add Child" (`Child Staging`) -> Tap "Generate Pairing Code" -> Note 6-digit code.
3. **Child Pairing Execution**:
   - Open app on Device B -> Select "Pair Child Device" -> Enter 6-digit pairing code -> Confirm pairing successful -> `ChildShell` UI loads.
4. **Real Location Sync & Tracking**:
   - Enable GPS location on Device B -> Confirm location updates send to server (`POST /location`) -> On Device A, open Location Map and verify real-time coordinate rendering.
5. **Emergency SOS Trigger & Alert Delivery**:
   - On Device B -> Press and hold "SOS Emergency Button" -> Confirm local notification and server dispatch (`POST /sos`) -> On Device A, verify instant alert modal appears with timestamp and coordinates.
6. **Server-Side Geofence Evaluation**:
   - On Device A -> Create Safe Zone geofence -> Send child coordinates outside boundary -> Verify server triggers geofence breach alert on Device A dashboard.

---

## 9. Security Checklist

- [x] **No Secrets Committed**: Repository scanned; zero credentials committed.
- [x] **Git Exclusions**: `.env` and local build outputs excluded via `.gitignore`.
- [x] **Render Blueprint**: `render.yaml` created using secure environment variable declarations.
- [x] **Role-Based Access Control (RBAC)**: Verified via automated test `#13` (`roleMiddleware`).
- [x] **Multi-Tenant Data Segregation**: Verified via automated test `#8` & `#14` (`tenantId` scoping).
- [x] **Single-Use Pairing Expiration**: 6-character single-use code enforced with 15-min TTL.
- [x] **Health Check Endpoints**: `GET /health` and `GET /api/health` returning HTTP 200.

---

## 10. Rollback Considerations

If issues occur during staging deployment:
1. **Render Deployment Rollback**: In Render Dashboard -> Events -> Click "Rollback to this build" to revert to the previous working commit instantly.
2. **Database Migration Safety**: Schema additions are backward compatible. No breaking database migrations were introduced.
3. **Mobile Client Fallback**: Mobile clients can be rebuilt with updated `--dart-define=API_BASE_URL` or overridden at runtime via `ApiConstants.customHostOverride`.

---

## 11. Known Limitations & Technical Scope

1. **Server-Side Geofence Evaluation**: Geofence breach evaluation is executed on the backend server upon receiving location updates from the mobile app. Native hardware-level OS geofencing (`GeofencingClient` / `CLRegion`) is reserved for future native platform development.
2. **Free Cloud Host Sleep Cycles**: Render free tier web services spin down after 15 minutes of inactivity. First request after sleep may take ~50 seconds to initialize.

---

## 12. Manual Steps Required for Cloud Staging Deployment

The repository is 100% prepared. Execute the following manual steps to complete cloud staging deployment:

1. **MongoDB Atlas Setup**:
   - Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Create a database cluster and database user (e.g. `guardianx_user`).
   - Add Network Access IP `0.0.0.0/0`.
   - Copy connection string: `mongodb+srv://guardianx_user:<password>@cluster.mongodb.net/guardianx?retryWrites=true&w=majority`.
2. **Render Cloud Deployment**:
   - Log into [Render](https://render.com).
   - Click **New +** -> **Blueprint**.
   - Connect the GuardianX Git repository. Render will automatically detect `render.yaml`.
   - When prompted for `MONGODB_URI`, paste your MongoDB Atlas connection string.
   - Click **Apply**. Render will install dependencies and start the backend service.
3. **Verify Deployment Health**:
   - Access `https://<YOUR-RENDER-APP-NAME>.onrender.com/api/health` in your browser.
   - Confirm output: `{"status":"online","service":"GuardianX API",...}`.
4. **Compile Release APK**:
   - Run command:
     ```bash
     cd mobile
     flutter build apk --release --dart-define=API_BASE_URL=https://<YOUR-RENDER-APP-NAME>.onrender.com/api
     ```
5. **Install and Conduct Two-Device Testing**:
   - Install `app-release.apk` on Parent (Device A) and Child (Device B) and run test sequence.

---

## 13. Phase 5 Verification Status Matrix

| Component | Status | Details |
|---|---|---|
| **Repository Preparation** | **PASS** | `render.yaml` created; codebase cleaned and formatted |
| **Deployment Configuration** | **PASS** | Render blueprint, Node.js scripts, and health checks verified |
| **Flutter Configuration** | **PASS** | Dynamic `--dart-define=API_BASE_URL` verified; 0 production-risk hardcoded URLs |
| **Security Audit** | **PASS** | Zero hardcoded secrets; `.gitignore` enforced; RBAC & Tenant isolation verified |
| **Automated Tests** | **PASS** | `flutter analyze` (0 issues), `flutter test` (PASS), `npm test` (21/21 PASS) |
| **Actual Cloud Deployment** | **NOT YET PERFORMED** | Awaiting user execution on Render/MongoDB Atlas |
| **Physical Two-Device Validation** | **NOT YET PERFORMED** | Awaiting cloud backend URL to compile release APK and test |

---

## 14. Final Phase 5 Readiness Evaluation

- **Staging Deployment Preparation**: **PASS** — GuardianX is fully verified, automated tests are 100% passing, and the repository is completely prepared for manual cloud deployment to Render and MongoDB Atlas.
