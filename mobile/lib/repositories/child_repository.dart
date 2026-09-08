import '../core/constants/api_constants.dart';
import '../core/services/api_client.dart';
import '../models/child_profile_model.dart';

class ChildRepository {
  final ApiClient _apiClient;

  ChildRepository(this._apiClient);

  Future<List<ChildProfileModel>> getChildren() async {
    final response = await _apiClient.get(ApiConstants.children);
    final List list = response['children'] ?? [];
    return list.map((json) => ChildProfileModel.fromJson(json)).toList();
  }

  Future<ChildProfileModel> createChild(String name, {DateTime? dateOfBirth}) async {
    final response = await _apiClient.post(
      ApiConstants.children,
      body: {
        'name': name,
        if (dateOfBirth != null) 'dateOfBirth': dateOfBirth.toIso8601String(),
      },
    );
    return ChildProfileModel.fromJson(response['child']);
  }

  Future<void> deleteChild(String id) async {
    await _apiClient.delete('${ApiConstants.children}/$id');
  }
}
