import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../providers/child_provider.dart';
import '../../shared/widgets/empty_state_view.dart';
import '../../shared/widgets/status_badge.dart';
import 'add_child_modal.dart';
import 'pairing_code_modal.dart';

class ChildrenListScreen extends StatelessWidget {
  const ChildrenListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final childProvider = Provider.of<ChildProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Children & Paired Devices'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                shape: const RoundedRectangleBorder(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                builder: (_) => const AddChildModal(),
              );
            },
          ),
        ],
      ),
      body: childProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : childProvider.children.isEmpty
              ? EmptyStateView(
                  title: 'No Children Added Yet',
                  message: 'Tap the + icon in the app bar to create a child profile for your family.',
                  icon: Icons.child_care,
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: childProvider.children.length,
                  itemBuilder: (context, index) {
                    final child = childProvider.children[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
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
                                      backgroundColor: AppColors.primary.withOpacity(0.2),
                                      child: Text(
                                        child.name[0].toUpperCase(),
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Text(
                                      child.name,
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                                StatusBadge(
                                  label: child.isPaired ? 'Paired' : 'Unpaired',
                                  isSuccess: child.isPaired,
                                ),
                              ],
                            ),
                            const Divider(height: 24),
                            Text(
                              'Device: ${child.device?.deviceName ?? "No device linked"}',
                              style: const TextStyle(fontSize: 13, color: Colors.grey),
                            ),
                            if (child.device != null) ...[
                              const SizedBox(height: 4),
                              Text(
                                'Platform: ${child.device!.platform.toUpperCase()} | Battery: ${child.device!.batteryLevel}%',
                                style: const TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ],
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                OutlinedButton.icon(
                                  onPressed: () {
                                    showModalBottomSheet(
                                      context: context,
                                      shape: const RoundedRectangleBorder(
                                        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                                      ),
                                      builder: (_) => PairingCodeModal(
                                        childId: child.id,
                                        childName: child.name,
                                      ),
                                    );
                                  },
                                  icon: const Icon(Icons.qr_code, size: 18),
                                  label: const Text('Generate Pairing Code'),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
