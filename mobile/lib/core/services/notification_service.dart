import 'dart:io' show Platform;
import 'dart:ui' show Color;
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';


class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notificationsPlugin = FlutterLocalNotificationsPlugin();
  bool _isInitialized = false;

  /// Initialize Android & iOS local notification plugin and channels
  Future<void> initialize() async {
    if (_isInitialized || kIsWeb) return;

    try {
      const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
      const iosSettings = DarwinInitializationSettings(
        requestAlertPermission: false,
        requestBadgePermission: false,
        requestSoundPermission: false,
      );

      const initSettings = InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      );

      await _notificationsPlugin.initialize(
        initSettings,
        onDidReceiveNotificationResponse: (details) {
          debugPrint('[NotificationService] Notification tapped: ${details.payload}');
        },
      );

      _isInitialized = true;
    } catch (e) {
      debugPrint('[NotificationService] Initialization error: $e');
    }
  }

  /// Request Android 13+ POST_NOTIFICATIONS permission
  Future<bool> requestNotificationPermission() async {
    if (kIsWeb) return true;
    try {
      if (Platform.isAndroid) {
        final status = await Permission.notification.request();
        return status.isGranted;
      }
      return true;
    } catch (e) {
      debugPrint('[NotificationService] Permission request error: $e');
      return false;
    }
  }

  /// Trigger emergency SOS distress alert notification
  Future<void> showSOSNotification({required String childName, required String locationStr}) async {
    await initialize();
    const androidDetails = AndroidNotificationDetails(
      'sos_channel',
      'Emergency SOS Alerts',
      channelDescription: 'High-priority critical alerts for child SOS distress triggers',
      importance: Importance.max,
      priority: Priority.high,
      colorized: true,
      color: Color(0xFFD32F2F),
    );

    const notificationDetails = NotificationDetails(android: androidDetails);
    await _notificationsPlugin.show(
      1001,
      '🚨 EMERGENCY SOS TRIGGERED!',
      '$childName activated the emergency distress signal at $locationStr.',
      notificationDetails,
    );
  }

  /// Trigger safe zone geofence enter/exit alert notification
  Future<void> showGeofenceNotification({
    required String title,
    required String message,
    bool isExit = false,
  }) async {
    await initialize();
    final androidDetails = AndroidNotificationDetails(
      'geofence_channel',
      'Safe Zone Alerts',
      channelDescription: 'Notifications when child enters or leaves safe zone geofences',
      importance: Importance.high,
      priority: Priority.high,
      color: isExit ? const Color(0xFFE65100) : const Color(0xFF2E7D32),
    );

    final notificationDetails = NotificationDetails(android: androidDetails);
    await _notificationsPlugin.show(
      2001,
      title,
      message,
      notificationDetails,
    );
  }

  /// Trigger routine reminder notification
  Future<void> showRoutineNotification({required String title, required String message}) async {
    await initialize();
    const androidDetails = AndroidNotificationDetails(
      'routine_channel',
      'Family Routine Reminders',
      channelDescription: 'Notifications for prayer reminders and Hadith study sessions',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
    );

    const notificationDetails = NotificationDetails(android: androidDetails);
    await _notificationsPlugin.show(
      3001,
      title,
      message,
      notificationDetails,
    );
  }
}
