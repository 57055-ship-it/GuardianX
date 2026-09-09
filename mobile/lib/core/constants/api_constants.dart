import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  static String get defaultHost {
    return 'https://guardianx-bd1f.onrender.com/api';
  }

  static String customHostOverride = '';

  static String get baseUrl {
    const envUrl = String.fromEnvironment('API_BASE_URL');
    if (envUrl.isNotEmpty) return envUrl;
    if (customHostOverride.isNotEmpty) {
      return customHostOverride;
    }
    return defaultHost;
  }

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refresh = '/auth/refresh';
  static const String me = '/auth/me';

  // Family & Children
  static const String familyMe = '/families/me';
  static const String updatePlan = '/families/plan';
  static const String children = '/children';

  // Pairing
  static const String createPairing = '/pairing/create';
  static const String joinPairing = '/pairing/join';

  // Device & Location & Geofence
  static const String heartbeat = '/devices/heartbeat';
  static const String location = '/location';
  static const String geofences = '/geofences';

  // Usage & Screen Time
  static const String recordUsage = '/usage/record';
  static const String appUsage = '/usage/app-usage';
  static const String screenTime = '/usage/screen-time';

  // SOS & Alerts
  static const String sos = '/sos';
  static const String alerts = '/alerts';

  // Routines & Reports
  static const String routines = '/routines';
  static const String completeRoutine = '/routines/complete';
  static const String hadithToday = '/routines/hadith/today';
  static const String dailyReport = '/reports/daily';
  static const String weeklyReport = '/reports/weekly';
  static const String insights = '/analytics/insights';
}
