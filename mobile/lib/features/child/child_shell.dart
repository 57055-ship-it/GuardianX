import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import 'dashboard/child_dashboard_screen.dart';
import 'activity/child_activity_screen.dart';
import 'routines/child_routines_screen.dart';
import 'sos/child_sos_screen.dart';
import 'settings/child_settings_screen.dart';

class ChildShell extends StatefulWidget {
  const ChildShell({super.key});

  @override
  State<ChildShell> createState() => _ChildShellState();
}

class _ChildShellState extends State<ChildShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    ChildDashboardScreen(),
    ChildActivityScreen(),
    ChildRoutinesScreen(),
    ChildSOSScreen(),
    ChildSettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home, color: AppColors.secondary),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.show_chart_outlined),
            selectedIcon: Icon(Icons.show_chart, color: AppColors.secondary),
            label: 'My Activity',
          ),
          NavigationDestination(
            icon: Icon(Icons.mosque_outlined),
            selectedIcon: Icon(Icons.mosque, color: AppColors.secondary),
            label: 'Routines',
          ),
          NavigationDestination(
            icon: Icon(Icons.sos_outlined, color: AppColors.critical),
            selectedIcon: Icon(Icons.sos, color: AppColors.critical),
            label: 'SOS',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings, color: AppColors.secondary),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}
