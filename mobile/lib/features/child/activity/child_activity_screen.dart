import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/usage_stats_service.dart';
import '../../../core/utils/app_name_resolver.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../models/app_usage_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/usage_provider.dart';
import '../../shared/widgets/app_icon_widget.dart';

class ChildActivityScreen extends StatefulWidget {
  const ChildActivityScreen({super.key});

  @override
  State<ChildActivityScreen> createState() => _ChildActivityScreenState();
}

class _ChildActivityScreenState extends State<ChildActivityScreen> with WidgetsBindingObserver {
  bool _showOnlyBlocked = false;

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
    if (childId != null) {
      await usageProvider.fetchBlockedApps(childId);
    }
  }

  @override
  Widget build(BuildContext context) {
    final usageProvider = Provider.of<UsageProvider>(context);

    // Build combined list of all apps including blocked apps that may not have usage today
    final existingPackages = <String>{};
    for (final u in usageProvider.appUsages) {
      existingPackages.add(u.packageName);
    }

    final allUsages = List<AppUsageModel>.from(usageProvider.appUsages);
    for (final blocked in usageProvider.blockedAppsList) {
      final pkg = blocked['packageName']?.toString() ?? '';
      if (pkg.isNotEmpty && !existingPackages.contains(pkg)) {
        allUsages.add(AppUsageModel(
          id: 'blocked_$pkg',
          packageName: pkg,
          appName: blocked['appName']?.toString() ?? AppNameResolver.resolve(pkg),
          usageDuration: 0,
          sessionCount: 0,
          date: DateTime.now().toIso8601String().split('T')[0],
          isBlocked: true,
        ));
        existingPackages.add(pkg);
      }
    }

    final blockedList = allUsages
        .where((u) => u.isBlocked || usageProvider.isAppBlocked(u.packageName))
        .toList();
    final displayedUsages = _showOnlyBlocked ? blockedList : allUsages;
    final blockedCount = blockedList.length;

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
              const SizedBox(height: 20),

              // PARENTAL RESTRICTIONS SUMMARY BANNER (Tapping switches to Blocked tab)
              if (blockedCount > 0 && !_showOnlyBlocked) ...[
                InkWell(
                  onTap: () => setState(() => _showOnlyBlocked = true),
                  borderRadius: BorderRadius.circular(16),
                  child: Card(
                    color: const Color(0xFFFEF2F2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: const BorderSide(color: Color(0xFFFCA5A5), width: 1.2),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: Colors.red.shade100,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(Icons.block, color: Colors.red.shade700, size: 18),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '$blockedCount App(s) Blocked by Parent',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: Colors.red.shade900,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Tap here or switch to the Blocked tab below to inspect restricted apps.',
                                  style: TextStyle(fontSize: 11, color: Colors.red.shade800),
                                ),
                              ],
                            ),
                          ),
                          Icon(Icons.arrow_forward_ios_rounded, size: 13, color: Colors.red.shade700),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('App Usage Breakdown', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  if (blockedCount > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.red.shade100,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '$blockedCount Blocked',
                        style: TextStyle(
                          color: Colors.red.shade800,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),

              // Segmented Filter Tabs (All Apps vs Blocked Apps)
              Row(
                children: [
                  ChoiceChip(
                    label: Text('All Apps (${allUsages.length})'),
                    selected: !_showOnlyBlocked,
                    selectedColor: AppColors.secondary.withOpacity(0.18),
                    onSelected: (val) {
                      if (val) setState(() => _showOnlyBlocked = false);
                    },
                  ),
                  const SizedBox(width: 8),
                  ChoiceChip(
                    label: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.block,
                          size: 14,
                          color: _showOnlyBlocked ? Colors.white : Colors.red.shade700,
                        ),
                        const SizedBox(width: 4),
                        Text('Blocked ($blockedCount)'),
                      ],
                    ),
                    selected: _showOnlyBlocked,
                    selectedColor: Colors.red.shade600,
                    labelStyle: TextStyle(
                      color: _showOnlyBlocked ? Colors.white : Colors.red.shade800,
                      fontWeight: FontWeight.bold,
                    ),
                    onSelected: (val) {
                      if (val) setState(() => _showOnlyBlocked = true);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 12),

              if (usageProvider.isLoading && displayedUsages.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (displayedUsages.isEmpty)
                Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      children: [
                        Icon(
                          _showOnlyBlocked ? Icons.verified_user_rounded : Icons.hourglass_empty_rounded,
                          size: 44,
                          color: _showOnlyBlocked ? AppColors.success : Colors.grey,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _showOnlyBlocked
                              ? 'No Blocked Applications'
                              : 'No App Usage Recorded Today',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _showOnlyBlocked
                              ? 'Your parent has not placed restrictions on any apps. You have full access to all your applications.'
                              : 'As you use apps like YouTube, Chrome, or WhatsApp, your usage will appear here automatically.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                        if (!_showOnlyBlocked) ...[
                          const SizedBox(height: 14),
                          OutlinedButton.icon(
                            onPressed: _refreshStats,
                            icon: const Icon(Icons.refresh, size: 16),
                            label: const Text('Check for App Usage Now'),
                          ),
                        ],
                      ],
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: displayedUsages.length,
                  itemBuilder: (context, index) {
                    final item = displayedUsages[index];
                    final isBlocked = item.isBlocked || usageProvider.isAppBlocked(item.packageName);
                    final resolvedName = AppNameResolver.resolve(item.packageName, item.appName);

                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      color: isBlocked ? const Color(0xFFFFF1F2) : null,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(
                          color: isBlocked ? Colors.red.shade200 : Colors.grey.shade200,
                          width: isBlocked ? 1.2 : 0.8,
                        ),
                      ),
                      child: ListTile(
                        leading: AppIconWidget(
                          packageName: item.packageName,
                          appName: resolvedName,
                          size: 42,
                          isBlocked: isBlocked,
                        ),
                        title: Row(
                          children: [
                            Flexible(
                              child: Text(
                                resolvedName,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: isBlocked ? Colors.red.shade900 : null,
                                  decoration: isBlocked ? TextDecoration.lineThrough : null,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (isBlocked) ...[
                              const SizedBox(width: 8),
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
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 2),
                            Text(
                              item.packageName,
                              style: TextStyle(
                                fontSize: 11,
                                color: isBlocked ? Colors.red.shade700 : Colors.grey.shade600,
                                fontWeight: isBlocked ? FontWeight.w500 : FontWeight.normal,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (isBlocked) ...[
                              const SizedBox(height: 2),
                              Text(
                                'Restricted by parent • Intercepted if opened',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.red.shade600,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ],
                        ),
                        trailing: isBlocked && item.usageDuration == 0
                            ? Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.red.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.red.shade300, width: 0.8),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.lock, size: 12, color: Colors.red.shade700),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Restricted',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.red.shade800,
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : Text(
                                DateFormatter.formatMinutesToDuration(item.usageDuration),
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: isBlocked ? Colors.red.shade700 : AppColors.secondary,
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
