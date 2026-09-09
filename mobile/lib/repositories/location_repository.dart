import '../core/constants/api_constants.dart';
import '../core/services/api_client.dart';
import '../models/location_model.dart';

class LocationRepository {
  final ApiClient _apiClient;

  LocationRepository(this._apiClient);

  Future<void> recordLocation({
    required double latitude,
    required double longitude,
    double accuracy = 0.0,
    double speed = 0.0,
    double altitude = 0.0,
    double heading = 0.0,
    String? childId,
  }) async {
    await _apiClient.post(
      ApiConstants.location,
      body: {
        if (childId != null) 'childId': childId,
        'latitude': latitude,
        'longitude': longitude,
        'accuracy': accuracy,
        'speed': speed,
        'altitude': altitude,
        'heading': heading,
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }

  Future<LocationModel?> getLatestLocation(String childId) async {
    try {
      final response = await _apiClient.get('${ApiConstants.location}/$childId/latest');
      return LocationModel.fromJson(response['location']);
    } catch (_) {
      return null;
    }
  }

  Future<List<LocationModel>> getLocationHistory(String childId, {int limit = 50}) async {
    try {
      final response = await _apiClient.get('${ApiConstants.location}/$childId/history?limit=$limit');
      final List list = response['history'] ?? [];
      return list.map((json) => LocationModel.fromJson(json)).toList();
    } catch (_) {
      return [];
    }
  }
}
