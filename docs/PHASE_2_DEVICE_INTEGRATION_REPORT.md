# Phase 2 Device Integration & Android Hardening Report

**Project Name**: GUARDIANX  
**Title**: "GuardianX: A SaaS-Based Mobile Platform for Child Safety and Digital Wellbeing"  
**Phase**: Phase 2 — Real Android Device Integration  
**Date**: September 7, 2026  

---

## 1. Executive Summary

Phase 2 successfully transitions GuardianX from a verified monorepo architecture into a real native Android-integrated application. Native Flutter plugins (`geolocator`, `app_usage`, `battery_plus`, `device_info_plus`, `flutter_local_notifications`, `permission_handler`) have been added, and explicit Android permissions have been declared in `AndroidManifest.xml`. All service layers now query real OS sensors and platform managers, while preserving non-spyware ethical boundaries and transparent user disclosures.

---

## 2. Feature Implementation Status Matrix

| Major Feature | Implementation Status | Integration Mechanism |
|---|---|---|
| **Parent & Child Auth & RBAC** | `IMPLEMENTED` | JWT tokens, bcryptjs, role-based navigation (`ParentShell` vs `ChildShell`) |
| **Multi-Tenant Isolation** | `IMPLEMENTED` | Mongoose backend query scoping via `req.tenantId` |
| **Device Pairing Engine** | `IMPLEMENTED` | Single-use 6-character code with 15m TTL expiration |
| **Real GPS Location** | `PARTIAL` | `geolocator` plugin integrated; REST API submission working; sensor requires hardware GPS |
| **Background Location** | `DEVICE-REQUIRED` | Manifest `ACCESS_BACKGROUND_LOCATION`; Android Doze mode de-prioritizes when stationary |
| **Real Geofencing** | `IMPLEMENTED` | Server-side Haversine distance engine; automated enter/exit alert triggers |
| **Android UsageStats** | `PARTIAL` | `app_usage` plugin integrated; `openUsageSettings()` UI shortcut for `PACKAGE_USAGE_STATS` |
| **Battery & Charging Status** | `PARTIAL` | `battery_plus` plugin integrated; retrieves live battery % and charging state |
| **Online / Offline Device Status** | `IMPLEMENTED` | Heartbeat API (`POST /api/devices/heartbeat`); 4-hour offline threshold |
| **Emergency SOS Flow** | `IMPLEMENTED` | Confirmation dialog, real coordinate capture, `SOSEvent` record, critical parent alert |
| **Local OS Notifications** | `IMPLEMENTED` | `flutter_local_notifications` plugin setup for SOS, Geofence, and Routine channels |
| **Family Routines & Prayer Reminders** | `IMPLEMENTED` | Configurable prayer times (Fajr-Isha) & session completion tracking |
| **Hadith Session Player** | `IMPLEMENTED` | Arabic text, English, Urdu (`اردو ترجمہ`), authenticity grade, audio simulator |
| **Daily & Weekly Safety Reports** | `IMPLEMENTED` | Real Mongoose DB metrics; daily screen time, top apps, location events, SOS frequency |
| **Explainable Safety Score** | `IMPLEMENTED` | Rule-based 0–100 score with transparent rationale (no black-box magic numbers) |
| **Subscription Entitlements** | `IMPLEMENTED` | Server-side `checkEntitlement` middleware (`FREE`, `FAMILY`, `PREMIUM`) |

---

## 3. What Was Already Implemented (Phase 1 Foundation)

- ONE Flutter application serving dual role-based shells (`ParentShell` and `ChildShell`).
- Express.js backend with 13 Mongoose schemas, JWT authentication, and rate limiting.
- Multi-tenant data isolation (`tenantId`) enforced at backend controller layer.
- Single-use device pairing code engine.
- Haversine distance geofence evaluation logic.
- Hadith content provider with Arabic, English, and Urdu translations.
- Full 20/20 backend integration test suite in Jest/Supertest.

---

## 4. What Was Newly Implemented in Phase 2

