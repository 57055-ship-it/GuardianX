import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../providers/auth_provider.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_text_field.dart';
import '../../parent/parent_shell.dart';
import '../../child/child_shell.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  void _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final email = _emailController.text.trim();
    final password = _passwordController.text;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.login(email, password);

    if (success && mounted) {
      if (authProvider.isChild) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const ChildShell()),
        );
      } else {
        // Prompt for Face ID if device supports it and not yet set up
        final biometricService = authProvider.biometricService;
        final canCheck = await biometricService.canCheckBiometrics();
        final savedEmail = await biometricService.getSavedParentEmail();

        if (canCheck && (savedEmail == null || savedEmail.isEmpty) && mounted) {
          final shouldEnable = await showDialog<bool>(
            context: context,
            barrierDismissible: false,
            builder: (ctx) => AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Row(
                children: [
                  Icon(Icons.fingerprint, color: AppColors.primary, size: 28),
                  SizedBox(width: 10),
                  Text('Enable Face ID / Biometrics?'),
                ],
              ),
              content: const Text(
                'Would you like to enable Face ID / Fingerprint for fast and secure sign in next time?',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(ctx).pop(false),
                  child: const Text('Not Now', style: TextStyle(color: Colors.grey)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () => Navigator.of(ctx).pop(true),
                  child: const Text('Enable Face ID'),
                ),
              ],
            ),
          );

          if (shouldEnable == true) {
            final authenticated = await biometricService.authenticate(
              reason: 'Authenticate to enable Face ID / Biometrics for GuardianX',
            );
            if (authenticated) {
              await biometricService.saveParentCredentials(email, password);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Face ID / Biometric login enabled for future sign ins!')),
                );
              }
            }
          }
        }

        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const ParentShell()),
          );
        }
      }
    }
  }

  void _handleBiometricLogin() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.loginWithBiometrics();

    if (success && mounted) {
      if (authProvider.isChild) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const ChildShell()),
        );
      } else {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const ParentShell()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 32),
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.security,
                      size: 48,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'GuardianX Login',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Sign in to your Parent or Child account',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 36),
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
                  controller: _emailController,
                  label: 'Email Address',
                  hint: 'parent@example.com',
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: const Icon(Icons.email_outlined),
                  validator: (val) => val == null || val.isEmpty ? 'Please enter email' : null,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _passwordController,
                  label: 'Password',
                  hint: '••••••••',
                  obscureText: true,
                  prefixIcon: const Icon(Icons.lock_outlined),
                  validator: (val) => val == null || val.isEmpty ? 'Please enter password' : null,
                ),
                const SizedBox(height: 24),
                CustomButton(
                  text: 'Sign In',
                  onPressed: _handleLogin,
                  isLoading: authProvider.status == AuthStatus.loading,
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(50),
                    side: BorderSide(color: AppColors.primary.withOpacity(0.4)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: _handleBiometricLogin,
                  icon: const Icon(Icons.fingerprint, color: AppColors.primary, size: 24),
                  label: const Text(
                    'Sign In with Face ID / Biometrics',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Need an account? "),
                    GestureDetector(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const RegisterScreen(initialRole: 'parent'),
                          ),
                        );
                      },
                      child: const Text(
                        'Create Family Account',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 28),
                const Divider(),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const RegisterScreen(initialRole: 'child'),
                      ),
                    );
                  },
                  icon: const Icon(Icons.qr_code_scanner, color: AppColors.secondary),
                  label: const Text(
                    'Join Family as Child with Pairing Code',
                    style: TextStyle(color: AppColors.secondary, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
