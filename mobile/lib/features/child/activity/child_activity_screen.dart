import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/usage_provider.dart';

class ChildActivityScreen extends StatefulWidget {
  const ChildActivityScreen({super.key});

  @override
  State<ChildActivityScreen> createState() => _ChildActivityScreenState();
}

class _ChildActivityScreenState extends State<ChildActivityScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final childId = Provider.of<AuthProvider>(context, listen: false).currentUser?.id;
      if (childId != null) {
        Provider.of<UsageProvider>(context, listen: false).fetchChildUsage(childId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final usageProvider = Provider.of<UsageProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('My Daily Activity')),
      body: usageProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
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
                            'Daily Limit: 3 Hours',
                            style: TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text('My App Usage', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: usageProvider.appUsages.length,
                    itemBuilder: (context, index) {
                      final item = usageProvider.appUsages[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: const Icon(Icons.apps, color: AppColors.secondary),
                          title: Text(item.appName, style: const TextStyle(fontWeight: FontWeight.bold)),
                          trailing: Text(
                            DateFormatter.formatMinutesToDuration(item.usageDuration),
                            style: const TextStyle(fontWeight: FontWeight.bold),
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
