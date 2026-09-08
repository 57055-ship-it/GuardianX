import '../core/constants/api_constants.dart';
import '../core/services/api_client.dart';
import '../models/family_routine_model.dart';
import '../models/hadith_model.dart';

class RoutineRepository {
  final ApiClient _apiClient;

  RoutineRepository(this._apiClient);

  Future<List<FamilyRoutineModel>> getRoutines({String? childId}) async {
    final query = childId != null ? '?childId=$childId' : '';
    final response = await _apiClient.get('${ApiConstants.routines}$query');
    final List list = response['routines'] ?? [];
    return list.map((json) => FamilyRoutineModel.fromJson(json)).toList();
  }

  Future<FamilyRoutineModel> createRoutine({
    required String childId,
    required String title,
    required String type,
    required String scheduledTime,
    int duration = 15,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.routines,
      body: {
        'childId': childId,
        'title': title,
        'type': type,
        'scheduledTime': scheduledTime,
        'duration': duration,
      },
    );
    return FamilyRoutineModel.fromJson(response['routine']);
  }

  Future<void> completeRoutine({required String routineId, String? childId}) async {
    await _apiClient.post(
      ApiConstants.completeRoutine,
      body: {
        'routineId': routineId,
        if (childId != null) 'childId': childId,
      },
    );
  }

  Future<HadithModel> getHadithToday() async {
    final response = await _apiClient.get(ApiConstants.hadithToday);
    return HadithModel.fromJson(response['hadith']);
  }
}
