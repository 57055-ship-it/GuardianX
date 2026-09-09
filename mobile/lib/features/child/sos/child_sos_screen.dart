import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/location_service.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/sos_provider.dart';

class ChildSOSScreen extends StatefulWidget {
  const ChildSOSScreen({super.key});

  @override
  State<ChildSOSScreen> createState() => _ChildSOSScreenState();
}

class _ChildSOSScreenState extends State<ChildSOSScreen> {
  void _confirmAndTriggerSOS() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.warning, color: AppColors.critical),
            SizedBox(width: 8),
            Text('Confirm Emergency SOS'),
          ],
        ),
        content: const Text(
          'Are you sure you want to send an emergency distress signal? Your live location will be transmitted immediately to your parent.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.critical),
            onPressed: () async {
              Navigator.of(context).pop();
              _sendSOS();
            },
            child: const Text('YES, SEND SOS NOW'),
          ),
        ],
      ),
    );
  }

  void _sendSOS() async {
    final sosProvider = Provider.of<SOSProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final locService = LocationService();

    final loc = await locService.getCurrentLocation();

    final success = await sosProvider.triggerSOS(
      latitude: loc.latitude,
      longitude: loc.longitude,
      childId: authProvider.currentUser?.id,
    );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.critical,
          content: Text('SOS Distress Signal Sent to Parent! Help is on the way.'),
          duration: Duration(seconds: 5),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final sosProvider = Provider.of<SOSProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Emergency SOS Signal')),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
              const Text(
                'PANICTING OR IN DANGER?',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.critical,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Pressing the button below will instantly alert your family with your live location.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 48),

              // Gigantic SOS Touch Target Button
              GestureDetector(
                onTap: _confirmAndTriggerSOS,
                child: Container(
                  height: 180,
                  width: 180,
                  decoration: BoxDecoration(
                    color: AppColors.critical,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.critical.withOpacity(0.5),
                        blurRadius: 30,
                        spreadRadius: 10,
                      ),
                    ],
                  ),
                  child: Center(
                    child: sosProvider.isTransmitting
                        ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 4)
                        : const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.touch_app, color: Colors.white, size: 48),
                              SizedBox(height: 8),
                              Text(
                                'TAP SOS',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                  letterSpacing: 2,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              ),
              const SizedBox(height: 48),
              if (sosProvider.statusMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.success.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    sosProvider.statusMessage!,
                    style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    ),
  );
}
}
