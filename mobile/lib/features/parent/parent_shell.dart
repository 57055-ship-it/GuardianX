import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/alert_provider.dart';
import 'dashboard/parent_dashboard_screen.dart';
import 'children/children_list_screen.dart';
import 'alerts/alerts_screen.dart';
import 'reports/reports_screen.dart';
import 'settings/parent_settings_screen.dart';

class ParentShell extends StatefulWidget {
  const ParentShell({super.key});

  @override
  State<ParentShell> createState() => _ParentShellState();
}

class _ParentShellState extends State<ParentShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    ParentDashboardScreen(),
    ChildrenListScreen(),
    AlertsScreen(),
    ReportsScreen(),
    ParentSettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final alertProvider = Provider.of<AlertProvider>(context);

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
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard, color: AppColors.primary),
            label: 'Dashboard',
          ),
          const NavigationDestination(
            icon: Icon(Icons.child_care_outlined),
            selectedIcon: Icon(Icons.child_care, color: AppColors.primary),
            label: 'Children',
          ),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: alertProvider.unreadCount > 0,
              label: Text('${alertProvider.unreadCount}'),
              child: const Icon(Icons.notifications_outlined),
            ),
            selectedIcon: Badge(
              isLabelVisible: alertProvider.unreadCount > 0,
              label: Text('${alertProvider.unreadCount}'),
              child: const Icon(Icons.notifications, color: AppColors.primary),
            ),
            label: 'Alerts',
          ),
          const NavigationDestination(
            icon: Icon(Icons.bar_chart_outlined),
            selectedIcon: Icon(Icons.bar_chart, color: AppColors.primary),
            label: 'Reports',
          ),
          const NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings, color: AppColors.primary),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}
