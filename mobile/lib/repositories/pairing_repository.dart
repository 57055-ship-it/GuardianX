import '../core/constants/api_constants.dart';
import '../core/services/api_client.dart';

class PairingRepository {
  final ApiClient _apiClient;

  PairingRepository(this._apiClient);

  Future<Map<String, dynamic>> createPairingCode(String childId) async {
    final response = await _apiClient.post(
      ApiConstants.createPairing,
      body: {'childId': childId},
    );
    return response['pairingCode'];
  }

  Future<Map<String, dynamic>> joinPairingCode({
    required String code,
    required String deviceName,
    required String deviceIdentifier,
    required String platform,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.joinPairing,
      body: {
        'code': code,
        'deviceName': deviceName,
        'deviceIdentifier': deviceIdentifier,
        'platform': platform,
      },
      withAuth: false,
    );
    return response;
  }
}
