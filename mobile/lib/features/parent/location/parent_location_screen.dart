import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/location_provider.dart';
import '../../shared/widgets/status_badge.dart';
import '../geofences/geofence_management_screen.dart';

class ParentLocationScreen extends StatefulWidget {
  final String childId;

  const ParentLocationScreen({super.key, required this.childId});

  @override
  State<ParentLocationScreen> createState() => _ParentLocationScreenState();
}

class _ParentLocationScreenState extends State<ParentLocationScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchData();
    });
  }

  void _fetchData() {
    final locProv = Provider.of<LocationProvider>(context, listen: false);
    locProv.fetchLatestLocation(widget.childId);
    locProv.fetchLocationHistory(widget.childId);
  }

  @override
  Widget build(BuildContext context) {
    final locationProvider = Provider.of<LocationProvider>(context);
    final loc = locationProvider.latestLocation;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Child Live Location & History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Location',
            onPressed: _fetchData,
          ),
          IconButton(
            icon: const Icon(Icons.shield_moon_outlined),
            tooltip: 'Safe Zones',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => GeofenceManagementScreen(childId: widget.childId),
                ),
              );
            },
          ),
        ],
      ),
      body: locationProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Real GPS Telemetry Display Container
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: loc != null && !loc.isStale
                                ? AppColors.secondary.withOpacity(0.2)
                                : AppColors.critical.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.my_location,
                            color: loc != null && !loc.isStale
                                ? AppColors.secondary
                                : AppColors.critical,
                            size: 36,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          loc != null
                              ? 'Lat: ${loc.latitude.toStringAsFixed(5)}, Lng: ${loc.longitude.toStringAsFixed(5)}'
                              : 'No Location Fix Recorded Yet',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        if (loc != null) ...[
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Accuracy: ±${loc.accuracy.toStringAsFixed(1)}m',
                                style: const TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                              const SizedBox(width: 12),
                              StatusBadge(
                                label: loc.isStale ? 'Stale Location' : 'Live Fix',
                                isSuccess: !loc.isStale,
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Updated: ${DateFormatter.formatShortDateTime(loc.timestamp)}',
                            style: const TextStyle(fontSize: 11, color: Colors.grey),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  const Text(
                    'Location History Timeline',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  if (locationProvider.history.isEmpty)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(16.0),
                        child: Text('No location history recorded yet for this child.'),
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: locationProvider.history.length,
                      itemBuilder: (context, index) {
                        final item = locationProvider.history[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: const Icon(Icons.location_on_outlined, color: AppColors.primary),
                            title: Text(
                              'Position (${item.latitude.toStringAsFixed(4)}, ${item.longitude.toStringAsFixed(4)})',
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                            ),
                            subtitle: Text('Accuracy: ±${item.accuracy.toStringAsFixed(1)}m'),
                            trailing: Text(
                              DateFormatter.formatShortDateTime(item.timestamp),
                              style: const TextStyle(fontSize: 11, color: Colors.grey),
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
