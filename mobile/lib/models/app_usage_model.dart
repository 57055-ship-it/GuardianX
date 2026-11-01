class AppUsageModel {
  final String id;
  final String packageName;
  final String appName;
  final int usageDuration; // in minutes
  final int sessionCount;
  final String date;

  AppUsageModel({
    required this.id,
    required this.packageName,
    required this.appName,
    required this.usageDuration,
    required this.sessionCount,
    required this.date,
  });

  factory AppUsageModel.fromJson(Map<String, dynamic> json) {
    return AppUsageModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      packageName: json['packageName'] ?? '',
      appName: json['appName'] ?? '',
      usageDuration: (json['usageDuration'] as num?)?.toInt() ??
          (json['durationMinutes'] as num?)?.toInt() ??
          int.tryParse(json['usageDuration']?.toString() ?? '') ??
          0,
      sessionCount: (json['sessionCount'] as num?)?.toInt() ??
          int.tryParse(json['sessionCount']?.toString() ?? '') ??
          1,
      date: json['date'] ?? '',
    );
  }
}
