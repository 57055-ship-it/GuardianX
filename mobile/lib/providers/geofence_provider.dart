import 'package:flutter/material.dart';
import '../models/geofence_model.dart';
import '../repositories/geofence_repository.dart';

class GeofenceProvider with ChangeNotifier {
  final GeofenceRepository _geofenceRepository;

  List<GeofenceModel> _geofences = [];
  bool _isLoading = false;
  String? _error;

  GeofenceProvider(this._geofenceRepository);

  List<GeofenceModel> get geofences => _geofences;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchGeofences(String childId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _geofences = await _geofenceRepository.getGeofences(childId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createGeofence({
    required String childId,
    required String name,
    required double latitude,
    required double longitude,
    required double radius,
  }) async {
    try {
      final gf = await _geofenceRepository.createGeofence(
        childId: childId,
        name: name,
        latitude: latitude,
        longitude: longitude,
        radius: radius,
      );
      _geofences.add(gf);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
