import 'package:flutter/material.dart';
import '../repositories/sos_repository.dart';

class SOSProvider with ChangeNotifier {
  final SOSRepository _sosRepository;

  bool _isTransmitting = false;
  String? _statusMessage;
  String? _error;

  SOSProvider(this._sosRepository);

  bool get isTransmitting => _isTransmitting;
  String? get statusMessage => _statusMessage;
  String? get error => _error;

  Future<bool> triggerSOS({
    required double latitude,
    required double longitude,
    String? childId,
  }) async {
    _isTransmitting = true;
    _statusMessage = null;
    _error = null;
    notifyListeners();

    try {
      final res = await _sosRepository.triggerSOS(
        latitude: latitude,
        longitude: longitude,
        childId: childId,
      );
      _statusMessage = res['message'];
      _isTransmitting = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isTransmitting = false;
      notifyListeners();
      return false;
    }
  }
}
