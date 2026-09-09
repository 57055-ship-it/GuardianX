import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/theme_provider.dart';
import '../../auth/screens/login_screen.dart';

class ParentSettingsScreen extends StatefulWidget {
  const ParentSettingsScreen({super.key});

  @override
  State<ParentSettingsScreen> createState() => _ParentSettingsScreenState();
}

class _ParentSettingsScreenState extends State<ParentSettingsScreen> {
  String _currentPlan = 'FREE';
  bool _isLoadingPlan = true;
  bool _isUpdatingPlan = false;
  bool _isBiometricEnabled = false;

  @override
  void initState() {
    super.initState();
    _loadFamilyDetails();
    _loadBiometricStatus();
  }

  Future<void> _loadFamilyDetails() async {
    try {
      final apiClient = Provider.of<ApiClient>(context, listen: false);
      final res = await apiClient.get('/families/details');
      if (res['success'] == true && res['family'] != null) {
        if (mounted) {
          setState(() {
            _currentPlan = (res['family']['plan'] ?? 'FREE').toString().toUpperCase();
          });
        }
      }
    } catch (e) {
      debugPrint('[Settings] Failed to fetch family plan: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoadingPlan = false);
      }
    }
  }

  Future<void> _loadBiometricStatus() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final savedEmail = await authProvider.biometricService.getSavedParentEmail();
    if (mounted) {
      setState(() {
        _isBiometricEnabled = savedEmail != null && savedEmail.isNotEmpty;
      });
    }
  }

  void _toggleBiometrics(bool enable) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final biometricService = authProvider.biometricService;

    if (enable) {
      final canCheck = await biometricService.canCheckBiometrics();
      if (!canCheck) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Face ID / Biometrics is not supported on this device.')),
          );
        }
        return;
      }

      final authenticated = await biometricService.authenticate(
        reason: 'Authenticate to enable Face ID / Biometrics for GuardianX',
      );

      if (authenticated) {
        final email = authProvider.currentUser?.email;
        if (email != null) {
          // Store email for biometric login prompt
          await biometricService.saveParentCredentials(email, 'SAVED_BIOMETRIC_SESSION');
          setState(() => _isBiometricEnabled = true);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Face ID / Biometric login enabled successfully!')),
            );
          }
        }
      }
    } else {
      await biometricService.clearSavedCredentials();
      setState(() => _isBiometricEnabled = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Face ID / Biometric login removed.')),
        );
      }
    }
  }

  void _updatePlan(String plan) async {
    setState(() => _isUpdatingPlan = true);
    try {
      final apiClient = Provider.of<ApiClient>(context, listen: false);
      await apiClient.put(ApiConstants.updatePlan, body: {'plan': plan});
      setState(() => _currentPlan = plan);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('SaaS Subscription Plan upgraded to $plan!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Plan update failed: $e')),
        );
      }
    } finally {
      setState(() => _isUpdatingPlan = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final themeProvider = Provider.of<ThemeProvider>(context);
    final user = authProvider.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Account & Settings'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadFamilyDetails,
            tooltip: 'Refresh Plan Details',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Profile Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: AppColors.primary.withOpacity(0.2),
                    child: Text(
                      user?.name[0].toUpperCase() ?? 'P',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.name ?? 'Parent Account',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          user?.email ?? '',
                          style: const TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'ROLE: ${user?.role.toUpperCase()}',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // SaaS Subscription Section
          const Text(
            'SaaS Subscription Plan',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Text(
                            'Active Plan: ',
                            style: TextStyle(fontSize: 15),
                          ),
                          if (_isLoadingPlan)
                            const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: _currentPlan == 'PREMIUM'
                                    ? Colors.amber.withOpacity(0.2)
                                    : _currentPlan == 'FAMILY'
                                        ? AppColors.primary.withOpacity(0.2)
                                        : Colors.grey.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: _currentPlan == 'PREMIUM'
                                      ? Colors.amber
                                      : _currentPlan == 'FAMILY'
                                          ? AppColors.primary
                                          : Colors.grey,
                                ),
                              ),
                              child: Text(
                                _currentPlan,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: _currentPlan == 'PREMIUM'
                                      ? Colors.amber.shade800
                                      : _currentPlan == 'FAMILY'
                                          ? AppColors.primary
                                          : Colors.grey.shade800,
                                ),
                              ),
                            ),
                        ],
                      ),
                      if (_isUpdatingPlan)
                        const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(
                              color: _currentPlan == 'FREE' ? AppColors.primary : Colors.grey,
                            ),
                          ),
                          onPressed: () => _updatePlan('FREE'),
                          child: const Text('FREE (1 Child)'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(
                              color: _currentPlan == 'FAMILY' ? AppColors.primary : Colors.grey,
                            ),
                          ),
                          onPressed: () => _updatePlan('FAMILY'),
                          child: const Text('FAMILY (3 Children)'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _currentPlan == 'PREMIUM'
                            ? AppColors.secondary
                            : AppColors.primary,
                      ),
                      onPressed: () => _updatePlan('PREMIUM'),
                      child: const Text('PREMIUM (5 Children + Advanced Analytics)'),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Security & Biometric Preferences
          const Text(
            'Security & App Preferences',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Face ID / Biometric Login'),
                  subtitle: Text(_isBiometricEnabled
                      ? 'Enabled - Log in using Face ID or Fingerprint'
                      : 'Disabled - Sign in with email & password'),
                  secondary: const Icon(Icons.fingerprint, color: AppColors.primary),
                  value: _isBiometricEnabled,
                  onChanged: _toggleBiometrics,
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Dark Theme'),
                  secondary: const Icon(Icons.dark_mode_outlined),
                  value: themeProvider.isDarkMode,
                  onChanged: (val) => themeProvider.toggleTheme(val),
                ),
                const Divider(height: 1),
                const ListTile(
                  leading: Icon(Icons.security),
                  title: Text('Security & Privacy Policy'),
                  subtitle: Text('Multi-tenant isolation & OS permission transparency'),
                  trailing: Icon(Icons.chevron_right),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Logout Button
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
            label: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}

