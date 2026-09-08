class DeviceModel {
  final String id;
  final String tenantId;
  final String childId;
  final String deviceName;
  final String platform;
  final String deviceIdentifier;
  final int batteryLevel;
  final bool isOnline;
  final DateTime? lastSeen;

  DeviceModel({
    required this.id,
    required this.tenantId,
    required this.childId,
    required this.deviceName,
    required this.platform,
    required this.deviceIdentifier,
    required this.batteryLevel,
    required this.isOnline,
    this.lastSeen,
  });

  factory DeviceModel.fromJson(Map<String, dynamic> json) {
    return DeviceModel(
      id: json['_id'] ?? json['id'] ?? '',
      tenantId: json['tenantId'] is Map ? json['tenantId']['_id'] : (json['tenantId'] ?? ''),
      childId: json['childId'] ?? '',
      deviceName: json['deviceName'] ?? 'Child Phone',
      platform: json['platform'] ?? 'android',
      deviceIdentifier: json['deviceIdentifier'] ?? '',
      batteryLevel: json['batteryLevel'] ?? 100,
      isOnline: json['isOnline'] ?? true,
      lastSeen: json['lastSeen'] != null ? DateTime.tryParse(json['lastSeen']) : null,
    );
  }
}
