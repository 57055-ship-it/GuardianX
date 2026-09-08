import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/pairing_provider.dart';

class PairingCodeModal extends StatefulWidget {
  final String childId;
  final String childName;

  const PairingCodeModal({
    super.key,
    required this.childId,
    required this.childName,
  });

  @override
  State<PairingCodeModal> createState() => _PairingCodeModalState();
}

class _PairingCodeModalState extends State<PairingCodeModal> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PairingProvider>(context, listen: false).generateCode(widget.childId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final pairingProvider = Provider.of<PairingProvider>(context);

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Icon(Icons.qr_code_2, size: 64, color: AppColors.primary),
          const SizedBox(height: 12),
          Text(
            'Pair ${widget.childName}\'s Device',
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Enter this temporary code in GuardianX on the child\'s phone.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey, fontSize: 13),
          ),
          const SizedBox(height: 24),
          if (pairingProvider.isLoading)
            const CircularProgressIndicator()
          else if (pairingProvider.generatedCode != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary, width: 2),
              ),
              child: Text(
                pairingProvider.generatedCode!,
                style: const TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 8,
                  color: AppColors.primary,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Expires at: ${DateFormatter.formatTime(pairingProvider.expiresAt)} (15 mins TTL)',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }
}
