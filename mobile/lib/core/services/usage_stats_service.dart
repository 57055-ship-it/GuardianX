import 'dart:io' show Platform;
import 'package:app_usage/app_usage.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import '../utils/app_name_resolver.dart';

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
  static const MethodChannel _channel = MethodChannel('com.guardianx/usage_stats');
  static final Map<String, String> _appNameCache = {};
  static final Map<String, Uint8List?> _appIconCache = {};

  /// Platform capability check for Android UsageStatsManager
  static bool get isPlatformSupported => !kIsWeb && Platform.isAndroid;

  /// Open Android System Settings to grant PACKAGE_USAGE_STATS permission
  Future<bool> openUsageSettings() async {
    if (!isPlatformSupported) return false;
    try {
      final bool? success = await _channel.invokeMethod<bool>('openUsageSettings');
      if (success == true) return true;
    } catch (e) {
      debugPrint('[UsageStatsService] Native openUsageSettings channel error: $e');
    }
    // Fallback to permission_handler
    try {
      return await openAppSettings();
    } catch (e) {
      debugPrint('[UsageStatsService] openAppSettings fallback error: $e');
      return false;
    }
  }

  /// Check if Android UsageStats permission is granted via native AppOps
  Future<bool> hasUsagePermission() async {
    if (!isPlatformSupported) {
      return false;
    }
    try {
      final bool? granted = await _channel.invokeMethod<bool>('hasUsagePermission');
      if (granted != null) return granted;
    } catch (e) {
      debugPrint('[UsageStatsService] Native hasUsagePermission channel error: $e');
    }

    // Fallback: If AppUsage().getAppUsage() doesn't throw, permission is granted
    try {
      final now = DateTime.now();
      final startDate = DateTime(now.year, now.month, now.day);
      await AppUsage().getAppUsage(startDate, now);
      return true;
    } catch (e) {
      debugPrint('[UsageStatsService] Permission fallback check error: $e');
      return false;
    }
  }

  /// Query real Android UsageStatsManager data for today's application usage
  Future<List<AppUsageData>> getTodayUsageStats() async {
    if (!isPlatformSupported) {
      return [];
    }

    final hasPerm = await hasUsagePermission();
    if (!hasPerm) {
      debugPrint('[UsageStatsService] Permission not granted, skipping query.');
      return [];
    }

    try {
      final now = DateTime.now();
      final startDate = DateTime(now.year, now.month, now.day, 0, 0, 0);
      final List<AppUsageInfo> infos = await AppUsage().getAppUsage(startDate, now);

      // System background and launcher packages to exclude from screen time
      final ignoredPackages = {
        'com.guardianx.app',
        'android',
        'com.android.systemui',
        'com.google.android.inputmethod.latin',
        'com.samsung.android.honeyboard',
        'com.google.android.apps.nexuslauncher',
        'com.sec.android.app.launcher',
        'com.miui.home',
        'com.huawei.android.launcher',
      };

      final List<AppUsageData> realList = [];
      for (final info in infos) {
        final pkg = info.packageName.trim();
        if (pkg.isEmpty) {
          debugPrint('[UsageStatsService] Skipping entry with empty package name');
          continue;
        }

        if (ignoredPackages.contains(pkg)) continue;

        // Count apps used today: if inMinutes > 0 or inSeconds >= 20, count as at least 1 min
        int durationMinutes = info.usage.inMinutes;
        if (durationMinutes == 0 && info.usage.inSeconds >= 20) {
          durationMinutes = 1;
        }

        if (durationMinutes <= 0) continue;

        final friendlyName = await resolveAppTitle(pkg, info.appName);
        if (friendlyName.isEmpty) continue;

        realList.add(AppUsageData(
          packageName: pkg,
          appName: friendlyName,
          usageDurationMinutes: durationMinutes,
          sessionCount: 1,
        ));
      }

      if (realList.isNotEmpty) {
        realList.sort((a, b) => b.usageDurationMinutes.compareTo(a.usageDurationMinutes));
      }
      return realList;
    } catch (e) {
      debugPrint('[UsageStatsService] Native AppUsage fetch error: $e');
      return [];
    }
  }

  /// Resolve human-readable application label using Android PackageManager,
  /// with fallback to dictionary lookup and package name formatting.
  Future<String> resolveAppTitle(String pkg, String rawAppName) async {
    if (_appNameCache.containsKey(pkg)) {
      return _appNameCache[pkg]!;
    }

    // Try resolving directly via Android PackageManager through platform channel
    if (isPlatformSupported) {
      try {
        final String? nativeLabel = await _channel.invokeMethod<String>(
          'getAppLabel',
          {'packageName': pkg},
        );
        if (nativeLabel != null && nativeLabel.trim().isNotEmpty) {
          final label = nativeLabel.trim();
          _appNameCache[pkg] = label;
          return label;
        }
      } catch (_) {}
    }

    final resolved = AppNameResolver.resolve(pkg, rawAppName);
    _appNameCache[pkg] = resolved;
    return resolved;
  }

  /// Fetch native application icon PNG bytes on Android
  static Future<Uint8List?> getAppIconBytes(String packageName) async {
    if (!isPlatformSupported) return null;
    if (_appIconCache.containsKey(packageName)) {
      return _appIconCache[packageName];
    }
    try {
      final bytes = await _channel.invokeMethod<Uint8List>(
        'getAppIcon',
        {'packageName': packageName},
      );
      _appIconCache[packageName] = bytes;
      return bytes;
    } catch (_) {
      _appIconCache[packageName] = null;
      return null;
    }
  }

  /// Synchronously retrieve cached app icon bytes if already loaded
  static Uint8List? getCachedIconBytes(String packageName) {
    return _appIconCache[packageName];
  }
}
