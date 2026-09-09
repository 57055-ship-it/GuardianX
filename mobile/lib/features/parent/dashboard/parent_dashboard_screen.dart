import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/child_provider.dart';
import '../../../providers/alert_provider.dart';
import '../../../providers/location_provider.dart';
import '../../../providers/usage_provider.dart';
import '../../../providers/report_provider.dart';
import '../../shared/widgets/status_badge.dart';

import '../location/parent_location_screen.dart';
import '../location/google_maps_location_card.dart';
import '../geofences/geofence_management_screen.dart';
import '../screen_time/parent_screen_time_screen.dart';
import '../routines/parent_routines_screen.dart';

class ParentDashboardScreen extends StatefulWidget {
  const ParentDashboardScreen({super.key});

  @override
  State<ParentDashboardScreen> createState() => _ParentDashboardScreenState();
}

class _ParentDashboardScreenState extends State<ParentDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadDashboardData();
    });
  }

  void _loadDashboardData() async {
    final childProvider = Provider.of<ChildProvider>(context, listen: false);
    await childProvider.fetchChildren();

    if (childProvider.selectedChild != null && mounted) {
      final childId = childProvider.selectedChild!.id;
      Provider.of<AlertProvider>(context, listen: false).fetchAlerts(childId: childId);
      Provider.of<LocationProvider>(context, listen: false).fetchLatestLocation(childId);
      Provider.of<UsageProvider>(context, listen: false).fetchChildUsage(childId);
      Provider.of<ReportProvider>(context, listen: false).fetchReportsAndInsights(childId);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final childProvider = Provider.of<ChildProvider>(context);
    final alertProvider = Provider.of<AlertProvider>(context);
    final locationProvider = Provider.of<LocationProvider>(context);
    final usageProvider = Provider.of<UsageProvider>(context);
    final reportProvider = Provider.of<ReportProvider>(context);

    final selectedChild = childProvider.selectedChild;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.shield, color: AppColors.primary, size: 28),
            const SizedBox(width: 8),
            Text(
              'GUARDIANX',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
                color: Theme.of(context).textTheme.titleLarge?.color,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadDashboardData,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => _loadDashboardData(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Greeting
              Text(
                'Good day, ${authProvider.currentUser?.name ?? "Parent"} 👋',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              const Text(
                'Child Safety & Digital Wellbeing Summary',
                style: TextStyle(color: Colors.grey, fontSize: 13),
              ),
              const SizedBox(height: 20),

              // Child Selector Chips
              if (childProvider.children.isNotEmpty) ...[
                SizedBox(
                  height: 42,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: childProvider.children.length,
                    itemBuilder: (context, index) {
                      final child = childProvider.children[index];
                      final isSelected = selectedChild?.id == child.id;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: ChoiceChip(
                          avatar: Icon(
                            Icons.child_care,
                            color: isSelected ? Colors.white : AppColors.primary,
                            size: 18,
                          ),
                          label: Text(child.name),
                          selected: isSelected,
                          selectedColor: AppColors.primary,
                          onSelected: (selected) {
                            if (selected) {
                              childProvider.selectChild(child);
                              _loadDashboardData();
                            }
                          },
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),
              ],

              if (selectedChild != null) ...[
                // Main Child Overview Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 20,
                                  backgroundColor: AppColors.primary.withOpacity(0.2),
                                  child: Text(
                                    selectedChild.name[0].toUpperCase(),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      selectedChild.name,
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      selectedChild.device?.deviceName ?? 'Paired Device',
                                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            StatusBadge(
                              label: selectedChild.isPaired
                                  ? (selectedChild.device?.isOnline ?? true ? 'Online' : 'Offline')
                                  : 'Unpaired',
                              isSuccess: selectedChild.isPaired &&
                                  (selectedChild.device?.isOnline ?? true),
                            ),
                          ],
                        ),
                        const Divider(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildMetricItem(
                              icon: Icons.battery_charging_full,
                              color: Colors.green,
                              title: 'Battery',
                              value: '${selectedChild.device?.batteryLevel ?? 85}%',
                            ),
                            _buildMetricItem(
                              icon: Icons.timer_outlined,
                              color: AppColors.primary,
                              title: "Today's Time",
                              value: DateFormatter.formatMinutesToDuration(
                                  usageProvider.totalScreenTimeMinutes),
                            ),
                            _buildMetricItem(
                              icon: Icons.shield_outlined,
                              color: AppColors.secondary,
                              title: 'Safety Score',
                              value: '${reportProvider.calculatedSafetyScore}/100',
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Google Maps Location Card
                GoogleMapsLocationCard(
                  location: locationProvider.latestLocation,
                  childName: selectedChild.name,
                ),
                const SizedBox(height: 20),

                // Quick Action Buttons Grid
                const Text(
                  'Quick Actions',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 4,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  children: [
                    _buildQuickActionButton(
                      icon: Icons.map_outlined,
                      label: 'Location',
                      color: Colors.blue,
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => ParentLocationScreen(childId: selectedChild.id),
                          ),
                        );
                      },
                    ),
                    _buildQuickActionButton(
                      icon: Icons.area_chart_outlined,
                      label: 'Screen Time',
                      color: Colors.purple,
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => ParentScreenTimeScreen(childId: selectedChild.id),
                          ),
                        );
                      },
                    ),
                    _buildQuickActionButton(
                      icon: Icons.shield_moon_outlined,
                      label: 'Safe Zones',
                      color: Colors.teal,
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => GeofenceManagementScreen(childId: selectedChild.id),
                          ),
                        );
                      },
                    ),
                    _buildQuickActionButton(
                      icon: Icons.mosque_outlined,
                      label: 'Routines',
                      color: Colors.amber[800]!,
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => ParentRoutinesScreen(childId: selectedChild.id),
                          ),
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Recent Safety Alerts
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Recent Safety Alerts',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    if (alertProvider.alerts.isNotEmpty)
                      Text(
                        '${alertProvider.alerts.length} total',
                        style: const TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                if (alertProvider.alerts.isEmpty)
                  const Card(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Row(
                        children: [
                          Icon(Icons.check_circle_outline, color: AppColors.success),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text('No security alerts or distress signals detected.'),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: alertProvider.alerts.take(3).length,
                    itemBuilder: (context, index) {
                      final alert = alertProvider.alerts[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: Icon(
                            alert.severity == 'critical'
                                ? Icons.error
                                : alert.severity == 'high'
                                    ? Icons.warning
                                    : Icons.info,
                            color: alert.severity == 'critical'
                                ? AppColors.critical
                                : alert.severity == 'high'
                                    ? AppColors.warning
                                    : AppColors.info,
                          ),
                          title: Text(
                            alert.title,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          subtitle: Text(alert.message, style: const TextStyle(fontSize: 12)),
                          trailing: Text(
                            DateFormatter.formatTime(alert.createdAt),
                            style: const TextStyle(fontSize: 10, color: Colors.grey),
                          ),
                        ),
                      );
                    },
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricItem({
    required IconData icon,
    required Color color,
    required String title,
    required String value,
  }) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        Text(
          title,
          style: const TextStyle(fontSize: 11, color: Colors.grey),
        ),
      ],
    );
  }

  Widget _buildQuickActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 26),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
