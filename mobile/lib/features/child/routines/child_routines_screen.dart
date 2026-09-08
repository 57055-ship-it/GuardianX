import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/routine_provider.dart';
import '../../shared/widgets/empty_state_view.dart';
import 'hadith_session_modal.dart';

class ChildRoutinesScreen extends StatefulWidget {
  const ChildRoutinesScreen({super.key});

  @override
  State<ChildRoutinesScreen> createState() => _ChildRoutinesScreenState();
}

class _ChildRoutinesScreenState extends State<ChildRoutinesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final childId = Provider.of<AuthProvider>(context, listen: false).currentUser?.id;
      final routineProv = Provider.of<RoutineProvider>(context, listen: false);
      routineProv.fetchRoutines(childId: childId);
      routineProv.fetchTodayHadith();
    });
  }

  @override
  Widget build(BuildContext context) {
    final routineProvider = Provider.of<RoutineProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('My Family Routines & Prayers')),
      body: routineProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (routineProvider.todayHadith != null) ...[
                    Card(
                      color: AppColors.secondary.withOpacity(0.12),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  "Today's Hadith Session",
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                                const Icon(Icons.star, color: Colors.amber),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              routineProvider.todayHadith!.title,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(backgroundColor: AppColors.secondary),
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
                              icon: const Icon(Icons.play_arrow),
                              label: const Text('Start Hadith Recitation'),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  const Text('Scheduled Routines', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  if (routineProvider.routines.isEmpty)
                    const EmptyStateView(
                      title: 'No Routines Scheduled',
                      message: 'Your parents have not scheduled any routines for today yet.',
                      icon: Icons.mosque_outlined,
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: routineProvider.routines.length,
                      itemBuilder: (context, index) {
                        final item = routineProvider.routines[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: Icon(
                              item.type == 'prayer_reminder' ? Icons.mosque : Icons.menu_book,
                              color: AppColors.secondary,
                            ),
                            title: Text(item.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('Scheduled: ${item.scheduledTime}'),
                            trailing: item.isCompletedToday
                                ? const Icon(Icons.check_circle, color: AppColors.success)
                                : OutlinedButton(
                                    onPressed: () {
                                      routineProvider.completeRoutine(
                                        item.id,
                                        childId: authProvider.currentUser?.id,
                                      );
                                    },
                                    child: const Text('Check In'),
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
