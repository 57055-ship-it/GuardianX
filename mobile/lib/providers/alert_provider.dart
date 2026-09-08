import 'package:flutter/material.dart';
import '../models/alert_model.dart';
import '../repositories/alert_repository.dart';

class AlertProvider with ChangeNotifier {
  final AlertRepository _alertRepository;

  List<AlertModel> _alerts = [];
  int _unreadCount = 0;
  bool _isLoading = false;
  String? _error;

  AlertProvider(this._alertRepository);

  List<AlertModel> get alerts => _alerts;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchAlerts({String? childId}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _alertRepository.getAlerts(childId: childId);
      _alerts = data['alerts'];
      _unreadCount = data['unreadCount'];
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAsRead(String alertId) async {
    try {
      await _alertRepository.markAsRead(alertId);
      final index = _alerts.indexWhere((a) => a.id == alertId);
      if (index != -1) {
        _alerts[index] = AlertModel(
          id: _alerts[index].id,
          childId: _alerts[index].childId,
          type: _alerts[index].type,
          title: _alerts[index].title,
          message: _alerts[index].message,
          severity: _alerts[index].severity,
          isRead: true,
          createdAt: _alerts[index].createdAt,
        );
        if (_unreadCount > 0) _unreadCount--;
        notifyListeners();
      }
    } catch (_) {}
  }
}
