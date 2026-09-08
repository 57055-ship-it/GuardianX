import '../core/constants/api_constants.dart';
import '../core/services/api_client.dart';

class SOSRepository {
  final ApiClient _apiClient;

  SOSRepository(this._apiClient);

  Future<Map<String, dynamic>> triggerSOS({
    required double latitude,
    required double longitude,
    String? childId,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.sos,
      body: {
        if (childId != null) 'childId': childId,
        'latitude': latitude,
        'longitude': longitude,
      },
    );
    return response;
  }
}
