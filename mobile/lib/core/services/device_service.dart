import 'dart:io' show Platform;
import 'package:battery_plus/battery_plus.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';
import 'api_client.dart';

class DeviceStatus {
  final int batteryLevel;
  final bool isCharging;
  final String deviceName;
  final String platform;
  final String deviceIdentifier;
  final DateTime lastSeen;

  DeviceStatus({
    required this.batteryLevel,
    required this.isCharging,
    required this.deviceName,
    required this.platform,
    required this.deviceIdentifier,
    required this.lastSeen,
  });
}

class DeviceService {
  final ApiClient _apiClient;
  final Battery _battery = Battery();
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  DeviceService(this._apiClient);

  /// Fetch real battery level (0-100)
  Future<int> getBatteryLevel() async {
    try {
      if (kIsWeb) return 100;
      return await _battery.batteryLevel;
    } catch (e) {
      debugPrint('[DeviceService] getBatteryLevel error: $e');
      return 100;
    }
  }

  /// Check if device is currently charging
  Future<bool> isCharging() async {
    try {
      if (kIsWeb) return false;
      final state = await _battery.batteryState;
      return state == BatteryState.charging || state == BatteryState.full;
    } catch (e) {
      debugPrint('[DeviceService] isCharging error: $e');
      return false;
    }
  }

  /// Fetch real Android/iOS device hardware information
  Future<DeviceStatus> getDeviceStatus() async {
    final battery = await getBatteryLevel();
    final charging = await isCharging();
    String name = 'Smart Device';
    String platformName = kIsWeb ? 'web' : (Platform.isAndroid ? 'android' : 'ios');
    String identifier = 'dev_${DateTime.now().millisecondsSinceEpoch}';

    try {
      if (!kIsWeb) {
        if (Platform.isAndroid) {
          final androidInfo = await _deviceInfo.androidInfo;
          name = '${androidInfo.manufacturer} ${androidInfo.model}';
          identifier = androidInfo.id;
        } else if (Platform.isIOS) {
          final iosInfo = await _deviceInfo.iosInfo;
          name = iosInfo.name;
          identifier = iosInfo.identifierForVendor ?? identifier;
        }
      }
    } catch (e) {
      debugPrint('[DeviceService] DeviceInfo fetch error: $e');
    }

    return DeviceStatus(
      batteryLevel: battery,
      isCharging: charging,
      deviceName: name,
      platform: platformName,
      deviceIdentifier: identifier,
      lastSeen: DateTime.now(),
    );
  }

  /// Send lightweight device heartbeat to backend API
  Future<void> sendHeartbeat({String? childId}) async {
    try {
      final status = await getDeviceStatus();
      await _apiClient.post(
        ApiConstants.heartbeat,
        body: {
          if (childId != null) 'childId': childId,
          'batteryLevel': status.batteryLevel,
          'isCharging': status.isCharging,
          'deviceName': status.deviceName,
          'platform': status.platform,
          'deviceIdentifier': status.deviceIdentifier,
        },
      );
    } catch (e) {
      debugPrint('[DeviceService] Heartbeat transmission failed: $e');
    }
  }
}
