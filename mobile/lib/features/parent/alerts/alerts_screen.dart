import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/alert_provider.dart';
import '../../../providers/child_provider.dart';
import '../../shared/widgets/empty_state_view.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final childProv = Provider.of<ChildProvider>(context, listen: false);
      final childId = childProv.selectedChild?.id;
      Provider.of<AlertProvider>(context, listen: false).fetchAlerts(childId: childId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final alertProvider = Provider.of<AlertProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Safety Alerts & Notifications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              final childProv = Provider.of<ChildProvider>(context, listen: false);
              alertProvider.fetchAlerts(childId: childProv.selectedChild?.id);
            },
          ),
        ],
      ),
      body: alertProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : alertProvider.alerts.isEmpty
              ? EmptyStateView(
                  title: 'No Alerts Recorded',
                  message: 'Your family safety log is clean. System notifications will appear here.',
                  icon: Icons.notifications_off_outlined,
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: alertProvider.alerts.length,
                  itemBuilder: (context, index) {
                    final alert = alertProvider.alerts[index];
                    final isCritical = alert.severity == 'critical';

                    return Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      color: alert.isRead
                          ? null
                          : (isCritical
                              ? AppColors.critical.withOpacity(0.12)
                              : AppColors.primary.withOpacity(0.08)),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: isCritical
                              ? AppColors.critical
                              : alert.severity == 'high'
                                  ? AppColors.warning
                                  : AppColors.info,
                          child: Icon(
                            isCritical
                                ? Icons.warning_amber
                                : alert.type.contains('geofence')
                                    ? Icons.location_on
                                    : Icons.info_outline,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                        title: Text(
                          alert.title,
                          style: TextStyle(
                            fontWeight: alert.isRead ? FontWeight.normal : FontWeight.bold,
                          ),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            Text(alert.message),
                            const SizedBox(height: 4),
                            Text(
                              DateFormatter.formatShortDateTime(alert.createdAt),
                              style: const TextStyle(fontSize: 10, color: Colors.grey),
                            ),
                          ],
                        ),
                        trailing: alert.isRead
                            ? null
                            : IconButton(
                                icon: const Icon(Icons.mark_email_read, size: 20),
                                onPressed: () => alertProvider.markAsRead(alert.id),
                              ),
                      ),
                    );
                  },
                ),
    );
  }
}
