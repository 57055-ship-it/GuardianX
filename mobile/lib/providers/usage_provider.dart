import 'package:flutter/material.dart';
import '../core/services/storage_service.dart';
import '../core/services/usage_stats_service.dart';
import '../models/app_usage_model.dart';
import '../repositories/usage_repository.dart';

class UsageProvider with ChangeNotifier {
  final UsageRepository _usageRepository;
  final StorageService? _storageService;
  final UsageStatsService _usageStatsService = UsageStatsService();

  List<AppUsageModel> _appUsages = [];
  int _totalScreenTimeMinutes = 0;
  bool _isLoading = false;
  String? _error;
  bool _hasPermission = false;
  DateTime? _lastSyncTime;
  String? _lastSyncedSignature;
  int _consecutiveErrorCount = 0;
  String? _lastLoggedErrorMessage;
  DateTime? _lastSyncAttemptTime;

  UsageProvider(this._usageRepository, [this._storageService]);

  List<AppUsageModel> get appUsages => _appUsages;
  int get totalScreenTimeMinutes => _totalScreenTimeMinutes;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasPermission => _hasPermission;
  DateTime? get lastSyncTime => _lastSyncTime;
  String? get lastSyncedSignature => _lastSyncedSignature;
  int get consecutiveErrorCount => _consecutiveErrorCount;

  /// Check whether Android Usage Access permission has been granted
  Future<bool> checkPermission() async {
    _hasPermission = await _usageStatsService.hasUsagePermission();
    notifyListeners();
    return _hasPermission;
  }

  /// Open Android System Settings to grant Usage Access
  Future<bool> requestUsageAccess() async {
    final success = await _usageStatsService.openUsageSettings();
    await checkPermission();
    return success;
  }

  /// Fetch usage logs and total screen time from backend for a child
  Future<void> fetchChildUsage(String childId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final todayStr = DateTime.now().toIso8601String().split('T')[0];
      _appUsages = await _usageRepository.getAppUsage(childId, date: todayStr);
      _totalScreenTimeMinutes = await _usageRepository.getScreenTime(childId, date: todayStr);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Sync real Android UsageStatsManager data to backend
  Future<void> syncUsageStats({String? childId}) async {
    final effectiveChildId = (childId != null && childId.trim().isNotEmpty)
        ? childId.trim()
        : (_storageService?.childId ?? '');

    if (!UsageStatsService.isPlatformSupported) return;

    // Minimum 10-second debounce between actual sync executions to prevent concurrent timer storms
    final now = DateTime.now();
    if (_lastSyncAttemptTime != null && now.difference(_lastSyncAttemptTime!).inSeconds < 10) {
      return;
    }
    _lastSyncAttemptTime = now;

    final permitted = await checkPermission();
    if (!permitted) {
      debugPrint('[UsageProvider] Cannot sync: Android Usage Access not granted.');
      return;
    }

    try {
      final stats = await _usageStatsService.getTodayUsageStats();

      // 13. Ensure empty usage results do not trigger unnecessary API requests
      if (stats.isEmpty) {
        if (_appUsages.isNotEmpty || _totalScreenTimeMinutes != 0) {
          _appUsages = [];
          _totalScreenTimeMinutes = 0;
          notifyListeners();
        }
        return;
      }

      // Optimistically update in-memory state so local UI reflects usage immediately
      _totalScreenTimeMinutes = stats.fold<int>(0, (sum, item) => sum + item.usageDurationMinutes);
      _appUsages = stats.map((s) => AppUsageModel(
        id: s.packageName,
        packageName: s.packageName,
        appName: s.appName,
        usageDuration: s.usageDurationMinutes,
        sessionCount: s.sessionCount,
        date: DateTime.now().toIso8601String().split('T')[0],
      )).toList();
      notifyListeners();

      // 12. Prevent duplicate synchronization of identical usage records
      final currentSignature = stats.map((s) => '${s.packageName}:${s.usageDurationMinutes}').join('|');
      if (currentSignature == _lastSyncedSignature &&
          _lastSyncTime != null &&
          now.difference(_lastSyncTime!).inMinutes < 5) {
        debugPrint('[UsageProvider] Usage stats unchanged since last sync. Skipping redundant network submission.');
        return;
      }

      final payload = stats.map((s) => s.toJson()).toList();
      await _usageRepository.recordUsageBatch(
        usages: payload,
        childId: effectiveChildId.isNotEmpty ? effectiveChildId : null,
      );
      _lastSyncTime = DateTime.now();
      _lastSyncedSignature = currentSignature;

      // Reset error counter on successful sync
      _consecutiveErrorCount = 0;
      _lastLoggedErrorMessage = null;

      // If local in-memory stats were empty, fallback to populate from server
      if (_appUsages.isEmpty && effectiveChildId.isNotEmpty) {
        try {
          final todayStr = DateTime.now().toIso8601String().split('T')[0];
          final remoteUsages = await _usageRepository.getAppUsage(effectiveChildId, date: todayStr);
          final remoteTime = await _usageRepository.getScreenTime(effectiveChildId, date: todayStr);
          if (remoteUsages.isNotEmpty) {
            _appUsages = remoteUsages;
          }
          if (remoteTime > 0) {
            _totalScreenTimeMinutes = remoteTime;
          }
          notifyListeners();
        } catch (_) {}
      }
    } catch (e) {
      _consecutiveErrorCount++;
      final msg = e.toString();
      // 14. Avoid infinite retry loops and repeated identical error messages
      if (_consecutiveErrorCount <= 2 || msg != _lastLoggedErrorMessage) {
        debugPrint('[UsageProvider] syncUsageStats error: $msg');
        _lastLoggedErrorMessage = msg;
      }
    }
  }
}
