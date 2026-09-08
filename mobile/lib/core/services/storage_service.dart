import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _tokenKey = 'jwt_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userRoleKey = 'user_role';
  static const String _userIdKey = 'user_id';
  static const String _userNameKey = 'user_name';
  static const String _tenantIdKey = 'tenant_id';
  static const String _childIdKey = 'child_id';

  final SharedPreferences _prefs;

  StorageService(this._prefs);

  static Future<StorageService> init() async {
    final prefs = await SharedPreferences.getInstance();
    return StorageService(prefs);
  }

  Future<void> saveAuthData({
    required String accessToken,
    required String refreshToken,
    required String role,
    required String userId,
    required String userName,
    required String tenantId,
    String? childId,
  }) async {
    await _prefs.setString(_tokenKey, accessToken);
    await _prefs.setString(_refreshTokenKey, refreshToken);
    await _prefs.setString(_userRoleKey, role);
    await _prefs.setString(_userIdKey, userId);
    await _prefs.setString(_userNameKey, userName);
    await _prefs.setString(_tenantIdKey, tenantId);
    if (childId != null) {
      await _prefs.setString(_childIdKey, childId);
    }
  }

  String? get token => _prefs.getString(_tokenKey);
  String? get refreshToken => _prefs.getString(_refreshTokenKey);
  String? get role => _prefs.getString(_userRoleKey);
  String? get userId => _prefs.getString(_userIdKey);
  String? get userName => _prefs.getString(_userNameKey);
  String? get tenantId => _prefs.getString(_tenantIdKey);
  String? get childId => _prefs.getString(_childIdKey);

  Future<void> clearAuthData() async {
    await _prefs.remove(_tokenKey);
    await _prefs.remove(_refreshTokenKey);
    await _prefs.remove(_userRoleKey);
    await _prefs.remove(_userIdKey);
    await _prefs.remove(_userNameKey);
    await _prefs.remove(_tenantIdKey);
    await _prefs.remove(_childIdKey);
  }

  bool get isAuthenticated => token != null && token!.isNotEmpty;
}
