import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/usage_stats_service.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/usage_provider.dart';

class ChildActivityScreen extends StatefulWidget {
  const ChildActivityScreen({super.key});

  @override
  State<ChildActivityScreen> createState() => _ChildActivityScreenState();
}

class _ChildActivityScreenState extends State<ChildActivityScreen> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _refreshStats();
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _refreshStats();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  Future<void> _refreshStats() async {
    final authProv = Provider.of<AuthProvider>(context, listen: false);
    final childId = authProv.childId ?? authProv.currentUser?.id;
    final usageProvider = Provider.of<UsageProvider>(context, listen: false);
    await usageProvider.checkPermission();
    if (usageProvider.hasPermission) {
      await usageProvider.syncUsageStats(childId: childId);
    } else if (childId != null) {
      await usageProvider.fetchChildUsage(childId);
    }
  }

  @override
  Widget build(BuildContext context) {
    final usageProvider = Provider.of<UsageProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Daily Activity'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Sync Usage',
            onPressed: _refreshStats,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refreshStats,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // PERMISSION WARNING BANNER IF NEEDED
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
                            Icon(Icons.warning_amber_rounded, color: Colors.amber.shade800),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                'Usage Access Permission Needed',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'To display your daily screen time and application breakdown, please enable Usage Access in your device settings.',
                          style: TextStyle(fontSize: 12, color: Colors.black87),
                        ),
                        const SizedBox(height: 10),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.amber.shade800,
                            foregroundColor: Colors.white,
                          ),
                          onPressed: () async {
                            await usageProvider.requestUsageAccess();
                          },
                          icon: const Icon(Icons.settings, size: 16),
                          label: const Text('Grant Permission in Settings'),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Today Screen Time Card
              Card(
                color: AppColors.secondary.withOpacity(0.12),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      const Text('Today Screen Time', style: TextStyle(fontSize: 14)),
                      const SizedBox(height: 8),
                      FittedBox(
                        fit: BoxFit.scaleDown,
                        child: Text(
                          DateFormatter.formatMinutesToDuration(
                              usageProvider.totalScreenTimeMinutes),
                          style: const TextStyle(
                            fontSize: 34,
                            fontWeight: FontWeight.bold,
                            color: AppColors.secondary,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Daily Recommended Limit: 3 Hours',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              const Text('My App Usage', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              if (usageProvider.isLoading && usageProvider.appUsages.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (usageProvider.appUsages.isEmpty)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      children: [
                        const Icon(Icons.hourglass_empty, size: 40, color: Colors.grey),
                        const SizedBox(height: 12),
                        const Text(
                          'No App Usage Recorded Today',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'As you use apps like YouTube, Chrome, or WhatsApp, your usage will appear here automatically.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                        const SizedBox(height: 14),
                        OutlinedButton.icon(
                          onPressed: _refreshStats,
                          icon: const Icon(Icons.refresh, size: 16),
                          label: const Text('Check for App Usage Now'),
                        ),
                      ],
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: usageProvider.appUsages.length,
                  itemBuilder: (context, index) {
                    final item = usageProvider.appUsages[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppColors.secondary.withOpacity(0.15),
                          child: const Icon(Icons.android, color: AppColors.secondary),
                        ),
                        title: Text(item.appName, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(
                          item.packageName,
                          style: const TextStyle(fontSize: 11, color: Colors.grey),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        trailing: Text(
                          DateFormatter.formatMinutesToDuration(item.usageDuration),
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppColors.secondary,
                            fontSize: 14,
                          ),
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
