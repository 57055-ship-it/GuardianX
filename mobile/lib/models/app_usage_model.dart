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
      id: json['_id'] ?? json['id'] ?? '',
      packageName: json['packageName'] ?? '',
      appName: json['appName'] ?? '',
      usageDuration: json['usageDuration'] ?? 0,
      sessionCount: json['sessionCount'] ?? 1,
      date: json['date'] ?? '',
    );
  }
}
