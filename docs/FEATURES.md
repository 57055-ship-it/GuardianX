# GuardianX - Feature Architecture & Sprint Milestones

## 🎯 Sprint 1: First Presentation & Core MVP Deliverables (Active Focus)
The initial evaluation strictly demonstrates the foundational safety and pairing mechanisms to establish authentic, incremental product development:

### 1. Authentication & Family Multi-Tenancy
- **Parent & Child Authentication**: Clean email/password registration and login with secure JWT token management.
- **Family Multi-Tenancy**: Data segregated strictly by `tenantId` to ensure total isolation between families.
- **ONE Unified Mobile App**: Single Flutter app dynamically rendering `ParentShell` or `ChildShell`.

### 2. Secure 6-Character Device Pairing
- **Parent Workflow**: Generates a temporary 6-digit alphanumeric pairing code with 15-minute expiry.
- **Child Linking**: Child enters code on their smartphone; the device is permanently linked and registered with device telemetry.
- **Live Device Status**: Real-time battery percentage indicator and online/offline presence tracking.

### 3. Physical Safety & Real-Time Location
- **GPS Coordinates**: Accurate GPS location reporting via standard Android/iOS location services.
- **Parent Map View**: Real-time address view and direct integration with Google Maps.

### 4. Emergency SOS Distress Engine
- **One-Tap SOS Button**: Prominent SOS button in the child application.
- **Distress Dispatch**: Immediate transmission of emergency coordinates, triggering an instant high-priority alert on the parent's dashboard.

### 5. Digital Wellbeing & Screen Time
- **UsageStats Integration**: Privacy-preserving app usage metadata collection (app package, label, and duration).
- **100% Non-Spyware**: Zero keylogging, zero message interception, zero covert mic/camera recordings.
- **Daily Usage Breakdown**: Clean dashboard card showing today's screen time and app usage breakdown.

---

## 🚀 Subsequent Sprints (Post-Proposal Roadmap)

### Sprint 2: Safe Zones & Family Routines (Mid-Term Milestone)
- **Safe Zone Geofencing**: Configurable circular boundaries (Home, School, Tuition) with automatic boundary enter/exit notifications.
- **Family Routines & Islamic Content**: Prayer reminders and interactive Hadith reader with Arabic, English, and Urdu translations.

### Sprint 3: Monetization & Administration (Final Defense Milestone)
- **Super Admin Control Plane**: Tenant monitoring, system audit logs, and platform health telemetry.
- **SaaS Subscription Billing Tiers**: Automated tier enforcement (`FREE`, `FAMILY`, `PREMIUM`).
- **Advanced Trend Reports**: Multi-week screen time trends and explainable safety insights.
