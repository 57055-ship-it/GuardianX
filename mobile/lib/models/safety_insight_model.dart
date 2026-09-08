class SafetyInsightModel {
  final String type;
  final String severity; // critical, high, medium, info
  final String title;
  final String rationale;

  SafetyInsightModel({
    required this.type,
    required this.severity,
    required this.title,
    required this.rationale,
  });

  factory SafetyInsightModel.fromJson(Map<String, dynamic> json) {
    return SafetyInsightModel(
      type: json['type'] ?? 'normal_status',
      severity: json['severity'] ?? 'info',
      title: json['title'] ?? 'Safety Insight',
      rationale: json['rationale'] ?? '',
    );
  }
}