1. **Native Dependency Integration**: Added `geolocator`, `permission_handler`, `app_usage`, `battery_plus`, `device_info_plus`, and `flutter_local_notifications` to `mobile/pubspec.yaml`.
2. **Android Manifest Permissions Audit**: Declared `INTERNET`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`, `PACKAGE_USAGE_STATS`, `POST_NOTIFICATIONS`, `FOREGROUND_SERVICE` in `AndroidManifest.xml` with detailed comments.
3. **Real Location Service (`location_service.dart`)**: Integrated `Geolocator` to query hardware GPS sensor, handle permission states (`granted`, `denied`, `permanentlyDenied`, `gpsDisabled`), and transmit real coordinates to backend.
4. **Real Usage Stats Integration (`usage_stats_service.dart`)**: Integrated `app_usage` package to query Android `UsageStatsManager` for today's application usage durations, and added `openUsageSettings()` helper to redirect users to Android System Settings.
5. **Real Device Status & Heartbeat (`device_service.dart`)**: Integrated `battery_plus` and `device_info_plus` to retrieve real battery level %, charging status, device manufacturer/model, and send automated heartbeats to `POST /api/devices/heartbeat`.
6. **Real OS Notifications (`notification_service.dart`)**: Created native notification service using `flutter_local_notifications` with custom channels for critical SOS alerts, geofence enter/exit events, and routine reminders.
7. **Permission Guidance UI**: Added "Android Permissions & Access Shortcuts" card in `ChildSettingsScreen` with direct shortcut to grant `PACKAGE_USAGE_STATS` in Android Settings.

---

## 5. Real Android Integrations vs Mock/Simulated Functionality

### Real Android Integrations
- GPS position retrieval via Android Location Services (`Geolocator`).
- App usage metadata collection via Android `UsageStatsManager` (`app_usage`).
- Hardware battery level % and AC/USB charging detection (`battery_plus`).
- Device hardware model, manufacturer, and Android SDK version (`device_info_plus`).
- Local system notifications (`flutter_local_notifications`).

### Mock / Simulated Functionality Remaining
- **Audio Recitation Simulator**: Hadith session audio player simulates audio playback via HTTPS streams.
- **Emergency Service Dispatch**: SOS alerts notify parents and family members; system does NOT dial 911/112 emergency services.

---

## 6. Device-Required Tests

The following tests require execution on a physical Android test device or an Android Studio Emulator with Google Play Services:
1. **Physical GPS Sensor Acquisition**: Validating coordinate accuracy when moving between indoor and outdoor environments.
2. **Android `PACKAGE_USAGE_STATS` System Permission Grant**: Testing user tap on "Grant App Usage Access" button, navigating to System Settings, toggling switch for GuardianX, and verifying app usage data population.
3. **Android Doze Mode Background Tracking**: Verifying location update frequency when phone is stationary in deep sleep for 30+ minutes.

---

## 7. Permission Requirements & Justifications

| Permission | Android API Level | Justification & User Impact |
|---|---|---|
| `INTERNET` | All | Communication with GuardianX backend API server |
| `ACCESS_FINE_LOCATION` | API 1+ | Precise GPS location for child safety and SOS coordinates |
| `ACCESS_COARSE_LOCATION` | API 1+ | Approximate location when precise GPS is disabled |
| `ACCESS_BACKGROUND_LOCATION` | API 29+ | Background geofence monitoring and emergency SOS updates when app is minimized |
| `PACKAGE_USAGE_STATS` | API 21+ | High-level screen time metadata (package name, usage duration in minutes) |
| `POST_NOTIFICATIONS` | API 33+ | Displaying critical SOS alerts, geofence enter/exit events, and routine reminders |
| `FOREGROUND_SERVICE` | API 28+ | Transparent status bar notification informing child of active safety protection |

---

## 8. Android OS Limitations & Technical Boundaries

1. **UsageStats OS Consent**: `PACKAGE_USAGE_STATS` is a protected system permission that cannot be granted programmatically. The child/parent must manually authorize GuardianX in Android System Settings.
2. **Doze Mode & Battery Deferral**: Android OS battery optimization may defer background location requests by 5–15 minutes when the device is unplugged and stationary.
3. **Geofence Hardware Latency**: In low-power GPS mode, cell tower and Wi-Fi scanning geofence triggers may take 2–5 minutes to register boundary crossing.
4. **App Blocking Boundaries**: Standard Android security prevents third-party apps from force-killing or uninstalling other apps without Android Enterprise Device Policy Manager (DPM) enrollment. GuardianX enforces screen-time awareness via parent alerts rather than illegal force-closing.

---

## 9. Security & Privacy Verification

- **Zero-Spyware Compliance**: Verified that no keyloggers, password harvesters, SMS interceptors, or covert audio/video recorders are present in mobile or backend source code.
- **Transparent Disclosure**: Child dashboard displays prominent status cards detailing active protection and data collection boundaries.
- **Git Hygiene**: Verified `.env` is ignored, and zero hardcoded secrets or database credentials exist in source files.

---

## 10. Test Results

- **`flutter analyze`**: PASS (0 errors, 0 compilation warnings).
- **`flutter test`**: PASS (100% unit and widget tests passed).
- **`npm test`**: PASS (20/20 backend integration test cases passed).

---

## 11. Known Issues

1. Desktop/Web builds report fallback location coordinates (Lahore city center) when running outside an Android/iOS runtime environment.
2. Android 13+ devices require explicit user acceptance of the runtime notification permission dialog on initial SOS or geofence trigger.

---

## 12. Recommended Next Phase

**Phase 3 — Staging Deployment & Multi-Device Testing**:
1. Build signed Android APK / App Bundle for staging distribution.
2. Deploy backend API to a production/staging cloud provider (e.g. Render, Railway, or AWS EC2) with MongoDB Atlas database.
3. Perform live field testing across multiple physical Android smartphones under real cellular network conditions.
