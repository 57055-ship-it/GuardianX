class LocationModel {
  final String id;
  final String childId;
  final double latitude;
  final double longitude;
  final double accuracy;
  final double speed;
  final double altitude;
  final double heading;
  final DateTime timestamp;

  LocationModel({
    required this.id,
    required this.childId,
    required this.latitude,
    required this.longitude,
    required this.accuracy,
    this.speed = 0.0,
    this.altitude = 0.0,
    this.heading = 0.0,
    required this.timestamp,
  });

  bool get isStale => DateTime.now().difference(timestamp).inMinutes >= 5;

  factory LocationModel.fromJson(Map<String, dynamic> json) {
    return LocationModel(
      id: json['_id'] ?? json['id'] ?? '',
      childId: json['childId'] ?? '',
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      accuracy: (json['accuracy'] as num?)?.toDouble() ?? 0.0,
      speed: (json['speed'] as num?)?.toDouble() ?? 0.0,
      altitude: (json['altitude'] as num?)?.toDouble() ?? 0.0,
      heading: (json['heading'] as num?)?.toDouble() ?? 0.0,
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
    );
  }
}
