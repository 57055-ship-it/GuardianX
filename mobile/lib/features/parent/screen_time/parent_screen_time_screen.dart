import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/usage_provider.dart';

class ParentScreenTimeScreen extends StatefulWidget {
  final String childId;

  const ParentScreenTimeScreen({super.key, required this.childId});

  @override
  State<ParentScreenTimeScreen> createState() => _ParentScreenTimeScreenState();
}

class _ParentScreenTimeScreenState extends State<ParentScreenTimeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<UsageProvider>(context, listen: false).fetchChildUsage(widget.childId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final usageProvider = Provider.of<UsageProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Digital Wellbeing & App Usage')),
      body: usageProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    color: AppColors.primary.withOpacity(0.12),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        children: [
                          const Text(
                            "Today's Total Screen Time",
                            style: TextStyle(fontSize: 14, color: Colors.grey),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            DateFormatter.formatMinutesToDuration(
                                usageProvider.totalScreenTimeMinutes),
                            style: const TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Digital wellbeing metadata collected from paired child devices.',
                            style: TextStyle(fontSize: 11, color: Colors.grey),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'App Usage Breakdown',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  if (usageProvider.appUsages.isEmpty)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(16.0),
                        child: Text(
                          'No application usage data logged for today.\n\nNote: Detailed per-app usage breakdowns are supported on Android child devices. iOS child devices restrict individual app usage monitoring due to Apple platform privacy policies.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: usageProvider.appUsages.length,
                      itemBuilder: (context, index) {
                        final usage = usageProvider.appUsages[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: AppColors.primary.withOpacity(0.15),
                              child: const Icon(Icons.android, color: AppColors.primary),
                            ),
                            title: Text(
                              usage.appName,
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            subtitle: Text(usage.packageName, style: const TextStyle(fontSize: 11)),
                            trailing: Text(
                              DateFormatter.formatMinutesToDuration(usage.usageDuration),
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),
    );
  }
}
