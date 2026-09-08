import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../models/hadith_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/routine_provider.dart';
import '../../shared/widgets/custom_button.dart';

class HadithSessionModal extends StatefulWidget {
  final HadithModel hadith;

  const HadithSessionModal({super.key, required this.hadith});

  @override
  State<HadithSessionModal> createState() => _HadithSessionModalState();
}

class _HadithSessionModalState extends State<HadithSessionModal> {
  bool _isPlayingAudio = false;
  bool _isCompleted = false;

  void _toggleAudio() {
    setState(() {
      _isPlayingAudio = !_isPlayingAudio;
    });
  }

  void _finishHadithSession() async {
    final authProv = Provider.of<AuthProvider>(context, listen: false);
    final routineProv = Provider.of<RoutineProvider>(context, listen: false);

    // Find any active Hadith routine
    final hadithRoutine = routineProv.routines.firstWhere(
      (r) => r.type == 'hadith_session',
      orElse: () => routineProv.routines.isNotEmpty ? routineProv.routines.first : routineProv.routines.first,
    );

    if (hadithRoutine.id.isNotEmpty) {
      await routineProv.completeRoutine(
        hadithRoutine.id,
        childId: authProv.currentUser?.id,
      );
    }

    setState(() => _isCompleted = true);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Hadith session marked as completed! 🎉')),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                const Icon(Icons.menu_book, color: AppColors.secondary, size: 28),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    widget.hadith.title,
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '${widget.hadith.collection} • ${widget.hadith.authenticity}',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 20),

            // Arabic Text Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.secondary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.secondary.withOpacity(0.3)),
              ),
              child: Text(
                widget.hadith.arabic,
                textAlign: TextAlign.right,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  height: 1.6,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // English Translation
            const Text(
              'English Translation:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 4),
            Text(
              widget.hadith.english,
              style: const TextStyle(fontSize: 14, height: 1.4),
            ),
            const SizedBox(height: 12),

            // Urdu Translation
            const Text(
              'Urdu Translation (اردو ترجمہ):',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 4),
            Text(
              widget.hadith.urdu,
              style: const TextStyle(fontSize: 14, height: 1.4),
            ),
            const SizedBox(height: 20),

            // Simulated Audio Player
            OutlinedButton.icon(
              onPressed: _toggleAudio,
              icon: Icon(_isPlayingAudio ? Icons.pause_circle_filled : Icons.play_circle_fill),
              label: Text(_isPlayingAudio ? 'Pause Audio Recitation' : 'Listen to Audio Recitation'),
            ),
            const SizedBox(height: 20),

            CustomButton(
              text: _isCompleted ? 'Session Completed ✓' : 'Complete Hadith Session',
              onPressed: _finishHadithSession,
              backgroundColor: AppColors.secondary,
            ),
          ],
        ),
      ),
    );
  }
}
