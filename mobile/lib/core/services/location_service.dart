import 'dart:async';
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
  final double speed;
  final double altitude;
  final double heading;
  final DateTime timestamp;
  final LocationPermissionState state;
  final bool hasRealSignal;

  LocationResult({
    required this.latitude,
    required this.longitude,
    required this.accuracy,
    this.speed = 0.0,
    this.altitude = 0.0,
    this.heading = 0.0,
    required this.timestamp,
    required this.state,
    required this.hasRealSignal,
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

  /// Collect real GPS location update from device hardware sensors (NO MOCK DATA)
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
          speed: position.speed,
          altitude: position.altitude,
          heading: position.heading,
          timestamp: position.timestamp,
          state: LocationPermissionState.granted,
          hasRealSignal: true,
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
              speed: lastPosition.speed,
              altitude: lastPosition.altitude,
              heading: lastPosition.heading,
              timestamp: lastPosition.timestamp,
              state: LocationPermissionState.granted,
              hasRealSignal: true,
            );
          }
        } catch (_) {}
      }
    }

    // Explicit non-mock return when GPS signal/permission is unavailable
    return LocationResult(
      latitude: 0.0,
      longitude: 0.0,
      accuracy: 0.0,
      timestamp: DateTime.now(),
      state: state,
      hasRealSignal: false,
    );
  }

  /// Stream continuous real GPS position updates from sensor
  Stream<LocationResult> getPositionStream({
    int distanceFilterMeters = 10,
    int timeIntervalSeconds = 15,
  }) {
    late LocationSettings settings;
    if (defaultTargetPlatform == TargetPlatform.android) {
      settings = AndroidSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: distanceFilterMeters,
        intervalDuration: Duration(seconds: timeIntervalSeconds),
        forceLocationManager: false,
      );
    } else if (defaultTargetPlatform == TargetPlatform.iOS) {
      settings = AppleSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: distanceFilterMeters,
        pauseLocationUpdatesAutomatically: true,
        showBackgroundLocationIndicator: true,
      );
    } else {
      settings = LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: distanceFilterMeters,
      );
    }

    return Geolocator.getPositionStream(locationSettings: settings).map((position) {
      return LocationResult(
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        speed: position.speed,
        altitude: position.altitude,
        heading: position.heading,
        timestamp: position.timestamp,
        state: LocationPermissionState.granted,
        hasRealSignal: true,
      );
    });
  }
}
