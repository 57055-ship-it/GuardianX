class GeofenceModel {
  final String id;
  final String childId;
  final String name;
  final double latitude;
  final double longitude;
  final double radius;
  final bool isActive;

  GeofenceModel({
    required this.id,
    required this.childId,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.radius,
    required this.isActive,
  });

  factory GeofenceModel.fromJson(Map<String, dynamic> json) {
    return GeofenceModel(
      id: json['_id'] ?? json['id'] ?? '',
      childId: json['childId'] ?? '',
      name: json['name'] ?? '',
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      radius: (json['radius'] as num).toDouble(),
      isActive: json['isActive'] ?? true,
    );
  }
}
