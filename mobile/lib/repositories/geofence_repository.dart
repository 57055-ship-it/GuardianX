import '../core/constants/api_constants.dart';
import '../core/services/api_client.dart';
import '../models/geofence_model.dart';

class GeofenceRepository {
  final ApiClient _apiClient;

  GeofenceRepository(this._apiClient);

  Future<List<GeofenceModel>> getGeofences(String childId) async {
    final response = await _apiClient.get('${ApiConstants.geofences}?childId=$childId');
    final List list = response['geofences'] ?? [];
    return list.map((json) => GeofenceModel.fromJson(json)).toList();
  }

  Future<GeofenceModel> createGeofence({
    required String childId,
    required String name,
    required double latitude,
    required double longitude,
    required double radius,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.geofences,
      body: {
        'childId': childId,
        'name': name,
        'latitude': latitude,
        'longitude': longitude,
        'radius': radius,
      },
    );
    return GeofenceModel.fromJson(response['geofence']);
  }

  Future<void> deleteGeofence(String id) async {
    await _apiClient.delete('${ApiConstants.geofences}/$id');
  }
}
