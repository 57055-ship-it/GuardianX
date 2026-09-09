import 'package:flutter/material.dart';
import '../repositories/pairing_repository.dart';

class PairingProvider with ChangeNotifier {
  final PairingRepository _pairingRepository;

  bool _isLoading = false;
  String? _generatedCode;
  DateTime? _expiresAt;
  String? _error;

  PairingProvider(this._pairingRepository);

  bool get isLoading => _isLoading;
  String? get generatedCode => _generatedCode;
  DateTime? get expiresAt => _expiresAt;
  String? get error => _error;

  Future<bool> generateCode(String childId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _pairingRepository.createPairingCode(childId);
      _generatedCode = data['code'];
      _expiresAt = DateTime.tryParse(data['expiresAt'] ?? '');
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<Map<String, dynamic>?> joinCode({
    required String code,
    required String deviceName,
    required String deviceIdentifier,
    required String platform,
    int? batteryLevel,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _pairingRepository.joinPairingCode(
        code: code,
        deviceName: deviceName,
        deviceIdentifier: deviceIdentifier,
        platform: platform,
        batteryLevel: batteryLevel,
      );
      _isLoading = false;
      notifyListeners();
      return res;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }
}
