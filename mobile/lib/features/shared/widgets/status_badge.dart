import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final bool isSuccess;
  final Color? customColor;

  const StatusBadge({
    super.key,
    required this.label,
    this.isSuccess = true,
    this.customColor,
  });

  @override
  Widget build(BuildContext context) {
    final color = customColor ?? (isSuccess ? AppColors.success : AppColors.critical);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
