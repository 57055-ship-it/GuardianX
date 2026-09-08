import '../core/constants/api_constants.dart';
import '../core/services/api_client.dart';
import '../models/alert_model.dart';

class AlertRepository {
  final ApiClient _apiClient;

  AlertRepository(this._apiClient);

  Future<Map<String, dynamic>> getAlerts({String? childId}) async {
    final query = childId != null ? '?childId=$childId' : '';
    final response = await _apiClient.get('${ApiConstants.alerts}$query');
    final List list = response['alerts'] ?? [];
    return {
      'alerts': list.map((json) => AlertModel.fromJson(json)).toList(),
      'unreadCount': response['unreadCount'] ?? 0,
    };
  }

  Future<void> markAsRead(String alertId) async {
    await _apiClient.put('${ApiConstants.alerts}/$alertId/read');
  }
}
