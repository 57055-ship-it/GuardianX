# Android Platform Limitations & Permission Architecture

## 1. Ethical Boundaries & Non-Spyware Guarantee
GuardianX strictly operates within official Android permission models.
- **NO Keylogging**: Keystroke logging is not supported or implemented.
- **NO Password Capture**: Security credentials are never read or stored.
- **NO Private Message Capture**: SMS and chat application contents are never inspected.
- **NO Covert Audio/Screen Recording**: Background camera, microphone, or screen recording APIs are strictly prohibited.

## 2. Android UsageStats Limitations
- Android requires explicit user granting of `PACKAGE_USAGE_STATS` permission via System Settings.
- UsageStats provides **metadata only**: Package Name, App Label, Usage Duration, and Launch Frequency.
- It does **NOT** provide granular internal app activity (e.g. Chrome search terms, specific YouTube video titles, or private messages).

## 3. Background Location & Geofencing Delays
- **Android 10+ (API 29+) Background Location**: Requires explicit user consent (`ACCESS_BACKGROUND_LOCATION`).
- **Doze Mode & Battery Optimization**: OS battery optimizations may defer background location reporting by 5–15 minutes when the device is stationary.
- **Geofence Transition Delays**: Hardware geofence triggers rely on cell tower and Wi-Fi scanning; boundary exit events may take up to 2–5 minutes to register when GPS is in low-power mode.

## 4. Universal App Blocking Technical Limitations
- Arbitrary app blocking on standard non-rooted Android devices requires Android Enterprise / Device Policy Manager (DPM) provisioning. Standard third-party apps cannot force-kill or uninstall other apps without DPM enrollment.
- GuardianX displays daily screen-time limits and sends alerts to parents when thresholds are breached, rather than promising non-supported force-closing.

## 5. Google Play Parental Monitoring Policies
GuardianX is designed for Google Play compliance:
- Monitoring behavior is fully disclosed to the user (child dashboard displays active protection badge).
- Persistent status bar notification is recommended for background tracking compliance.
- Transparent privacy disclosures are available in app settings.
