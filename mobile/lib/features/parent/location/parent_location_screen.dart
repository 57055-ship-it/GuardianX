import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/child_provider.dart';
import '../../../providers/location_provider.dart';
import '../geofences/geofence_management_screen.dart';
import 'google_maps_location_card.dart';

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
    final childProvider = Provider.of<ChildProvider>(context);
    
    String childName = 'Child';
    if (childProvider.children.isNotEmpty) {
      final matches = childProvider.children.where((c) => c.id == widget.childId);
      if (matches.isNotEmpty) {
        childName = matches.first.name;
      } else if (childProvider.selectedChild != null) {
        childName = childProvider.selectedChild!.name;
      }
    }

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
                  // Google Maps Telemetry & Address Card
                  GoogleMapsLocationCard(
                    location: loc,
                    childName: childName,
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
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  DateFormatter.formatShortDateTime(item.timestamp),
                                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                                ),
                                const SizedBox(width: 4),
                                IconButton(
                                  icon: const Icon(Icons.map_outlined, size: 20, color: Colors.red),
                                  tooltip: 'Open in Google Maps',
                                  onPressed: () async {
                                    final url = Uri.parse(
                                      'https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}',
                                    );
                                    try {
                                      if (await canLaunchUrl(url)) {
                                        await launchUrl(url, mode: LaunchMode.externalApplication);
                                      } else {
                                        await launchUrl(url, mode: LaunchMode.platformDefault);
                                      }
                                    } catch (e) {
                                      debugPrint('Error launching maps: $e');
                                    }
                                  },
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

