import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// Services
import 'core/services/storage_service.dart';
import 'core/services/biometric_service.dart';
import 'core/services/api_client.dart';
import 'core/theme/app_theme.dart';

// Repositories
import 'repositories/auth_repository.dart';
import 'repositories/child_repository.dart';
import 'repositories/pairing_repository.dart';
import 'repositories/location_repository.dart';
import 'repositories/geofence_repository.dart';
import 'repositories/usage_repository.dart';
import 'repositories/alert_repository.dart';
import 'repositories/sos_repository.dart';
import 'repositories/routine_repository.dart';
import 'repositories/report_repository.dart';

// Providers
import 'providers/theme_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/child_provider.dart';
import 'providers/pairing_provider.dart';
import 'providers/location_provider.dart';
import 'providers/geofence_provider.dart';
import 'providers/usage_provider.dart';
import 'providers/alert_provider.dart';
import 'providers/sos_provider.dart';
import 'providers/routine_provider.dart';
import 'providers/report_provider.dart';

// Entry Screen
import 'features/auth/screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final storageService = await StorageService.init();
  final biometricService = BiometricService(storageService);
  final apiClient = ApiClient(storageService);

  // Instantiating Repositories
  final authRepository = AuthRepository(apiClient);
  final childRepository = ChildRepository(apiClient);
  final pairingRepository = PairingRepository(apiClient);
  final locationRepository = LocationRepository(apiClient);
  final geofenceRepository = GeofenceRepository(apiClient);
  final usageRepository = UsageRepository(apiClient);
  final alertRepository = AlertRepository(apiClient);
  final sosRepository = SOSRepository(apiClient);
  final routineRepository = RoutineRepository(apiClient);
  final reportRepository = ReportRepository(apiClient);

  runApp(
    MultiProvider(
      providers: [
        Provider<ApiClient>.value(value: apiClient),
        Provider<StorageService>.value(value: storageService),
        Provider<BiometricService>.value(value: biometricService),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider(authRepository, storageService, biometricService)),
        ChangeNotifierProvider(create: (_) => ChildProvider(childRepository)),
        ChangeNotifierProvider(create: (_) => PairingProvider(pairingRepository)),
        ChangeNotifierProvider(create: (_) => LocationProvider(locationRepository)),
        ChangeNotifierProvider(create: (_) => GeofenceProvider(geofenceRepository)),
        ChangeNotifierProvider(create: (_) => UsageProvider(usageRepository)),
        ChangeNotifierProvider(create: (_) => AlertProvider(alertRepository)),
        ChangeNotifierProvider(create: (_) => SOSProvider(sosRepository)),
        ChangeNotifierProvider(create: (_) => RoutineProvider(routineRepository)),
        ChangeNotifierProvider(create: (_) => ReportProvider(reportRepository)),
      ],
      child: const GuardianXApp(),
    ),
  );
}

class GuardianXApp extends StatelessWidget {
  const GuardianXApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);

    return MaterialApp(
      title: 'GuardianX',
      debugShowCheckedModeBanner: false,
      themeMode: themeProvider.themeMode,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: const SplashScreen(),
    );
  }
}
