class AppUsageModel {
  final String id;
  final String packageName;
  final String appName;
  final int usageDuration; // in minutes
  final int sessionCount;
  final String date;
  final bool isBlocked;

  AppUsageModel({
    required this.id,
    required this.packageName,
    required this.appName,
    required this.usageDuration,
    required this.sessionCount,
    required this.date,
    this.isBlocked = false,
  });

  AppUsageModel copyWith({
    String? id,
    String? packageName,
    String? appName,
    int? usageDuration,
    int? sessionCount,
    String? date,
    bool? isBlocked,
  }) {
    return AppUsageModel(
      id: id ?? this.id,
      packageName: packageName ?? this.packageName,
      appName: appName ?? this.appName,
      usageDuration: usageDuration ?? this.usageDuration,
      sessionCount: sessionCount ?? this.sessionCount,
      date: date ?? this.date,
      isBlocked: isBlocked ?? this.isBlocked,
    );
  }

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
      isBlocked: json['isBlocked'] == true || json['isBlocked'] == 'true',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'packageName': packageName,
        'appName': appName,
        'usageDuration': usageDuration,
        'sessionCount': sessionCount,
        'date': date,
        'isBlocked': isBlocked,
      };
}
