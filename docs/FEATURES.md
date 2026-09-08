# GuardianX - Implemented Features Specification

## 1. Authentication & Multi-Tenancy
- **Role-Based Authentication**: Supports `parent`, `child`, and `admin` roles.
- **Tenant Isolation**: Every family is an independent SaaS tenant (`tenantId`). Multi-tenant data segregation is enforced at the backend service & database layer.
- **Single Flutter App Architecture**: ONE mobile codebase serving custom role-tailored shells (`ParentShell` vs `ChildShell`).

## 2. Secure Device Pairing
- **Temporary Pairing Codes**: Parent generates a 6-character single-use pairing code with a 15-minute expiration time.
- **Child Linking**: Child enters pairing code on their device. The backend validates expiration, tenant ownership, and links the child's device ID.

## 3. Child Management & Device Monitoring
- **Child Profiles**: Parent can create, view, update, and remove child profiles under their tenant limit.
- **Device Status & Heartbeat**: Live battery level indicator, online/offline status, platform details, and last seen timestamp.

## 4. Location Tracking & Safe Zones (Geofencing)
- **Transparent Location Updates**: GPS position reporting complying with Android permission rules.
- **Geofences**: Parent can define safe zone boundaries (Home, School, Tuition) with configurable radii (e.g. 200m).
- **Enter/Exit Alerts**: Triggers automated alerts when a child crosses safe zone boundaries.

## 5. Screen Time & Digital Wellbeing (Android MVP)
- **UsageStats Integration**: Privacy-preserving app usage metadata collection (app package name, app label, duration in minutes).
- **Zero Spyware Compliance**: No keylogging, no password capture, no private message reading, no covert audio/video recording.
- **Usage Summaries**: Today's total screen time and app usage breakdowns for parents and children.

## 6. Emergency SOS Distress Engine
- **One-Tap Emergency Trigger**: Child presses a prominent SOS button on their dashboard.
- **Instant Location Capture & Parent Alert**: Transmits distress coordinates and generates a critical alert on the parent's dashboard.

## 7. Family Routine, Prayer Reminders & Hadith Sessions
- **Prayer Reminders**: Configurable times for Fajr, Dhuhr, Asr, Maghrib, and Isha.
- **Hadith Sessions**: Interactive Hadith player with Arabic text, English translation, Urdu translation (`اردو ترجمہ`), authenticity grade, and audio recitation simulator.
- **Completion Check-In**: Child logs session completion, notifying the parent.

## 8. Reports & Explainable Safety Insights
- **Daily & Weekly Reports**: Screen time averages, top used apps, location events, SOS frequency.
- **Explainable Safety Insights**: Rule-based safety score (0–100) with clear rationale (e.g. *"Today's screen time is 5h 20m, 65% above weekly average"*).

## 9. Subscription-Ready SaaS Entitlements
- **SaaS Tiers**:
  - `FREE`: Up to 1 child.
  - `FAMILY`: Up to 3 children + location history + advanced reports.
  - `PREMIUM`: Up to 5 children + safety insights + advanced analytics.
- **Backend Enforcement**: Server middleware validates entitlements before returning restricted data.
