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
    await _apiClient.post(
      ApiConstants.recordUsage,
      body: {
        if (childId != null) 'childId': childId,
        'packageName': packageName,
        'appName': appName,
        'usageDuration': usageDuration,
      },
    );
  }

  Future<List<AppUsageModel>> getAppUsage(String childId, {String? date}) async {
    try {
      final query = date != null ? '?date=$date' : '';
      final response = await _apiClient.get('${ApiConstants.appUsage}/$childId$query');
      final List list = response['usages'] ?? [];
      return list.map((json) => AppUsageModel.fromJson(json)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<int> getScreenTime(String childId, {String? date}) async {
    try {
      final query = date != null ? '?date=$date' : '';
      final response = await _apiClient.get('${ApiConstants.screenTime}/$childId$query');
      return response['totalDuration'] ?? 0;
    } catch (_) {
      return 0;
    }
  }
}
