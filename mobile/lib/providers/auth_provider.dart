import 'package:flutter/material.dart';
import '../core/services/storage_service.dart';
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';

enum AuthStatus { uninitialized, authenticated, unauthenticated, loading }

class AuthProvider with ChangeNotifier {
  final AuthRepository _authRepository;
  final StorageService _storageService;

  AuthStatus _status = AuthStatus.uninitialized;
  UserModel? _currentUser;
  String? _errorMessage;

  AuthProvider(this._authRepository, this._storageService) {
    checkSession();
  }

  AuthStatus get status => _status;
  UserModel? get currentUser => _currentUser;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  String? get role => _currentUser?.role ?? _storageService.role;
  bool get isParent => role == 'parent';
  bool get isChild => role == 'child';

  Future<void> checkSession() async {
    _status = AuthStatus.loading;
    notifyListeners();

    if (_storageService.isAuthenticated) {
      try {
        _currentUser = await _authRepository.getProfile();
        _status = AuthStatus.authenticated;
      } catch (e) {
        // If session check fails, clear token
        await _storageService.clearAuthData();
        _status = AuthStatus.unauthenticated;
      }
    } else {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _status = AuthStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _authRepository.login(email, password);
      final tokens = res['tokens'];
      final userJson = res['user'];

      _currentUser = UserModel.fromJson(userJson);

      await _storageService.saveAuthData(
        accessToken: tokens['accessToken'],
        refreshToken: tokens['refreshToken'],
        role: _currentUser!.role,
        userId: _currentUser!.id,
        userName: _currentUser!.name,
        tenantId: _currentUser!.tenantId,
      );

      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    String? familyName,
  }) async {
    _status = AuthStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _authRepository.register(
        name: name,
        email: email,
        password: password,
        familyName: familyName,
      );

      final tokens = res['tokens'];
      final userJson = res['user'];

      _currentUser = UserModel.fromJson(userJson);

      await _storageService.saveAuthData(
        accessToken: tokens['accessToken'],
        refreshToken: tokens['refreshToken'],
        role: _currentUser!.role,
        userId: _currentUser!.id,
        userName: _currentUser!.name,
        tenantId: _currentUser!.tenantId,
      );

      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  Future<void> setChildSession({
    required String accessToken,
    required String refreshToken,
    required String childId,
    required String childName,
    required String tenantId,
  }) async {
    await _storageService.saveAuthData(
      accessToken: accessToken,
      refreshToken: refreshToken,
      role: 'child',
      userId: childId,
      userName: childName,
      tenantId: tenantId,
      childId: childId,
    );

    _currentUser = UserModel(
      id: childId,
      tenantId: tenantId,
      role: 'child',
      name: childName,
      email: 'child@guardianx.local',
    );

    _status = AuthStatus.authenticated;
    notifyListeners();
  }

  Future<void> logout() async {
    await _storageService.clearAuthData();
    _currentUser = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
