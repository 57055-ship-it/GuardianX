import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'storage_service.dart';

class BiometricService {
  final LocalAuthentication _auth = LocalAuthentication();
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  final StorageService _storageService;

  static const String _savedParentEmailKey = 'saved_parent_email';
  static const String _savedParentPassKey = 'saved_parent_password';

  BiometricService(this._storageService);

  /// Check if device hardware supports biometric authentication
  Future<bool> canCheckBiometrics() async {
    try {
      final bool canAuthenticateWithBiometrics = await _auth.canCheckBiometrics;
      final bool isDeviceSupported = await _auth.isDeviceSupported();
      return canAuthenticateWithBiometrics && isDeviceSupported;
    } on PlatformException catch (_) {
      return false;
    }
  }

  /// Get list of available biometric types (face, fingerprint, etc.)
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _auth.getAvailableBiometrics();
    } on PlatformException catch (_) {
      return <BiometricType>[];
    }
  }

  /// Check if parent has enabled Face ID / Fingerprint login in settings
  bool isBiometricEnabled() {
    return _storageService.token != null && 
           _storageService.token!.isNotEmpty &&
           (_storageService.role == 'parent');
  }

  /// Trigger Face ID / Touch ID / Fingerprint biometric authentication prompt
  Future<bool> authenticate({String? reason}) async {
    try {
      final bool isSupported = await canCheckBiometrics();
      if (!isSupported) return false;

      return await _auth.authenticate(
        localizedReason: reason ?? 'Authenticate with Face ID or Fingerprint to access GuardianX Parent Portal',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
          useErrorDialogs: true,
        ),
      );
    } on PlatformException catch (e) {
      debugPrint('[Biometric Auth Error] ${e.message}');
      return false;
    }
  }

  /// Store parent credentials securely for biometric login
  Future<void> saveParentCredentials(String email, String password) async {
    await _secureStorage.write(key: _savedParentEmailKey, value: email);
    await _secureStorage.write(key: _savedParentPassKey, value: password);
  }

  /// Retrieve stored parent email
  Future<String?> getSavedParentEmail() async {
    return await _secureStorage.read(key: _savedParentEmailKey);
  }

  /// Retrieve stored parent password
  Future<String?> getSavedParentPassword() async {
    return await _secureStorage.read(key: _savedParentPassKey);
  }

  /// Clear stored credentials
  Future<void> clearSavedCredentials() async {
    await _secureStorage.delete(key: _savedParentEmailKey);
    await _secureStorage.delete(key: _savedParentPassKey);
  }
}
