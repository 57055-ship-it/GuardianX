import '../core/constants/api_constants.dart';
import '../core/services/api_client.dart';
import '../models/user_model.dart';

class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository(this._apiClient);

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _apiClient.post(
      ApiConstants.login,
      body: {'email': email, 'password': password},
      withAuth: false,
    );
    return response;
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String? familyName,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.register,
      body: {
        'name': name,
        'email': email,
        'password': password,
        if (familyName != null) 'familyName': familyName,
      },
      withAuth: false,
    );
    return response;
  }

  Future<UserModel> getProfile() async {
    final response = await _apiClient.get(ApiConstants.me);
    return UserModel.fromJson(response['user']);
  }
}
