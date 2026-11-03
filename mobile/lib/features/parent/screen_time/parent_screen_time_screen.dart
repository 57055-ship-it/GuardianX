import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/app_name_resolver.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../models/app_usage_model.dart';
import '../../../providers/usage_provider.dart';
import '../../shared/widgets/app_icon_widget.dart';

class ParentScreenTimeScreen extends StatefulWidget {
  final String childId;

  const ParentScreenTimeScreen({super.key, required this.childId});

  @override
  State<ParentScreenTimeScreen> createState() => _ParentScreenTimeScreenState();
}

class _ParentScreenTimeScreenState extends State<ParentScreenTimeScreen> {
  bool _showOnlyBlocked = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<UsageProvider>(context, listen: false).fetchChildUsage(widget.childId);
    });
  }

  void _showBlockDialog(BuildContext context, UsageProvider provider, AppUsageModel usage, bool shouldBlock) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(
              shouldBlock ? Icons.block : Icons.lock_open,
              color: shouldBlock ? AppColors.critical : AppColors.success,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                shouldBlock ? 'Block ${usage.appName}?' : 'Unblock ${usage.appName}?',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Text(
          shouldBlock
              ? 'Blocking will prevent your child from accessing and using ${usage.appName} on their device.'
              : 'Unblocking will restore your child\'s access to ${usage.appName}.',
          style: const TextStyle(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: shouldBlock ? AppColors.critical : AppColors.success,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              final success = await provider.toggleBlockApp(
                childId: widget.childId,
                packageName: usage.packageName,
                appName: usage.appName,
                isBlocked: shouldBlock,
              );
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      success
                          ? (shouldBlock
                              ? '${usage.appName} is now blocked.'
                              : '${usage.appName} has been unblocked.')
                          : 'Failed to update app blocking status.',
                    ),
                    backgroundColor: success
                        ? (shouldBlock ? AppColors.critical : AppColors.success)
                        : Colors.black87,
                  ),
                );
              }
            },
            child: Text(shouldBlock ? 'Block App' : 'Unblock App'),
          ),
        ],
      ),
    );
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
        title: const Text('Digital Wellbeing & App Usage'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
            onPressed: () => Provider.of<UsageProvider>(context, listen: false).fetchChildUsage(widget.childId),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => Provider.of<UsageProvider>(context, listen: false).fetchChildUsage(widget.childId),
        child: usageProvider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
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
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'App Usage Breakdown',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      if (blockedCount > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.critical.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '$blockedCount Blocked',
                            style: const TextStyle(
                              color: AppColors.critical,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Filter Tabs
                  Row(
                    children: [
                      ChoiceChip(
                        label: Text('All Apps (${allUsages.length})'),
                        selected: !_showOnlyBlocked,
                        selectedColor: AppColors.primary.withOpacity(0.18),
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
                              color: _showOnlyBlocked ? Colors.white : AppColors.critical,
                            ),
                            const SizedBox(width: 4),
                            Text('Blocked ($blockedCount)'),
                          ],
                        ),
                        selected: _showOnlyBlocked,
                        selectedColor: AppColors.critical,
                        labelStyle: TextStyle(
                          color: _showOnlyBlocked ? Colors.white : AppColors.critical,
                          fontWeight: FontWeight.bold,
                        ),
                        onSelected: (val) {
                          if (val) setState(() => _showOnlyBlocked = true);
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (displayedUsages.isEmpty)
                    Card(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          children: [
                            if (usageProvider.error != null) ...[
                              Text(
                                'Error fetching usage: ${usageProvider.error}',
                                textAlign: TextAlign.center,
                                style: const TextStyle(color: AppColors.critical, fontSize: 13),
                              ),
                              const SizedBox(height: 8),
                            ],
                            Icon(
                              _showOnlyBlocked ? Icons.verified_user_rounded : Icons.hourglass_empty_rounded,
                              size: 40,
                              color: _showOnlyBlocked ? AppColors.success : Colors.grey,
                            ),
                            const SizedBox(height: 10),
                            Text(
                              _showOnlyBlocked
                                  ? 'No Blocked Applications'
                                  : 'No Application Usage Data Logged Today',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _showOnlyBlocked
                                  ? 'No applications are currently restricted for this child. To restrict an app, switch to the "All Apps" tab and tap "Block".'
                                  : 'No application usage has been recorded today yet.\nEnsure the child device has granted App Usage Access in Android Settings.',
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 12, color: Colors.grey),
                            ),
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
                        final usage = displayedUsages[index];
                        final isBlocked = usage.isBlocked;
                        final resolvedName = AppNameResolver.resolve(usage.packageName, usage.appName);

                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: isBlocked
                                ? BorderSide(color: AppColors.critical.withOpacity(0.4), width: 1)
                                : BorderSide.none,
                          ),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            child: Row(
                              children: [
                                AppIconWidget(
                                  packageName: usage.packageName,
                                  appName: resolvedName,
                                  size: 42,
                                  isBlocked: isBlocked,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Flexible(
                                            child: Text(
                                              resolvedName,
                                              style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 15,
                                                color: isBlocked ? AppColors.critical : null,
                                                decoration: isBlocked
                                                    ? TextDecoration.lineThrough
                                                    : null,
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          if (isBlocked) ...[
                                            const SizedBox(width: 6),
                                            Container(
                                              padding: const EdgeInsets.symmetric(
                                                  horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: AppColors.critical,
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: const Text(
                                                'BLOCKED',
                                                style: TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        usage.packageName,
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: Colors.grey.shade600,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      DateFormatter.formatMinutesToDuration(usage.usageDuration),
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                        color: isBlocked ? AppColors.critical : AppColors.primary,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    InkWell(
                                      borderRadius: BorderRadius.circular(8),
                                      onTap: () => _showBlockDialog(
                                        context,
                                        usageProvider,
                                        usage,
                                        !isBlocked,
                                      ),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: isBlocked
                                              ? Colors.green.shade50
                                              : Colors.red.shade50,
                                          borderRadius: BorderRadius.circular(8),
                                          border: Border.all(
                                            color: isBlocked
                                                ? AppColors.success
                                                : AppColors.critical,
                                            width: 1,
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              isBlocked ? Icons.lock_open : Icons.block,
                                              size: 13,
                                              color: isBlocked
                                                  ? AppColors.success
                                                  : AppColors.critical,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              isBlocked ? 'Unblock' : 'Block',
                                              style: TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.bold,
                                                color: isBlocked
                                                    ? AppColors.success
                                                    : AppColors.critical,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
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
