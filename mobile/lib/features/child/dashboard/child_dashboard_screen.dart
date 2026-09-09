import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/location_service.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/location_provider.dart';
import '../../../providers/routine_provider.dart';
import '../../../providers/usage_provider.dart';
import '../../shared/widgets/status_badge.dart';
import '../routines/hadith_session_modal.dart';
import '../sos/child_sos_screen.dart';

class ChildDashboardScreen extends StatefulWidget {
  const ChildDashboardScreen({super.key});

  @override
  State<ChildDashboardScreen> createState() => _ChildDashboardScreenState();
}

class _ChildDashboardScreenState extends State<ChildDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadChildData();
    });
  }

  void _loadChildData() {
    final authProv = Provider.of<AuthProvider>(context, listen: false);
    final childId = authProv.currentUser?.id;

    Provider.of<RoutineProvider>(context, listen: false).fetchRoutines(childId: childId);
    Provider.of<RoutineProvider>(context, listen: false).fetchTodayHadith();
    if (childId != null) {
      Provider.of<UsageProvider>(context, listen: false).fetchChildUsage(childId);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final routineProvider = Provider.of<RoutineProvider>(context);
    final usageProvider = Provider.of<UsageProvider>(context);
    final locationProvider = Provider.of<LocationProvider>(context);

    final childName = authProvider.currentUser?.name ?? 'Child';
    final currentPos = locationProvider.currentChildPosition;

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.shield, color: AppColors.secondary, size: 26),
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
                          childName[0].toUpperCase(),
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
                          const Row(
                            children: [
                              Icon(Icons.my_location, color: AppColors.primary, size: 22),
                              SizedBox(width: 8),
                              Text(
                                'GPS Location Sensor',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          StatusBadge(
                            label: locationProvider.permissionState == LocationPermissionState.granted
                                ? 'GPS Active'
                                : locationProvider.permissionState == LocationPermissionState.gpsDisabled
                                    ? 'GPS Disabled'
                                    : 'Permission Required',
                            isSuccess: locationProvider.permissionState == LocationPermissionState.granted,
                          ),
                        ],
                      ),
                      const Divider(height: 20),
                      if (currentPos != null && currentPos.hasRealSignal) ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Lat: ${currentPos.latitude.toStringAsFixed(4)}, Lng: ${currentPos.longitude.toStringAsFixed(4)}',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
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
                                childId: authProvider.currentUser?.id,
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
                    padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: const BoxDecoration(
                            color: AppColors.critical,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.sos, color: Colors.white, size: 28),
                        ),
                        const SizedBox(width: 16),
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'EMERGENCY SOS',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppColors.critical,
                              ),
                            ),
                            Text(
                              'Tap to alert your parents immediately',
                              style: TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Digital Wellbeing & Battery Status Card
              Row(
                children: [
                  Expanded(
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          children: [
                            const Icon(Icons.screen_search_desktop_outlined,
                                color: AppColors.primary, size: 28),
                            const SizedBox(height: 8),
                            Text(
                              DateFormatter.formatMinutesToDuration(
                                  usageProvider.totalScreenTimeMinutes),
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            const Text('Today Screen Time',
                                style: TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          children: [
                            const Icon(Icons.battery_5_bar, color: AppColors.secondary, size: 28),
                            const SizedBox(height: 8),
                            const Text(
                              '92%',
                              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            const Text('Battery Level',
                                style: TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Today's Family Routines
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Today's Family Routines",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  if (routineProvider.todayHadith != null)
                    TextButton.icon(
                      onPressed: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          shape: const RoundedRectangleBorder(
                            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                          ),
                          builder: (_) => HadithSessionModal(
                            hadith: routineProvider.todayHadith!,
                          ),
                        );
                      },
                      icon: const Icon(Icons.play_circle_fill, color: AppColors.secondary),
                      label: const Text('Start Hadith', style: TextStyle(color: AppColors.secondary)),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              if (routineProvider.routines.isEmpty)
                const Card(
                  child: Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text('No active family routines scheduled for today.'),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: routineProvider.routines.length,
                  itemBuilder: (context, index) {
                    final routine = routineProvider.routines[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: Icon(
                          routine.type == 'prayer_reminder'
                              ? Icons.mosque
                              : Icons.menu_book,
                          color: AppColors.secondary,
                        ),
                        title: Text(routine.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('Time: ${routine.scheduledTime}'),
                        trailing: routine.isCompletedToday
                            ? const StatusBadge(label: 'Completed', isSuccess: true)
                            : ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.secondary,
                                  minimumSize: const Size(80, 36),
                                ),
                                onPressed: () {
                                  routineProvider.completeRoutine(
                                    routine.id,
                                    childId: authProvider.currentUser?.id,
                                  );
                                },
                                child: const Text('Check In', style: TextStyle(fontSize: 12)),
                              ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
