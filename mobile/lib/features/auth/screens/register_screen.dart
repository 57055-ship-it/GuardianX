import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/storage_service.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/pairing_provider.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_text_field.dart';
import '../../parent/parent_shell.dart';
import '../../child/child_shell.dart';

class RegisterScreen extends StatefulWidget {
  final String initialRole;

  const RegisterScreen({
    super.key,
    this.initialRole = 'parent',
  });

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  late String _selectedRole;

  // Parent form controllers
  final _parentNameController = TextEditingController();
  final _familyNameController = TextEditingController();
  final _parentEmailController = TextEditingController();
  final _parentPasswordController = TextEditingController();
  final _parentFormKey = GlobalKey<FormState>();

  // Child pairing controllers
  final _pairingCodeController = TextEditingController();
  final _deviceNameController = TextEditingController(text: "Child's Phone");
  final _childFormKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _selectedRole = widget.initialRole;
  }

  @override
  void dispose() {
    _parentNameController.dispose();
    _familyNameController.dispose();
    _parentEmailController.dispose();
    _parentPasswordController.dispose();
    _pairingCodeController.dispose();
    _deviceNameController.dispose();
    super.dispose();
  }

  void _handleParentRegister() async {
    if (!_parentFormKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.register(
      name: _parentNameController.text.trim(),
      email: _parentEmailController.text.trim(),
      password: _parentPasswordController.text,
      familyName: _familyNameController.text.trim().isNotEmpty
          ? _familyNameController.text.trim()
          : null,
    );

    if (success && mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const ParentShell()),
        (route) => false,
      );
    }
  }

  void _handleChildPairing() async {
    if (!_childFormKey.currentState!.validate()) return;

    final pairingProvider = Provider.of<PairingProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final storageService = Provider.of<StorageService>(context, listen: false);

    final platformStr = kIsWeb
        ? 'web'
        : (Platform.isAndroid ? 'android' : (Platform.isIOS ? 'ios' : 'mobile'));

    final result = await pairingProvider.joinCode(
      code: _pairingCodeController.text.trim().toUpperCase(),
      deviceName: _deviceNameController.text.trim(),
      deviceIdentifier: storageService.deviceIdentifier,
      platform: platformStr,
    );

    if (result != null && mounted) {
      final tokens = result['tokens'];
      final child = result['child'];

      await authProvider.setChildSession(
        accessToken: tokens['accessToken'],
        refreshToken: tokens['refreshToken'],
        childId: child['childProfileId'] ?? child['id'],
        childName: child['name'],
        tenantId: child['tenantId'],
      );

      if (!mounted) return;

      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const ChildShell()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final pairingProvider = Provider.of<PairingProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(_selectedRole == 'parent' ? 'Create Family Account' : 'Join Family as Child'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Choose Account Type',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              const Text(
                'Select your role to register or pair your device',
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 20),

              // Role Selection Cards
              Row(
                children: [
                  Expanded(
                    child: _RoleCard(
                      title: 'Parent',
                      subtitle: 'Manage & protect your family',
                      icon: Icons.supervisor_account,
                      isSelected: _selectedRole == 'parent',
                      activeColor: AppColors.primary,
                      onTap: () {
                        setState(() {
                          _selectedRole = 'parent';
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _RoleCard(
                      title: 'Child',
                      subtitle: 'Join your family & pair device',
                      icon: Icons.child_care,
                      isSelected: _selectedRole == 'child',
                      activeColor: AppColors.secondary,
                      onTap: () {
                        setState(() {
                          _selectedRole = 'child';
                        });
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),

              if (_selectedRole == 'parent') ...[
                // PARENT REGISTRATION FORM
                Form(
                  key: _parentFormKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (authProvider.errorMessage != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.critical.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.critical.withOpacity(0.3)),
                          ),
                          child: Text(
                            authProvider.errorMessage!,
                            style: const TextStyle(color: AppColors.critical, fontSize: 13),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      CustomTextField(
                        controller: _parentNameController,
                        label: 'Parent Name',
                        hint: 'John Doe',
                        prefixIcon: const Icon(Icons.person_outlined),
                        validator: (val) => val == null || val.isEmpty ? 'Please enter name' : null,
                      ),
                      const SizedBox(height: 16),
                      CustomTextField(
                        controller: _familyNameController,
                        label: 'Family / Household Name (Optional)',
                        hint: "The Doe Family",
                        prefixIcon: const Icon(Icons.house_outlined),
                      ),
                      const SizedBox(height: 16),
                      CustomTextField(
                        controller: _parentEmailController,
                        label: 'Email Address',
                        hint: 'parent@example.com',
                        keyboardType: TextInputType.emailAddress,
                        prefixIcon: const Icon(Icons.email_outlined),
                        validator: (val) => val == null || val.isEmpty ? 'Please enter email' : null,
                      ),
                      const SizedBox(height: 16),
                      CustomTextField(
                        controller: _parentPasswordController,
                        label: 'Password',
                        hint: 'Minimum 6 characters',
                        obscureText: true,
                        prefixIcon: const Icon(Icons.lock_outlined),
                        validator: (val) => val == null || val.length < 6
                            ? 'Password must be at least 6 characters'
                            : null,
                      ),
                      const SizedBox(height: 24),
                      CustomButton(
                        text: 'Create Family Account',
                        onPressed: _handleParentRegister,
                        backgroundColor: AppColors.primary,
                        isLoading: authProvider.status == AuthStatus.loading,
                      ),
                    ],
                  ),
                ),
              ] else ...[
                // CHILD PAIRING FORM
                Form(
                  key: _childFormKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (pairingProvider.error != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.critical.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.critical.withOpacity(0.3)),
                          ),
                          child: Text(
                            pairingProvider.error!,
                            style: const TextStyle(color: AppColors.critical, fontSize: 13),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      const Text(
                        'Enter the 6-character pairing code generated by your parent on their GuardianX dashboard.',
                        style: TextStyle(fontSize: 13, color: Colors.grey),
                      ),
                      const SizedBox(height: 16),
                      CustomTextField(
                        controller: _pairingCodeController,
                        label: 'Pairing Code',
                        hint: 'e.g. GX89A2',
                        keyboardType: TextInputType.text,
                        prefixIcon: const Icon(Icons.key_outlined),
                        validator: (val) =>
                            val == null || val.trim().length != 6 ? 'Enter valid 6-character code' : null,
                      ),
                      const SizedBox(height: 16),
                      CustomTextField(
                        controller: _deviceNameController,
                        label: 'Device Name',
                        hint: "Child's Smartphone",
                        prefixIcon: const Icon(Icons.phone_android),
                        validator: (val) => val == null || val.isEmpty ? 'Please enter device name' : null,
                      ),
                      const SizedBox(height: 24),
                      CustomButton(
                        text: 'Verify Code & Join Family',
                        onPressed: _handleChildPairing,
                        backgroundColor: AppColors.secondary,
                        isLoading: pairingProvider.isLoading,
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final bool isSelected;
  final Color activeColor;
  final VoidCallback onTap;

  const _RoleCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.isSelected,
    required this.activeColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? activeColor.withOpacity(isDark ? 0.25 : 0.1)
              : (isDark ? Colors.grey.shade900 : Colors.grey.shade100),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? activeColor : Colors.grey.shade400.withOpacity(0.5),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 36,
              color: isSelected ? activeColor : Colors.grey,
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isSelected ? activeColor : null,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 11,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
