import '../core/constants/api_constants.dart';
import '../core/services/api_client.dart';
import '../models/safety_insight_model.dart';

class ReportRepository {
  final ApiClient _apiClient;

  ReportRepository(this._apiClient);

  Future<Map<String, dynamic>> getDailyReport(String childId, {String? date}) async {
    final queryDate = date != null ? '&date=$date' : '';
    final response = await _apiClient.get('${ApiConstants.dailyReport}?childId=$childId$queryDate');
    return response['data'] ?? {};
  }

  Future<Map<String, dynamic>> getWeeklyReport(String childId) async {
    final response = await _apiClient.get('${ApiConstants.weeklyReport}?childId=$childId');
    return response['data'] ?? {};
  }

  Future<List<SafetyInsightModel>> getSafetyInsights(String childId) async {
    final response = await _apiClient.get('${ApiConstants.insights}?childId=$childId');
    final List list = response['insights'] ?? [];
    return list.map((json) => SafetyInsightModel.fromJson(json)).toList();
  }
}
