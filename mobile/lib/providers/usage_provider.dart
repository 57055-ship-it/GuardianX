import 'package:flutter/material.dart';
import '../core/services/app_blocker_service.dart';
import '../core/services/storage_service.dart';
import '../core/services/usage_stats_service.dart';
import '../models/app_usage_model.dart';
import '../repositories/usage_repository.dart';

class UsageProvider with ChangeNotifier {
  final UsageRepository _usageRepository;
  final StorageService? _storageService;
  final UsageStatsService _usageStatsService = UsageStatsService();
  final AppBlockerNativeService _appBlockerService = AppBlockerNativeService();

  List<AppUsageModel> _appUsages = [];
  int _totalScreenTimeMinutes = 0;
  bool _isLoading = false;
  String? _error;
  bool _hasPermission = false;
  bool _hasOverlayPermission = false;
  DateTime? _lastSyncTime;
  String? _lastSyncedSignature;
  int _consecutiveErrorCount = 0;
  String? _lastLoggedErrorMessage;
  DateTime? _lastSyncAttemptTime;
  List<String> _blockedPackages = [];
  List<Map<String, dynamic>> _blockedAppsList = [];

  UsageProvider(this._usageRepository, [this._storageService]);

  List<AppUsageModel> get appUsages => _appUsages;
  List<String> get blockedPackages => _blockedPackages;
  List<Map<String, dynamic>> get blockedAppsList => _blockedAppsList;
  int get totalScreenTimeMinutes => _totalScreenTimeMinutes;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasPermission => _hasPermission;
  bool get hasOverlayPermission => _hasOverlayPermission;
  DateTime? get lastSyncTime => _lastSyncTime;
  String? get lastSyncedSignature => _lastSyncedSignature;
  int get consecutiveErrorCount => _consecutiveErrorCount;

  bool isAppBlocked(String packageName) => _blockedPackages.contains(packageName);

  /// Check whether Android Usage Access and Overlay permissions have been granted
  Future<bool> checkPermission() async {
    _hasPermission = await _usageStatsService.hasUsagePermission();
    if (AppBlockerNativeService.isPlatformSupported) {
      _hasOverlayPermission = await _appBlockerService.hasOverlayPermission();
    }
    notifyListeners();
    return _hasPermission;
  }

  /// Open Android System Settings to grant Usage Access
  Future<bool> requestUsageAccess() async {
    final success = await _usageStatsService.openUsageSettings();
    await checkPermission();
    return success;
  }

  /// Open Android System Settings to grant Appear on top permission
  Future<bool> requestOverlayPermission() async {
    final success = await _appBlockerService.requestOverlayPermission();
    if (AppBlockerNativeService.isPlatformSupported) {
      _hasOverlayPermission = await _appBlockerService.hasOverlayPermission();
    }
    notifyListeners();
    return success;
  }

  /// Sync list of blocked packages with native Android Blocker
  Future<void> syncBlockedToNative() async {
    if (AppBlockerNativeService.isPlatformSupported) {
      await _appBlockerService.setBlockedApps(_blockedPackages);
    }
  }

  /// Fetch usage logs, screen time, and blocked apps from backend for a child
  Future<void> fetchChildUsage(String childId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final todayStr = DateTime.now().toIso8601String().split('T')[0];
      final remoteUsages = await _usageRepository.getAppUsage(childId, date: todayStr);
      _totalScreenTimeMinutes = await _usageRepository.getScreenTime(childId, date: todayStr);
      
      // Also fetch dedicated blocked apps list from server
      final remoteBlocked = await _usageRepository.getBlockedApps(childId);
      _blockedAppsList = remoteBlocked;

      final packageSet = <String>{};
      for (final b in remoteBlocked) {
        final pkg = b['packageName']?.toString();
        if (pkg != null && pkg.isNotEmpty) packageSet.add(pkg);
      }
      for (final u in remoteUsages) {
        if (u.isBlocked) packageSet.add(u.packageName);
      }
      _blockedPackages = packageSet.toList();

      // Ensure every item reflects the latest blocked status
      _appUsages = remoteUsages.map((u) {
        final isBlocked = _blockedPackages.contains(u.packageName);
        return u.isBlocked == isBlocked ? u : u.copyWith(isBlocked: isBlocked);
      }).toList();

      // Sync down to Android Blocker Service
      await syncBlockedToNative();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Explicitly refresh blocked apps list from server and update native blocker
  Future<void> fetchBlockedApps(String childId) async {
    try {
      final remoteBlocked = await _usageRepository.getBlockedApps(childId);
      _blockedAppsList = remoteBlocked;

      final packageSet = <String>{};
      for (final b in remoteBlocked) {
        final pkg = b['packageName']?.toString();
        if (pkg != null && pkg.isNotEmpty) packageSet.add(pkg);
      }
      _blockedPackages = packageSet.toList();

      _appUsages = _appUsages.map((u) {
        final isBlocked = _blockedPackages.contains(u.packageName);
        return u.copyWith(isBlocked: isBlocked);
      }).toList();

      notifyListeners();
      await syncBlockedToNative();
    } catch (e) {
      debugPrint('[UsageProvider] fetchBlockedApps error: $e');
    }
  }

  /// Toggle blocking for a specific package on a child device
  Future<bool> toggleBlockApp({
    required String childId,
    required String packageName,
    required String appName,
    required bool isBlocked,
  }) async {
    final prevBlocked = List<String>.from(_blockedPackages);
    final prevUsages = List<AppUsageModel>.from(_appUsages);

    if (isBlocked) {
      if (!_blockedPackages.contains(packageName)) {
        _blockedPackages.add(packageName);
      }
    } else {
      _blockedPackages.remove(packageName);
    }

    _appUsages = _appUsages.map((u) {
      if (u.packageName == packageName) {
        return u.copyWith(isBlocked: isBlocked);
      }
      return u;
    }).toList();
    notifyListeners();

    final success = await _usageRepository.toggleBlockApp(
      childId: childId,
      packageName: packageName,
      appName: appName,
      isBlocked: isBlocked,
    );

    if (!success) {
      // Revert if API call fails
      _blockedPackages = prevBlocked;
      _appUsages = prevUsages;
      notifyListeners();
      return false;
    }

    return true;
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
        isBlocked: _blockedPackages.contains(s.packageName),
      )).toList();
      notifyListeners();

      // Refresh blocked apps list from server if childId is available
      if (effectiveChildId.isNotEmpty) {
        try {
          final remoteBlocked = await _usageRepository.getBlockedApps(effectiveChildId);
          if (remoteBlocked.isNotEmpty || _blockedAppsList.isNotEmpty) {
            _blockedAppsList = remoteBlocked;
            final pkgSet = remoteBlocked
                .map((b) => b['packageName']?.toString() ?? '')
                .where((p) => p.isNotEmpty)
                .toSet();
            _blockedPackages = pkgSet.toList();
            _appUsages = _appUsages.map((u) {
              final blocked = _blockedPackages.contains(u.packageName);
              return u.isBlocked == blocked ? u : u.copyWith(isBlocked: blocked);
            }).toList();
            notifyListeners();
            await syncBlockedToNative();
          }
        } catch (_) {}
      }

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
