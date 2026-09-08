import 'package:flutter/material.dart';
import '../models/app_usage_model.dart';
import '../repositories/usage_repository.dart';

class UsageProvider with ChangeNotifier {
  final UsageRepository _usageRepository;

  List<AppUsageModel> _appUsages = [];
  int _totalScreenTimeMinutes = 0;
  bool _isLoading = false;
  String? _error;

  UsageProvider(this._usageRepository);

  List<AppUsageModel> get appUsages => _appUsages;
  int get totalScreenTimeMinutes => _totalScreenTimeMinutes;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchChildUsage(String childId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _appUsages = await _usageRepository.getAppUsage(childId);
      _totalScreenTimeMinutes = await _usageRepository.getScreenTime(childId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
