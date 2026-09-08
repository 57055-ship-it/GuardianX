import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../providers/geofence_provider.dart';
import '../../shared/widgets/custom_text_field.dart';
import '../../shared/widgets/empty_state_view.dart';

class GeofenceManagementScreen extends StatefulWidget {
  final String childId;

  const GeofenceManagementScreen({super.key, required this.childId});

  @override
  State<GeofenceManagementScreen> createState() => _GeofenceManagementScreenState();
}

class _GeofenceManagementScreenState extends State<GeofenceManagementScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<GeofenceProvider>(context, listen: false).fetchGeofences(widget.childId);
    });
  }

  void _showAddGeofenceDialog() {
    final nameController = TextEditingController();
    final radiusController = TextEditingController(text: '200');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Safe Zone'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CustomTextField(
              controller: nameController,
              label: 'Safe Zone Name',
              hint: 'e.g. Home, School, Tuition',
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: radiusController,
              label: 'Radius (Meters)',
              hint: '200',
              keyboardType: TextInputType.number,
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
              if (nameController.text.isEmpty) return;
              final geofenceProvider = Provider.of<GeofenceProvider>(context, listen: false);
              final success = await geofenceProvider.createGeofence(
                childId: widget.childId,
                name: nameController.text.trim(),
                latitude: 31.5204,
                longitude: 74.3587,
                radius: double.tryParse(radiusController.text) ?? 200,
              );
              if (success && context.mounted) {
                Navigator.of(context).pop();
              }
            },
            child: const Text('Save Safe Zone'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final geofenceProvider = Provider.of<GeofenceProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Safe Zone Geofences'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _showAddGeofenceDialog,
          ),
        ],
      ),
      body: geofenceProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : geofenceProvider.geofences.isEmpty
              ? EmptyStateView(
                  title: 'No Safe Zones Configured',
                  message: 'Create safe zone geofences like Home or School to receive enter/exit alerts.',
                  icon: Icons.shield_moon_outlined,
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: geofenceProvider.geofences.length,
                  itemBuilder: (context, index) {
                    final gf = geofenceProvider.geofences[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.secondary.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.home_outlined, color: AppColors.secondary),
                        ),
                        title: Text(
                          gf.name,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text('Radius: ${gf.radius.toInt()}m | Active'),
                        trailing: const Icon(Icons.check_circle, color: AppColors.success),
                      ),
                    );
                  },
                ),
    );
  }
}
