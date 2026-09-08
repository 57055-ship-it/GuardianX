import 'package:flutter/material.dart';
import '../models/location_model.dart';
import '../repositories/location_repository.dart';

class LocationProvider with ChangeNotifier {
  final LocationRepository _locationRepository;

  LocationModel? _latestLocation;
  List<LocationModel> _history = [];
  bool _isLoading = false;
  String? _error;

  LocationProvider(this._locationRepository);

  LocationModel? get latestLocation => _latestLocation;
  List<LocationModel> get history => _history;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchLatestLocation(String childId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _latestLocation = await _locationRepository.getLatestLocation(childId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchLocationHistory(String childId) async {
    try {
      _history = await _locationRepository.getLocationHistory(childId);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
    }
  }
}
