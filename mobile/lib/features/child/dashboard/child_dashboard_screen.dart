import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battery_plus/battery_plus.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_client.dart';
import '../../../core/services/device_service.dart';
import '../../../core/services/location_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/services/usage_stats_service.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/location_provider.dart';
import '../../../providers/usage_provider.dart';
import '../../shared/widgets/status_badge.dart';
import '../activity/child_activity_screen.dart';
import '../sos/child_sos_screen.dart';

class ChildDashboardScreen extends StatefulWidget {
  const ChildDashboardScreen({super.key});

  @override
  State<ChildDashboardScreen> createState() => _ChildDashboardScreenState();
}

class _ChildDashboardScreenState extends State<ChildDashboardScreen> with WidgetsBindingObserver {
  int _batteryLevel = 100;
  bool _isCharging = false;
  StreamSubscription<BatteryState>? _batterySubscription;
  Timer? _heartbeatTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadChildData();
      _fetchRealBatteryStatus();
      _listenToBatteryChanges();
      _heartbeatTimer = Timer.periodic(const Duration(seconds: 30), (_) {
        _fetchRealBatteryStatus();
        _syncChildUsage();
      });
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Re-check permissions and sync immediately when child returns from Android Settings
      _syncChildUsage();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _heartbeatTimer?.cancel();
    _batterySubscription?.cancel();
    super.dispose();
  }

  Future<void> _fetchRealBatteryStatus() async {
    try {
      if (!mounted) return;
      final apiClient = Provider.of<ApiClient>(context, listen: false);
      final storageService = Provider.of<StorageService>(context, listen: false);
      final deviceService = DeviceService(apiClient);
      final status = await deviceService.getDeviceStatus();
      if (mounted) {
        setState(() {
          _batteryLevel = status.batteryLevel;
          _isCharging = status.isCharging;
        });
      }
      if (!mounted) return;
      final authProv = Provider.of<AuthProvider>(context, listen: false);
      final targetChildId = storageService.childId ?? authProv.currentUser?.id;
      if (targetChildId != null) {
        await deviceService.sendHeartbeat(childId: targetChildId);
      }
    } catch (e) {
      debugPrint('[ChildDashboard] Battery fetch error: $e');
    }
  }

  void _listenToBatteryChanges() {
    if (!kIsWeb) {
      try {
        _batterySubscription = Battery().onBatteryStateChanged.listen((_) {
          _fetchRealBatteryStatus();
        });
      } catch (e) {
        debugPrint('[ChildDashboard] Battery stream error: $e');
      }
    }
  }

  Future<void> _loadChildData() async {
    final authProv = Provider.of<AuthProvider>(context, listen: false);
    final childId = authProv.childId ?? authProv.currentUser?.id;
    final usageProv = Provider.of<UsageProvider>(context, listen: false);

    final hasPerm = await usageProv.checkPermission();
    if (hasPerm && UsageStatsService.isPlatformSupported) {
      await usageProv.syncUsageStats(childId: childId);
    } else if (childId != null) {
      await usageProv.fetchChildUsage(childId);
    }
    if (childId != null) {
      await usageProv.fetchBlockedApps(childId);
    }
    _fetchRealBatteryStatus();
  }

  Future<void> _syncChildUsage() async {
    try {
      if (!mounted) return;
      final authProv = Provider.of<AuthProvider>(context, listen: false);
      final childId = authProv.childId ?? authProv.currentUser?.id;
      final usageProv = Provider.of<UsageProvider>(context, listen: false);
      final hasPerm = await usageProv.checkPermission();
      if (hasPerm) {
        await usageProv.syncUsageStats(childId: childId);
      }
      if (childId != null) {
        await usageProv.fetchBlockedApps(childId);
      }
    } catch (e) {
      debugPrint('[ChildDashboard] Usage sync error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final usageProvider = Provider.of<UsageProvider>(context);
    final locationProvider = Provider.of<LocationProvider>(context);

    final childName = authProvider.currentUser?.name ?? 'Child';
    final currentPos = locationProvider.currentChildPosition;

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.shield, color: AppColors.secondary, size: 24),
            SizedBox(width: 8),
            Text('GUARDIANX', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async => _loadChildData(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Friendly Greeting Banner
              Card(
                color: AppColors.secondary.withOpacity(0.12),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 26,
                        backgroundColor: AppColors.secondary,
                        child: Text(
                          childName.isNotEmpty ? childName[0].toUpperCase() : 'C',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Hello, $childName!',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            const StatusBadge(
                              label: 'Protected & Connected',
                              isSuccess: true,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // ANDROID USAGE ACCESS PERMISSION BANNER
              if (UsageStatsService.isPlatformSupported && !usageProvider.hasPermission) ...[
                Card(
                  color: Colors.amber.shade50,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.amber.shade300, width: 1.2),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.warning_amber_rounded, color: Colors.amber.shade800, size: 24),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                'App Usage Access Needed',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  color: Colors.black87,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Android requires special permission to monitor app usage and screen time. Tap below to enable Usage Access.',
                          style: TextStyle(fontSize: 12, color: Colors.black87, height: 1.3),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.amber.shade800,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            onPressed: () async {
                              await usageProvider.requestUsageAccess();
                            },
                            icon: const Icon(Icons.settings_applications, size: 18),
                            label: const Text('Grant App Usage Access'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // OVERLAY (APPEAR ON TOP) PERMISSION WARNING BANNER IF NEEDED
              if (UsageStatsService.isPlatformSupported &&
                  usageProvider.hasPermission &&
                  !usageProvider.hasOverlayPermission) ...[
                Card(
                  color: Colors.blue.shade50,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.blue.shade300, width: 1.2),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.layers, color: Colors.blue.shade800, size: 24),
                            const SizedBox(width: 10),
                            const Expanded(
                              child: Text(
                                'Appear on Top Permission Needed',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  color: Colors.black87,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'To display the restriction screen over apps blocked by your parent, please allow GuardianX to Appear on top.',
                          style: TextStyle(fontSize: 12, color: Colors.black87, height: 1.3),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue.shade800,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            onPressed: () async {
                              await usageProvider.requestOverlayPermission();
                            },
                            icon: const Icon(Icons.security, size: 18),
                            label: const Text('Enable Appear on Top'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // REAL GPS LOCATION SENSOR STATUS CARD
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Expanded(
                            child: Row(
                              children: [
                                Icon(Icons.my_location, color: AppColors.primary, size: 22),
                                SizedBox(width: 8),
                                Flexible(
                                  child: Text(
                                    'GPS Location Sensor',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          StatusBadge(
                            label: locationProvider.permissionState == LocationPermissionState.granted
                                ? 'GPS Active'
                                : locationProvider.permissionState == LocationPermissionState.gpsDisabled
                                    ? 'GPS Disabled'
                                    : 'Permission Needed',
                            isSuccess: locationProvider.permissionState == LocationPermissionState.granted,
                          ),
                        ],
                      ),
                      const Divider(height: 20),
                      if (currentPos != null && currentPos.hasRealSignal) ...[
                        Wrap(
                          alignment: WrapAlignment.spaceBetween,
                          runSpacing: 4,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Text(
                              'Lat: ${currentPos.latitude.toStringAsFixed(4)}, Lng: ${currentPos.longitude.toStringAsFixed(4)}',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                            Text(
                              'Accuracy ±${currentPos.accuracy.toStringAsFixed(1)} m',
                              style: TextStyle(
                                fontSize: 11,
                                color: currentPos.accuracy > 50 ? Colors.orange : Colors.grey,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Last Synced: ${DateFormatter.formatTime(currentPos.timestamp)}',
                          style: const TextStyle(fontSize: 11, color: Colors.grey),
                        ),
                      ] else ...[
                        Text(
                          locationProvider.permissionState == LocationPermissionState.granted
                              ? 'Acquiring high-accuracy satellite GPS fix...'
                              : 'Location permissions or GPS hardware service disabled.',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                        if (locationProvider.permissionState != LocationPermissionState.granted) ...[
                          const SizedBox(height: 10),
                          OutlinedButton.icon(
                            onPressed: () {
                              locationProvider.startChildLocationTracking(
                                childId: authProvider.childId ?? authProvider.currentUser?.id,
                              );
                            },
                            icon: const Icon(Icons.security, size: 16),
                            label: const Text('Enable Real GPS Permission'),
                          ),
                        ],
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Prominent Emergency SOS Trigger Button
              Card(
                color: AppColors.critical.withOpacity(0.15),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: AppColors.critical.withOpacity(0.4), width: 1.5),
                ),
                child: InkWell(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const ChildSOSScreen()),
                    );
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: const BoxDecoration(
                            color: AppColors.critical,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.sos, color: Colors.white, size: 28),
                        ),
                        const SizedBox(width: 14),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'EMERGENCY SOS',
                                style: TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.critical,
                                ),
                              ),
                              Text(
                                'Tap to alert your parents immediately',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Digital Wellbeing & Battery Status Card
              Row(
                children: [
                  Expanded(
                    child: Card(
                      child: InkWell(
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const ChildActivityScreen()),
                          );
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Padding(
                          padding: const EdgeInsets.all(14.0),
                          child: Column(
                            children: [
                              const Icon(Icons.screen_search_desktop_outlined,
                                  color: AppColors.primary, size: 26),
                              const SizedBox(height: 8),
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                child: Text(
                                  DateFormatter.formatMinutesToDuration(
                                      usageProvider.totalScreenTimeMinutes),
                                  style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(height: 2),
                              const FittedBox(
                                fit: BoxFit.scaleDown,
                                child: Text('Today Screen Time',
                                    style: TextStyle(fontSize: 11, color: Colors.grey)),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(14.0),
                        child: Column(
                          children: [
                            Icon(
                              _isCharging ? Icons.battery_charging_full : Icons.battery_5_bar,
                              color: _isCharging ? AppColors.success : AppColors.secondary,
                              size: 26,
                            ),
                            const SizedBox(height: 8),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Text(
                                '$_batteryLevel%',
                                style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold),
                              ),
                            ),
                            const SizedBox(height: 2),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Text(
                                _isCharging ? 'Charging' : 'Battery Level',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: _isCharging ? AppColors.success : Colors.grey,
                                  fontWeight: _isCharging ? FontWeight.bold : FontWeight.normal,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // BLOCKED APPS BY PARENT ALERT CARD
              if (usageProvider.blockedAppsList.isNotEmpty) ...[
                Card(
                  color: const Color(0xFFFEF2F2), // Light soft red
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: Color(0xFFFCA5A5), width: 1.2),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: Colors.red.shade100,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(Icons.block, color: Colors.red.shade700, size: 18),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Apps Blocked by Parent (${usageProvider.blockedAppsList.length})',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                      color: Colors.red.shade900,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Access to these apps is restricted:',
                                    style: TextStyle(fontSize: 11, color: Colors.red.shade700),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: usageProvider.blockedAppsList.map((app) {
                            final name = app['appName']?.toString() ?? app['packageName']?.toString() ?? 'App';
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.red.shade300),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.red.withOpacity(0.06),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.lock, size: 12, color: Colors.red.shade700),
                                  const SizedBox(width: 5),
                                  Text(
                                    name,
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.red.shade900,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // TOP RECENT APPS SUMMARY
              if (usageProvider.appUsages.isNotEmpty) ...[
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.apps, color: AppColors.secondary, size: 20),
                                SizedBox(width: 8),
                                Text(
                                  'Top Apps Today',
                                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const ChildActivityScreen(),
                                  ),
                                );
                              },
                              child: const Text('View All', style: TextStyle(fontSize: 12)),
                            ),
                          ],
                        ),
                        const Divider(height: 16),
                        ...usageProvider.appUsages.take(3).map((usage) {
                          final isBlocked = usage.isBlocked || usageProvider.isAppBlocked(usage.packageName);
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4.0),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 14,
                                  backgroundColor: isBlocked
                                      ? Colors.red.shade50
                                      : AppColors.secondary.withOpacity(0.12),
                                  child: Icon(
                                    isBlocked ? Icons.lock : Icons.android,
                                    size: 16,
                                    color: isBlocked ? Colors.red.shade700 : AppColors.secondary,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Row(
                                    children: [
                                      Flexible(
                                        child: Text(
                                          usage.appName,
                                          style: TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 13,
                                            color: isBlocked ? Colors.red.shade900 : null,
                                            decoration: isBlocked ? TextDecoration.lineThrough : null,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      if (isBlocked) ...[
                                        const SizedBox(width: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: Colors.red.shade600,
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: const Text(
                                            'BLOCKED',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 9,
                                              fontWeight: FontWeight.bold,
                                              letterSpacing: 0.5,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                                Text(
                                  DateFormatter.formatMinutesToDuration(usage.usageDuration),
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: isBlocked ? Colors.red.shade700 : AppColors.secondary,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
