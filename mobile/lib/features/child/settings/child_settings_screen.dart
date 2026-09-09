import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/theme_provider.dart';
import '../../../core/services/usage_stats_service.dart';
import '../../auth/screens/login_screen.dart';

class ChildSettingsScreen extends StatelessWidget {
  const ChildSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final themeProvider = Provider.of<ThemeProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Device Settings & Privacy')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Device Info Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: AppColors.secondary.withOpacity(0.2),
                    child: const Icon(Icons.phone_android, color: AppColors.secondary),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          authProvider.currentUser?.name ?? 'Child Device',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const Text(
                          'Paired with Family Tenant',
                          style: TextStyle(color: Colors.grey, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Transparent Privacy Notice Card
          Card(
            color: AppColors.primary.withOpacity(0.08),
            child: const Padding(
              padding: EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.privacy_tip_outlined, color: AppColors.primary),
                      SizedBox(width: 8),
                      Text(
                        'Transparent Safety Disclosure',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text(
                    'GuardianX is configured by your parents to share location and app usage durations for your safety. GuardianX NEVER reads private messages, records audio/video covertly, or captures passwords.',
                    style: TextStyle(fontSize: 12, height: 1.4),
                  ),
                ],
              ),
            ),
          ),
          // Platform Permissions & Access Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.security, color: AppColors.secondary),
                      const SizedBox(width: 8),
                      Text(
                        UsageStatsService.isPlatformSupported
                            ? 'Android Permissions & Access'
                            : 'Platform Permissions & Privacy',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    UsageStatsService.isPlatformSupported
                        ? 'To enable accurate screen time tracking and safe zone alerts, grant Location and App Usage permissions in System Settings.'
                        : 'GuardianX monitors real-time location, safe zone geofences, and SOS distress alerts on iOS devices.',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  if (UsageStatsService.isPlatformSupported) ...[
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: () async {
                        final service = UsageStatsService();
                        final success = await service.openUsageSettings();
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(success
                                  ? 'Opening System Usage Access settings...'
                                  : 'Could not open settings automatically.'
                              ),
                            ),
                          );
                        }
                      },
                      icon: const Icon(Icons.settings_applications),
                      label: const Text('Grant App Usage Access in Settings'),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Dark Theme Toggle
          Card(
            child: SwitchListTile(
              title: const Text('Dark Mode'),
              secondary: const Icon(Icons.dark_mode_outlined),
              value: themeProvider.isDarkMode,
              onChanged: (val) => themeProvider.toggleTheme(val),
            ),
          ),
          const SizedBox(height: 24),

          // Sign Out Button
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.critical,
              minimumSize: const Size.fromHeight(50),
            ),
            onPressed: () async {
              await authProvider.logout();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            icon: const Icon(Icons.logout),
            label: const Text('Unlink / Sign Out'),
          ),
        ],
      ),
    );
  }
}
