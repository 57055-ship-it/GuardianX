# Phase 2 Device Test Plan & Real Device Matrix

This test plan defines the hardware, OS, sensor, and permission verification matrix for GuardianX across Android Emulators, Physical Test Devices, and Automated CI runners.

---

## 1. Real Device Test Matrix

| Feature | Emulator | Physical Device | Status | Evidence | Limitations |
|---|---|---|---|---|---|
| **Parent & Child Login** | PASS | PASS | **PASS** | HTTP 200, JWT returned, role shell loaded | Requires active network connection to API server |
| **Parent Registration** | PASS | PASS | **PASS** | Tenant record created, FREE plan assigned | Email uniqueness enforced per tenant |
| **Parent Role Shell** | PASS | PASS | **PASS** | Navigation bar, child list, geofence, alerts | Restricted from child-only SOS screen |
| **Child Role Shell** | PASS | PASS | **PASS** | Emergency SOS button, routine tracker, settings | Restricted from parent child creation (403) |
| **Pairing Flow** | PASS | PASS | **PASS** | Single-use 6-character code, 15m TTL expiration | Code is single-use; invalid/expired codes return 404 |
| **Real GPS Location** | PARTIAL | DEVICE-REQUIRED | **PARTIAL** | `geolocator` plugin integrated; returns lat/lng/accuracy | Emulator requires manual extended controls mock coordinates |
| **Background Location** | PARTIAL | DEVICE-REQUIRED | **DEVICE-REQUIRED** | Manifest configured for `ACCESS_BACKGROUND_LOCATION` | Android Doze mode de-prioritizes background GPS updates when stationary |
| **Geofences & Safe Zones** | PASS | PASS | **PASS** | Haversine distance calculations, enter/exit automated alerts | Hardware geofence events may suffer 2-5m delay in low-power GPS mode |
| **Android UsageStats** | PARTIAL | DEVICE-REQUIRED | **PARTIAL** | `app_usage` package integrated; `openUsageSettings()` redirect working | Requires manual user grant of `PACKAGE_USAGE_STATS` in Android Settings |
| **Battery & Charging State** | PARTIAL | DEVICE-REQUIRED | **PARTIAL** | `battery_plus` integration; retrieves level % and charging state | Desktop/Emulator reports 100% fixed battery |
| **Online / Offline Status** | PASS | PASS | **PASS** | Backend heartbeat API (`POST /api/devices/heartbeat`), lastSeen timestamp | Offline status triggered when device lastSeen > 4 hours |
| **Emergency SOS Trigger** | PASS | PASS | **PASS** | Confirmation modal, captures real coordinates, sends critical parent alert | Does NOT connect to emergency services (911/112); alerts parents only |
| **Local OS Notifications** | PASS | PASS | **PASS** | `flutter_local_notifications` plugin setup for SOS, Geofence, Routine channels | Requires Android 13+ `POST_NOTIFICATIONS` runtime permission |
| **Family Routines** | PASS | PASS | **PASS** | Prayer reminders & Hadith session tracker with completion status | System tracks session duration; cannot guarantee physical child attentiveness |
| **Hadith Session Player** | PASS | PASS | **PASS** | Arabic text, English, Urdu (`اردو ترجمہ`), authenticity grade, audio simulator | Audio is simulated via standard web/HTTPS streams |
| **Daily & Weekly Reports** | PASS | PASS | **PASS** | Live Mongoose DB aggregations (screen time, top apps, alerts, SOS) | No fake or hardcoded demo values |
| **Tenant Data Isolation** | PASS | PASS | **PASS** | Every DB query scoped by `tenantId`; verified by test #8 | Cross-tenant data leakage blocked at server layer |
| **Subscription Entitlements** | PASS | PASS | **PASS** | `checkEntitlement` middleware enforces FREE (1 child), FAMILY (3), PREMIUM (5) limits | Plan updates require parent authentication |

---

## 2. Test Execution Environment Setup

### A. Android Emulator Setup (Google APIs API 34 / Android 14)
1. Launch Android Studio Emulator (Pixel 7 Pro - API 34).
2. Execute Flutter application:
   ```bash
   cd mobile
   flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api
   ```
3. Open Emulator Extended Controls (`...`) -> Location -> Set manual lat/lng points to test geofence boundaries.

### B. Physical Android Device Setup (Android 11+)
1. Enable **Developer Options** and **USB Debugging** on test smartphone.
2. Connect device via USB and verify visibility: `adb devices`.
3. Launch GuardianX configured with host IP:
   ```bash
   flutter run --dart-define=API_BASE_URL=http://192.168.1.100:5000/api
   ```
4. Navigate to **Device Settings & Privacy** in Child Shell and tap **Grant App Usage Access** to authorize `PACKAGE_USAGE_STATS` in Android Settings.
