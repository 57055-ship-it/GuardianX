import 'dart:async';
import 'package:flutter/material.dart';
import '../core/services/location_service.dart';
import '../models/location_model.dart';
import '../repositories/location_repository.dart';

class LocationProvider with ChangeNotifier {
  final LocationRepository _locationRepository;
  final LocationService _locationService = LocationService();

  LocationModel? _latestLocation;
  List<LocationModel> _history = [];
  bool _isLoading = false;
  String? _error;

  // Real-time Child Device GPS tracking state
  LocationPermissionState _permissionState = LocationPermissionState.denied;
  StreamSubscription<LocationResult>? _positionSubscription;
  bool _isTrackingActive = false;
  LocationResult? _currentChildPosition;
  int _pendingOfflinePoints = 0;

  LocationProvider(this._locationRepository);

  LocationModel? get latestLocation => _latestLocation;
  List<LocationModel> get history => _history;
  bool get isLoading => _isLoading;
  String? get error => _error;

  LocationPermissionState get permissionState => _permissionState;
  bool get isTrackingActive => _isTrackingActive;
  LocationResult? get currentChildPosition => _currentChildPosition;
  int get pendingOfflinePoints => _pendingOfflinePoints;

  /// Parent: Fetch latest location of a child from server
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

  /// Parent: Fetch location history breadcrumbs of a child
  Future<void> fetchLocationHistory(String childId) async {
    try {
      _history = await _locationRepository.getLocationHistory(childId);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
    }
  }

  /// Child: Initialize and start real GPS sensor stream updates
  Future<void> startChildLocationTracking({String? childId}) async {
    if (_isTrackingActive) return;

    _permissionState = await _locationService.checkPermissions();
    if (_permissionState != LocationPermissionState.granted) {
      _permissionState = await _locationService.requestPermissions();
    }
    notifyListeners();

    if (_permissionState != LocationPermissionState.granted) {
      debugPrint('[LocationProvider] Cannot start tracking: GPS Permission or Service unavailable.');
      return;
    }

    _isTrackingActive = true;
    notifyListeners();

    // Perform immediate real location fix
    try {
      final initialRes = await _locationService.getCurrentLocation();
      if (initialRes.hasRealSignal) {
        _currentChildPosition = initialRes;
        await _locationRepository.recordLocation(
          latitude: initialRes.latitude,
          longitude: initialRes.longitude,
          accuracy: initialRes.accuracy,
          speed: initialRes.speed,
          altitude: initialRes.altitude,
          heading: initialRes.heading,
          childId: childId,
        );
      }
    } catch (e) {
      debugPrint('[LocationProvider] Initial location sync error: $e');
    }

    // Subscribe to sensor stream with 10m distance filter and 15s interval
    _positionSubscription = _locationService
        .getPositionStream(distanceFilterMeters: 10, timeIntervalSeconds: 15)
        .listen(
      (pos) async {
        _currentChildPosition = pos;
        notifyListeners();

        if (pos.hasRealSignal) {
          try {
            await _locationRepository.recordLocation(
              latitude: pos.latitude,
              longitude: pos.longitude,
              accuracy: pos.accuracy,
              speed: pos.speed,
              altitude: pos.altitude,
              heading: pos.heading,
              childId: childId,
            );
            if (_pendingOfflinePoints > 0) _pendingOfflinePoints = 0;
          } catch (e) {
            _pendingOfflinePoints++;
            debugPrint('[LocationProvider] Location sync queued offline point count: $_pendingOfflinePoints');
          }
        }
      },
      onError: (err) {
        debugPrint('[LocationProvider] Position stream error: $err');
      },
    );
  }

  /// Child: Stop active location sensor stream
  void stopChildLocationTracking() {
    _positionSubscription?.cancel();
    _positionSubscription = null;
    _isTrackingActive = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _positionSubscription?.cancel();
    super.dispose();
  }
}
