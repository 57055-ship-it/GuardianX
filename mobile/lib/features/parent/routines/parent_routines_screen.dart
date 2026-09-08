import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../providers/routine_provider.dart';
import '../../shared/widgets/custom_text_field.dart';
import '../../shared/widgets/empty_state_view.dart';

class ParentRoutinesScreen extends StatefulWidget {
  final String childId;

  const ParentRoutinesScreen({super.key, required this.childId});

  @override
  State<ParentRoutinesScreen> createState() => _ParentRoutinesScreenState();
}

class _ParentRoutinesScreenState extends State<ParentRoutinesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<RoutineProvider>(context, listen: false).fetchRoutines(childId: widget.childId);
    });
  }

  void _showAddRoutineDialog() {
    final titleController = TextEditingController();
    final timeController = TextEditingController(text: '05:30');
    String selectedType = 'prayer_reminder';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add Family Routine'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CustomTextField(
                controller: titleController,
                label: 'Routine Title',
                hint: 'e.g. Fajr Prayer, Daily Hadith',
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: selectedType,
                decoration: const InputDecoration(labelText: 'Routine Type'),
                items: const [
                  DropdownMenuItem(
                    value: 'prayer_reminder',
                    child: Text('Prayer Reminder'),
                  ),
                  DropdownMenuItem(
                    value: 'hadith_session',
                    child: Text('Hadith Session'),
                  ),
                ],
                onChanged: (val) {
                  if (val != null) setDialogState(() => selectedType = val);
                },
              ),
              const SizedBox(height: 12),
              CustomTextField(
                controller: timeController,
                label: 'Scheduled Time (HH:mm)',
                hint: '05:30',
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (titleController.text.isEmpty) return;
                final routineProv = Provider.of<RoutineProvider>(context, listen: false);
                final success = await routineProv.createRoutine(
                  childId: widget.childId,
                  title: titleController.text.trim(),
                  type: selectedType,
                  scheduledTime: timeController.text.trim(),
                );
                if (success && context.mounted) {
                  Navigator.of(context).pop();
                }
              },
              child: const Text('Save Routine'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final routineProvider = Provider.of<RoutineProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Family Routines & Prayers'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _showAddRoutineDialog,
          ),
        ],
      ),
      body: routineProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : routineProvider.routines.isEmpty
              ? EmptyStateView(
                  title: 'No Routines Configured',
                  message: 'Setup prayer reminders (Fajr, Dhuhr, Asr, Maghrib, Isha) or Hadith sessions for your child.',
                  icon: Icons.mosque_outlined,
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: routineProvider.routines.length,
                  itemBuilder: (context, index) {
                    final routine = routineProvider.routines[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            routine.type == 'prayer_reminder'
                                ? Icons.mosque
                                : Icons.menu_book,
                            color: AppColors.primary,
                          ),
                        ),
                        title: Text(
                          routine.title,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text('Time: ${routine.scheduledTime} | Duration: ${routine.duration} mins'),
                        trailing: Icon(
                          routine.isCompletedToday ? Icons.check_circle : Icons.radio_button_unchecked,
                          color: routine.isCompletedToday ? AppColors.success : Colors.grey,
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
