class UserModel {
  final String id;
  final String tenantId;
  final String role; // parent, child, admin
  final String name;
  final String email;
  final String? avatar;
  final bool isActive;

  UserModel({
    required this.id,
    required this.tenantId,
    required this.role,
    required this.name,
    required this.email,
    this.avatar,
    this.isActive = true,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      tenantId: json['tenantId'] is Map ? json['tenantId']['_id'] : (json['tenantId'] ?? ''),
      role: json['role'] ?? 'parent',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      avatar: json['avatar'],
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'tenantId': tenantId,
        'role': role,
        'name': name,
        'email': email,
        'avatar': avatar,
        'isActive': isActive,
      };

  bool get isParent => role == 'parent';
  bool get isChild => role == 'child';
}
