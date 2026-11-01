import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

class AppBlockerNativeService {
  static const MethodChannel _channel = MethodChannel('com.guardianx/app_blocker');

  /// Platform capability check for Android app blocking
  static bool get isPlatformSupported => !kIsWeb && Platform.isAndroid;

  /// Sync list of blocked package names down to native Android BlockerManager and AppBlockerService
  Future<bool> setBlockedApps(List<String> packages) async {
    if (!isPlatformSupported) return false;
    try {
      final bool? success = await _channel.invokeMethod<bool>('setBlockedApps', {
        'packages': packages,
      });
      return success == true;
    } catch (e) {
      debugPrint('[AppBlockerNativeService] setBlockedApps error: $e');
      return false;
    }
  }

  /// Get list of blocked package names from native storage
  Future<List<String>> getBlockedApps() async {
    if (!isPlatformSupported) return [];
    try {
      final List? result = await _channel.invokeMethod<List>('getBlockedApps');
      if (result != null) {
        return result.cast<String>();
      }
    } catch (e) {
      debugPrint('[AppBlockerNativeService] getBlockedApps error: $e');
    }
    return [];
  }

  /// Check whether overlay permission (appear on top) is granted
  Future<bool> hasOverlayPermission() async {
    if (!isPlatformSupported) return false;
    try {
      final bool? hasPerm = await _channel.invokeMethod<bool>('hasOverlayPermission');
      return hasPerm == true;
    } catch (e) {
      debugPrint('[AppBlockerNativeService] hasOverlayPermission error: $e');
      return false;
    }
  }

  /// Open System Settings to grant appear on top permission
  Future<bool> requestOverlayPermission() async {
    if (!isPlatformSupported) return false;
    try {
      final bool? success = await _channel.invokeMethod<bool>('requestOverlayPermission');
      return success == true;
    } catch (e) {
      debugPrint('[AppBlockerNativeService] requestOverlayPermission error: $e');
      return false;
    }
  }
}

