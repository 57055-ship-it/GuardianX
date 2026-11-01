import 'package:flutter/foundation.dart';
import '../core/constants/api_constants.dart';
import '../core/services/api_client.dart';
import '../models/app_usage_model.dart';

class UsageRepository {
  final ApiClient _apiClient;

  UsageRepository(this._apiClient);

  Future<void> recordUsage({
    required String packageName,
    required String appName,
    required int usageDuration,
    String? childId,
  }) async {
    final trimmedPkg = packageName.trim();
    final trimmedApp = appName.trim();
    if (trimmedPkg.isEmpty) {
      debugPrint('[UsageRepository] Cannot record single usage: packageName is empty.');
      return;
    }
    if (trimmedApp.isEmpty) {
      debugPrint('[UsageRepository] Cannot record single usage ($trimmedPkg): appName is empty.');
      return;
    }
    if (usageDuration < 0) {
      debugPrint('[UsageRepository] Cannot record single usage ($trimmedPkg): negative usageDuration ($usageDuration).');
      return;
    }

    await _apiClient.post(
      ApiConstants.recordUsage,
      body: {
        if (childId != null && childId.isNotEmpty) 'childId': childId,
        'packageName': trimmedPkg,
        'appName': trimmedApp,
        'usageDuration': usageDuration,
        'date': DateTime.now().toIso8601String().split('T')[0],
      },
    );
  }

  Future<void> recordUsageBatch({
    required List<Map<String, dynamic>> usages,
    String? childId,
  }) async {
    // 13. Ensure empty usage results do not trigger unnecessary API requests
    if (usages.isEmpty) {
      debugPrint('[UsageRepository] recordUsageBatch called with empty list; skipping request.');
      return;
    }

    // 11. Defensive validation: skip invalid records and log which field is missing
    final validUsages = <Map<String, dynamic>>[];
    for (final item in usages) {
      final pkg = (item['packageName'] as String?)?.trim();
      final app = (item['appName'] as String?)?.trim();
      final duration = item['usageDuration'] is int
          ? item['usageDuration'] as int
          : (item['durationMinutes'] is int ? item['durationMinutes'] as int : null);

      if (pkg == null || pkg.isEmpty) {
        debugPrint('[UsageRepository] Skipping record: missing packageName');
        continue;
      }
      if (app == null || app.isEmpty) {
        debugPrint('[UsageRepository] Skipping record ($pkg): missing appName');
        continue;
      }
      if (duration == null || duration < 0) {
        debugPrint('[UsageRepository] Skipping record ($pkg): invalid usageDuration ($duration)');
        continue;
      }

      validUsages.add({
        'packageName': pkg,
        'appName': app,
        'usageDuration': duration,
        'sessionCount': item['sessionCount'] ?? 1,
      });
    }

    if (validUsages.isEmpty) {
      debugPrint('[UsageRepository] No valid records found in batch; skipping submission.');
      return;
    }

    final dateStr = DateTime.now().toIso8601String().split('T')[0];

    try {
      await _apiClient.post(
        ApiConstants.recordUsage,
        body: {
          if (childId != null && childId.isNotEmpty) 'childId': childId,
          'usages': validUsages,
          'date': dateStr,
        },
      );
    } catch (e) {
      // Fallback for older server deployments expecting individual payloads
      debugPrint('[UsageRepository] Batch recording encountered error ($e). Retrying valid items individually...');
      for (final item in validUsages) {
        try {
          await recordUsage(
            packageName: item['packageName'],
            appName: item['appName'],
            usageDuration: item['usageDuration'],
            childId: childId,
          );
        } catch (innerErr) {
          debugPrint('[UsageRepository] Individual fallback failed for ${item['packageName']}: $innerErr');
        }
      }
    }
  }

  Future<List<AppUsageModel>> getAppUsage(String childId, {String? date}) async {
    try {
      final query = date != null ? '?date=$date' : '';
      final response = await _apiClient.get('${ApiConstants.appUsage}/$childId$query');
      final List list = response['usages'] ?? response['appUsage'] ?? [];
      return list.map((json) => AppUsageModel.fromJson(json)).toList();
    } catch (e) {
      debugPrint('[UsageRepository] getAppUsage failed for childId=$childId: $e');
      return [];
    }
  }

  Future<int> getScreenTime(String childId, {String? date}) async {
    try {
      final query = date != null ? '?date=$date' : '';
      final response = await _apiClient.get('${ApiConstants.screenTime}/$childId$query');
      return (response['totalDuration'] as num?)?.toInt() ??
          (response['totalScreenTimeMinutes'] as num?)?.toInt() ??
          0;
    } catch (e) {
      debugPrint('[UsageRepository] getScreenTime failed for childId=$childId: $e');
      return 0;
    }
  }
}
