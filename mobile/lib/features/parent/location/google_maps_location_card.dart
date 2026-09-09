import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../models/location_model.dart';
import '../../shared/widgets/status_badge.dart';

class GoogleMapsLocationCard extends StatefulWidget {
  final LocationModel? location;
  final String childName;
  final double mapHeight;

  const GoogleMapsLocationCard({
    super.key,
    required this.location,
    this.childName = 'Child',
    this.mapHeight = 220.0,
  });

  @override
  State<GoogleMapsLocationCard> createState() => _GoogleMapsLocationCardState();
}

class _GoogleMapsLocationCardState extends State<GoogleMapsLocationCard> {
  String? _address;
  bool _isLoadingAddress = false;
  double? _lastLat;
  double? _lastLng;
  final MapController _mapController = MapController();

  @override
  void initState() {
    super.initState();
    _fetchAddressIfNeeded();
  }

  @override
  void didUpdateWidget(covariant GoogleMapsLocationCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    _fetchAddressIfNeeded();
    if (widget.location != null &&
        (widget.location!.latitude != oldWidget.location?.latitude ||
            widget.location!.longitude != oldWidget.location?.longitude)) {
      try {
        _mapController.move(
          LatLng(widget.location!.latitude, widget.location!.longitude),
          15.0,
        );
      } catch (_) {}
    }
  }

  Future<void> _fetchAddressIfNeeded() async {
    final loc = widget.location;
    if (loc == null) return;
    if (loc.latitude == _lastLat && loc.longitude == _lastLng && _address != null) return;

    _lastLat = loc.latitude;
    _lastLng = loc.longitude;

    setState(() {
      _isLoadingAddress = true;
    });

    try {
      final url = Uri.parse(
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}&zoom=18&addressdetails=1',
      );
      final response = await http.get(url, headers: {'User-Agent': 'GuardianX-ParentApp/1.0'});
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final displayName = data['display_name'] as String?;
        if (mounted && displayName != null && displayName.isNotEmpty) {
          setState(() {
            _address = displayName;
          });
        }
      }
    } catch (e) {
      debugPrint('[GoogleMapsLocationCard] Address geocode error: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingAddress = false;
        });
      }
    }
  }

  Future<void> _openGoogleMaps() async {
    final loc = widget.location;
    if (loc == null) return;

    final googleMapsUrl = Uri.parse(
      'https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}',
    );

    try {
      final canLaunch = await canLaunchUrl(googleMapsUrl);
      if (canLaunch) {
        await launchUrl(googleMapsUrl, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(googleMapsUrl, mode: LaunchMode.platformDefault);
      }
    } catch (e) {
      debugPrint('[GoogleMapsLocationCard] Error opening Google Maps: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not launch Google Maps: http://maps.google.com/?q=${loc.latitude},${loc.longitude}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final loc = widget.location;

    if (loc == null) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children: [
              Icon(Icons.location_off, size: 40, color: Colors.grey.shade400),
              const SizedBox(height: 10),
              const Text(
                'No Location Telemetry Received',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 4),
              const Text(
                'Child device has not transmitted satellite GPS coordinates yet.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
        ),
      );
    }

    final targetLatLng = LatLng(loc.latitude, loc.longitude);

    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.primary.withOpacity(0.2), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.map, color: Colors.white, size: 18),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Live Map & Google Maps Location',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: Colors.red.shade900,
                        ),
                      ),
                      Text(
                        '${widget.childName}\'s Device Position',
                        style: TextStyle(fontSize: 11, color: Colors.red.shade700),
                      ),
                    ],
                  ),
                ),
                StatusBadge(
                  label: loc.isStale ? 'Stale' : 'Live',
                  isSuccess: !loc.isStale,
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Real Address Name Banner
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.location_on, color: Colors.red, size: 22),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Current Address / Location:',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey,
                            ),
                          ),
                          const SizedBox(height: 2),
                          if (_isLoadingAddress)
                            const Row(
                              children: [
                                SizedBox(
                                  width: 12,
                                  height: 12,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                ),
                                SizedBox(width: 8),
                                Text(
                                  'Resolving street address...',
                                  style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Colors.grey),
                                ),
                              ],
                            )
                          else
                            Text(
                              _address ?? 'Location coordinates captured',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Colors.black87,
                                height: 1.3,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Interactive Visual Map Box
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    height: widget.mapHeight,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Stack(
                      children: [
                        FlutterMap(
                          mapController: _mapController,
                          options: MapOptions(
                            initialCenter: targetLatLng,
                            initialZoom: 15.0,
                            maxZoom: 18.0,
                            minZoom: 3.0,
                          ),
                          children: [
                            TileLayer(
                              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                              userAgentPackageName: 'com.guardianx.app',
                            ),
                            MarkerLayer(
                              markers: [
                                Marker(
                                  point: targetLatLng,
                                  width: 50,
                                  height: 50,
                                  child: GestureDetector(
                                    onTap: _openGoogleMaps,
                                    child: Tooltip(
                                      message: '${widget.childName} is here\nTap to open in Google Maps',
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.all(8),
                                            decoration: BoxDecoration(
                                              color: Colors.red,
                                              shape: BoxShape.circle,
                                              boxShadow: [
                                                BoxShadow(
                                                  color: Colors.red.withOpacity(0.5),
                                                  blurRadius: 10,
                                                  spreadRadius: 3,
                                                ),
                                              ],
                                              border: Border.all(color: Colors.white, width: 2),
                                            ),
                                            child: const Icon(
                                              Icons.child_care,
                                              color: Colors.white,
                                              size: 20,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),

                        // Map Control Floating Button
                        Positioned(
                          right: 8,
                          bottom: 8,
                          child: FloatingActionButton.small(
                            heroTag: 'recenter_map_${loc.latitude}',
                            backgroundColor: Colors.white,
                            foregroundColor: Colors.black87,
                            onPressed: () {
                              _mapController.move(targetLatLng, 15.0);
                            },
                            child: const Icon(Icons.my_location, size: 18),
                          ),
                        ),

                        // Interactive Hint Badge Overlay
                        Positioned(
                          left: 8,
                          top: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.7),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.touch_app, color: Colors.white, size: 12),
                                SizedBox(width: 4),
                                Text(
                                  'Live Visual Map',
                                  style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 14),

                // Coordinates & Accuracy Row
                Wrap(
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 12,
                  runSpacing: 6,
                  children: [
                    Text(
                      'Lat: ${loc.latitude.toStringAsFixed(5)}, Lng: ${loc.longitude.toStringAsFixed(5)}',
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                    Text(
                      'Accuracy ±${loc.accuracy.toStringAsFixed(1)}m • ${DateFormatter.formatTime(loc.timestamp)}',
                      style: const TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Open in Google Maps Target Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _openGoogleMaps,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red.shade600,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 2,
                    ),
                    icon: const Icon(Icons.open_in_new, size: 18),
                    label: const Text(
                      'OPEN IN GOOGLE MAPS APP',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
