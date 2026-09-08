import 'package:flutter/material.dart';
import '../models/family_routine_model.dart';
import '../models/hadith_model.dart';
import '../repositories/routine_repository.dart';

class RoutineProvider with ChangeNotifier {
  final RoutineRepository _routineRepository;

  List<FamilyRoutineModel> _routines = [];
  HadithModel? _todayHadith;
  bool _isLoading = false;
  String? _error;

  RoutineProvider(this._routineRepository);

  List<FamilyRoutineModel> get routines => _routines;
  HadithModel? get todayHadith => _todayHadith;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchRoutines({String? childId}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _routines = await _routineRepository.getRoutines(childId: childId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchTodayHadith() async {
    try {
      _todayHadith = await _routineRepository.getHadithToday();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
    }
  }

  Future<bool> completeRoutine(String routineId, {String? childId}) async {
    try {
      await _routineRepository.completeRoutine(routineId: routineId, childId: childId);
      await fetchRoutines(childId: childId);
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> createRoutine({
    required String childId,
    required String title,
    required String type,
    required String scheduledTime,
    int duration = 15,
  }) async {
    try {
      await _routineRepository.createRoutine(
        childId: childId,
        title: title,
        type: type,
        scheduledTime: scheduledTime,
        duration: duration,
      );
      await fetchRoutines(childId: childId);
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
