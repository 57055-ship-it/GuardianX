import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';

enum LocationPermissionState {
  granted,
  denied,
  permanentlyDenied,
  gpsDisabled,
}

class LocationResult {
  final double latitude;
  final double longitude;
  final double accuracy;
  final DateTime timestamp;
  final LocationPermissionState state;
  final bool isMockFallback;

  LocationResult({
    required this.latitude,
    required this.longitude,
    required this.accuracy,
    required this.timestamp,
    required this.state,
    this.isMockFallback = false,
  });
}

class LocationService {
  /// Check current OS GPS location service status and app permission status
  Future<LocationPermissionState> checkPermissions() async {
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return LocationPermissionState.gpsDisabled;
      }

      final permission = await Geolocator.checkPermission();
      switch (permission) {
        case LocationPermission.always:
        case LocationPermission.whileInUse:
          return LocationPermissionState.granted;
        case LocationPermission.denied:
          return LocationPermissionState.denied;
        case LocationPermission.deniedForever:
          return LocationPermissionState.permanentlyDenied;
        case LocationPermission.unableToDetermine:
          return LocationPermissionState.denied;
      }
    } catch (e) {
      debugPrint('[LocationService] checkPermissions error: $e');
      return LocationPermissionState.denied;
    }
  }

  /// Request runtime location permission from user
  Future<LocationPermissionState> requestPermissions() async {
    try {
      final permission = await Geolocator.requestPermission();
      switch (permission) {
        case LocationPermission.always:
        case LocationPermission.whileInUse:
          return LocationPermissionState.granted;
        case LocationPermission.denied:
          return LocationPermissionState.denied;
        case LocationPermission.deniedForever:
          return LocationPermissionState.permanentlyDenied;
        case LocationPermission.unableToDetermine:
          return LocationPermissionState.denied;
      }
    } catch (e) {
      debugPrint('[LocationService] requestPermissions error: $e');
      return LocationPermissionState.denied;
    }
  }

  /// Collect real GPS location update from device sensor
  Future<LocationResult> getCurrentLocation() async {
    final state = await checkPermissions();

    if (state == LocationPermissionState.granted) {
      try {
        final position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: Duration(seconds: 10),
          ),
        );

        return LocationResult(
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
          timestamp: position.timestamp,
          state: LocationPermissionState.granted,
          isMockFallback: false,
        );
      } catch (e) {
        debugPrint('[LocationService] Geolocator sensor fetch failed, trying last known position: $e');
        try {
          final lastPosition = await Geolocator.getLastKnownPosition();
          if (lastPosition != null) {
            return LocationResult(
              latitude: lastPosition.latitude,
              longitude: lastPosition.longitude,
              accuracy: lastPosition.accuracy,
              timestamp: lastPosition.timestamp,
              state: LocationPermissionState.granted,
              isMockFallback: false,
            );
          }
        } catch (_) {}
      }
    }

    // Fallback location for desktop/testing environments where GPS hardware is unavailable
    return LocationResult(
      latitude: 31.5204,
      longitude: 74.3587,
      accuracy: 5.0,
      timestamp: DateTime.now(),
      state: state,
      isMockFallback: true,
    );
  }
}
