# GuardianX: A SaaS-Based Mobile Platform for Child Safety and Digital Wellbeing

GuardianX is a production-quality, multi-tenant SaaS mobile platform designed to empower parents with child safety oversight, digital wellbeing metrics, emergency SOS distress response, and family spiritual routines (Prayer reminders & Hadith sessions).

Developed as a Final Year Project (FYP) for BS Computer Science and an Innovative & Entrepreneurial Product MVP.

---

## 🌟 Key Architectural Features

- **ONE Mobile Application**: Single Flutter mobile application catering to both **Parent** and **Child** roles dynamically through role-based authentication and navigation (`ParentShell` vs `ChildShell`).
- **Multi-Tenant SaaS Architecture**: Independent family tenants (`tenantId`). Cross-tenant data leakage is strictly blocked at the backend service & query layer.
- **Material 3 Design System**: Premium, responsive UI supporting dynamic light/dark mode switching.
- **Privacy & Ethical Safeguards**: Standard OS UsageStats and location permissions. Zero spyware (no keylogging, no password capture, no private message reading, no covert audio/video recording).
- **Secure Device Pairing**: Temporary 6-character pairing codes with 15-minute expiration time for linking child devices.
- **Emergency SOS Engine**: One-tap distress signal with real-time location capture and instant critical alerts to parents.
- **Family Routines & Hadith Content**: Prayer reminders and interactive Hadith sessions with Arabic text, English translation, Urdu translation (`اردو ترجمہ`), and completion tracking.
- **Explainable Safety Insights**: Rule-based safety score (0–100) providing clear rationale for all safety alerts and anomalies.
- **Subscription-Ready SaaS Entitlements**: Configurable plans (`FREE`, `FAMILY`, `PREMIUM`) with server-side feature enforcement.

---

## 🛠️ Technology Stack

- **Mobile**: Flutter (Dart 3.x), Material 3, Provider, Clean Architecture (`core`, `models`, `providers`, `repositories`, `features`).
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Helmet, CORS, Express Rate Limit, Express Validator.
- **Database**: MongoDB, Mongoose ODM.
- **Testing**: Jest & Supertest (Backend API integration tests), Flutter Test framework.

---

## 📁 Repository Structure

```
guardianx/
│
├── mobile/                 # ONE Flutter Mobile Application
│   ├── lib/
│   │   ├── core/           # Constants, Theme, ApiClient, StorageService, Services
│   │   ├── models/         # User, ChildProfile, Device, Location, Alert, Geofence, Routine, Hadith, etc.
│   │   ├── providers/      # Auth, Child, Pairing, Location, Geofence, Usage, Alert, SOS, Routine, Report
│   │   ├── repositories/   # Auth, Child, Pairing, Location, Geofence, Usage, Alert, SOS, Routine, Report
│   │   ├── features/
│   │   │   ├── auth/       # Splash, Login, Register screens
│   │   │   ├── parent/     # ParentShell, Dashboard, Children, Location, Geofences, ScreenTime, Alerts, Reports, Routines, Settings
│   │   │   ├── child/      # ChildShell, Dashboard, Activity, Routines, Hadith Modal, SOS, Settings
│   │   │   ├── pairing/    # Child pairing screen
│   │   │   └── shared/     # Custom textfields, buttons, status badges, empty states
│   │   └── main.dart
│   └── pubspec.yaml
│
├── server/                 # Node.js Express Multi-Tenant Backend API
│   ├── src/
│   │   ├── config/         # MongoDB db.js connection
│   │   ├── controllers/    # Auth, Family, Child, Pairing, Device, Location, Geofence, Usage, Alert, SOS, Routine, Report, Analytics
│   │   ├── middleware/     # Auth, Role, Tenant Isolation, Entitlements
│   │   ├── models/         # 13 Mongoose schemas
│   │   ├── routes/         # Modular REST routes
│   │   ├── services/       # Hadith service
│   │   ├── utils/          # Geo Haversine distance calculator
│   │   └── app.js
│   ├── tests/              # Jest/Supertest API integration test suite
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── docs/                   # Detailed Project Documentation
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE_SCHEMA.md
│   ├── ANDROID_LIMITATIONS.md
│   ├── SECURITY.md
│   └── DEVELOPMENT_PLAN.md
│
└── README.md
```

---

## 🚀 Getting Started & Environment Setup

### 1. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Setup Environment File
cp .env.example .env

# Start Backend Server (Default Port: 5000)
npm run dev
```

#### Environment Variables (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/guardianx
JWT_SECRET=guardianx_super_secret_jwt_access_key_2026
JWT_REFRESH_SECRET=guardianx_super_secret_jwt_refresh_key_2026
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
```

### 2. Mobile App Setup

```bash
cd mobile

# Get Flutter dependencies
flutter pub get

# Run Flutter App
flutter run
```

---

## 🧪 Testing & Verification

### Run Backend Integration Tests
```bash
cd server
npm test
```
*Executes full API integration suite testing Parent registration, login, child creation, temporary pairing code validation, child pairing, location recording, SOS triggers, alert generation, multi-tenant security isolation, and subscription plan upgrades.*

### Run Flutter Analysis & Tests
```bash
cd mobile
flutter analyze
flutter test
```

---

## 🔒 Security & Privacy Notice
GuardianX operates strictly within official Android permissions. It does NOT implement keylogging, password capture, secret message interception, or covert audio/video recording. All location and activity metrics are collected transparently for legitimate child safety and digital wellbeing purposes.
