import 'dart:io' show Platform;
import 'package:app_usage/app_usage.dart';
import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';

class AppUsageData {
  final String packageName;
  final String appName;
  final int usageDurationMinutes;
  final int sessionCount;

  AppUsageData({
    required this.packageName,
    required this.appName,
    required this.usageDurationMinutes,
    required this.sessionCount,
  });

  Map<String, dynamic> toJson() => {
        'packageName': packageName,
        'appName': appName,
        'usageDuration': usageDurationMinutes,
        'sessionCount': sessionCount,
      };
}

class UsageStatsService {
  /// Platform capability check for Android UsageStatsManager
  static bool get isPlatformSupported => !kIsWeb && Platform.isAndroid;

  /// Open Android System Settings to grant PACKAGE_USAGE_STATS permission
  Future<bool> openUsageSettings() async {
    if (!isPlatformSupported) return false;
    try {
      return await openAppSettings();
    } catch (e) {
      debugPrint('[UsageStatsService] Failed to open system settings: $e');
      return false;
    }
  }

  /// Check if Android UsageStats permission is granted
  Future<bool> hasUsagePermission() async {
    if (!isPlatformSupported) {
      return false;
    }
    try {
      final now = DateTime.now();
      final startDate = now.subtract(const Duration(minutes: 5));
      final usage = await AppUsage().getAppUsage(startDate, now);
      return usage.isNotEmpty;
    } catch (e) {
      debugPrint('[UsageStatsService] Permission check error: $e');
      return false;
    }
  }

  /// Query real Android UsageStatsManager data for today's application usage
  Future<List<AppUsageData>> getTodayUsageStats() async {
    if (isPlatformSupported) {
      try {
        final now = DateTime.now();
        final startDate = DateTime(now.year, now.month, now.day);
        final List<AppUsageInfo> infos = await AppUsage().getAppUsage(startDate, now);

        final List<AppUsageData> realList = infos
            .where((info) => info.usage.inMinutes > 0)
            .map((info) => AppUsageData(
                  packageName: info.packageName,
                  appName: info.appName.isNotEmpty ? info.appName : info.packageName,
                  usageDurationMinutes: info.usage.inMinutes,
                  sessionCount: 1,
                ))
            .toList();

        if (realList.isNotEmpty) {
          realList.sort((a, b) => b.usageDurationMinutes.compareTo(a.usageDurationMinutes));
          return realList;
        }
      } catch (e) {
        debugPrint('[UsageStatsService] Native AppUsage fetch error: $e');
      }
    }

    // On iOS or when no usage is logged, return empty list (no fake data)
    return [];
  }
}
