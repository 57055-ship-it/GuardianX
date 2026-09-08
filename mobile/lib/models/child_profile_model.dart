import 'device_model.dart';

class ChildProfileModel {
  final String id;
  final String tenantId;
  final String parentId;
  final String? userId;
  final String name;
  final DateTime? dateOfBirth;
  final String profileStatus; // unpaired, paired, disabled
  final DeviceModel? device;

  ChildProfileModel({
    required this.id,
    required this.tenantId,
    required this.parentId,
    this.userId,
    required this.name,
    this.dateOfBirth,
    required this.profileStatus,
    this.device,
  });

  factory ChildProfileModel.fromJson(Map<String, dynamic> json) {
    return ChildProfileModel(
      id: json['_id'] ?? json['id'] ?? '',
      tenantId: json['tenantId'] is Map ? json['tenantId']['_id'] : (json['tenantId'] ?? ''),
      parentId: json['parentId'] ?? '',
      userId: json['userId'],
      name: json['name'] ?? '',
      dateOfBirth: json['dateOfBirth'] != null ? DateTime.tryParse(json['dateOfBirth']) : null,
      profileStatus: json['profileStatus'] ?? 'unpaired',
      device: json['deviceId'] is Map
          ? DeviceModel.fromJson(json['deviceId'])
          : null,
    );
  }

  bool get isPaired => profileStatus == 'paired';
}
