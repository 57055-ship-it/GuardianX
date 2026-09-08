import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../providers/child_provider.dart';
import '../../../providers/report_provider.dart';
import '../../shared/widgets/empty_state_view.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final childProv = Provider.of<ChildProvider>(context, listen: false);
      if (childProv.selectedChild != null) {
        Provider.of<ReportProvider>(context, listen: false)
            .fetchReportsAndInsights(childProv.selectedChild!.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final childProvider = Provider.of<ChildProvider>(context);
    final reportProvider = Provider.of<ReportProvider>(context);
    final selectedChild = childProvider.selectedChild;

    return Scaffold(
      appBar: AppBar(title: const Text('Safety Reports & Insights')),
      body: selectedChild == null
          ? EmptyStateView(
              title: 'No Child Selected',
              message: 'Add or select a child profile to view safety reports.',
              icon: Icons.child_care,
            )
          : reportProvider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Safety Score Card
                      Card(
                        color: AppColors.secondary.withOpacity(0.12),
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "${selectedChild.name}'s Safety Index",
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  const Text(
                                    'Explainable Rule-Based Analytics',
                                    style: TextStyle(fontSize: 12, color: Colors.grey),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: AppColors.secondary,
                                  shape: BoxShape.circle,
                                ),
                                child: Text(
                                  '${reportProvider.calculatedSafetyScore}',
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Explainable Insights Section
                      const Text(
                        'Explainable Safety Insights',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Every safety metric includes transparent context and underlying rationale.',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                      const SizedBox(height: 12),
                      if (reportProvider.insights.isEmpty)
                        const Card(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Text('All safety indicators are within normal parameters.'),
                          ),
                        )
                      else
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: reportProvider.insights.length,
                          itemBuilder: (context, index) {
                            final insight = reportProvider.insights[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 10),
                              child: Padding(
                                padding: const EdgeInsets.all(14.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(
                                          insight.severity == 'critical'
                                              ? Icons.error
                                              : insight.severity == 'high'
                                                  ? Icons.warning
                                                  : Icons.info,
                                          color: insight.severity == 'critical'
                                              ? AppColors.critical
                                              : insight.severity == 'high'
                                                  ? AppColors.warning
                                                  : AppColors.info,
                                          size: 20,
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            insight.title,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 15,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      insight.rationale,
                                      style: const TextStyle(fontSize: 13),
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
    );
  }
}
