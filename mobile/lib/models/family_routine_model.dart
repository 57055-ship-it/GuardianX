class FamilyRoutineModel {
  final String id;
  final String childId;
  final String title;
  final String type; // prayer_reminder, hadith_session
  final String scheduledTime; // HH:mm
  final int duration;
  final bool isActive;
  final bool isCompletedToday;

  FamilyRoutineModel({
    required this.id,
    required this.childId,
    required this.title,
    required this.type,
    required this.scheduledTime,
    required this.duration,
    required this.isActive,
    this.isCompletedToday = false,
  });

  factory FamilyRoutineModel.fromJson(Map<String, dynamic> json) {
    return FamilyRoutineModel(
      id: json['_id'] ?? json['id'] ?? '',
      childId: json['childId'] ?? '',
      title: json['title'] ?? '',
      type: json['type'] ?? 'prayer_reminder',
      scheduledTime: json['scheduledTime'] ?? '05:00',
      duration: json['duration'] ?? 15,
      isActive: json['isActive'] ?? true,
      isCompletedToday: json['isCompletedToday'] ?? false,
    );
  }
}
