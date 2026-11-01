import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/usage_stats_service.dart';
import '../../../core/utils/app_name_resolver.dart';

class AppIconWidget extends StatefulWidget {
  final String packageName;
  final String? appName;
  final double size;
  final bool isBlocked;
  final BorderRadius? borderRadius;

  const AppIconWidget({
    super.key,
    required this.packageName,
    this.appName,
    this.size = 40.0,
    this.isBlocked = false,
    this.borderRadius,
  });

  @override
  State<AppIconWidget> createState() => _AppIconWidgetState();
}

class _AppIconWidgetState extends State<AppIconWidget> {
  Uint8List? _nativeIconBytes;

  @override
  void initState() {
    super.initState();
    _checkNativeIcon();
  }

  @override
  void didUpdateWidget(covariant AppIconWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.packageName != widget.packageName) {
      _checkNativeIcon();
    }
  }

  void _checkNativeIcon() {
    if (!UsageStatsService.isPlatformSupported) return;

    final cached = UsageStatsService.getCachedIconBytes(widget.packageName);
    if (cached != null) {
      _nativeIconBytes = cached;
      return;
    }

    UsageStatsService.getAppIconBytes(widget.packageName).then((bytes) {
      if (mounted && bytes != null) {
        setState(() {
          _nativeIconBytes = bytes;
        });
      }
    }).catchError((_) {});
  }

  @override
  Widget build(BuildContext context) {
    final radius = widget.borderRadius ?? BorderRadius.circular(widget.size * 0.24);

    Widget iconContent;
    if (_nativeIconBytes != null) {
      iconContent = ClipRRect(
        borderRadius: radius,
        child: Image.memory(
          _nativeIconBytes!,
          width: widget.size,
          height: widget.size,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _buildBrandedFallback(radius),
        ),
      );
    } else {
      iconContent = _buildBrandedFallback(radius);
    }

    if (!widget.isBlocked) {
      return iconContent;
    }

    // Render with blocked indicator overlay
    final badgeSize = math.max(14.0, widget.size * 0.38);

    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Opacity(
            opacity: 0.72,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: radius,
                border: Border.all(color: AppColors.critical.withOpacity(0.6), width: 1.5),
              ),
              child: iconContent,
            ),
          ),
          Positioned(
            right: -2,
            bottom: -2,
            child: Container(
              width: badgeSize,
              height: badgeSize,
              decoration: BoxDecoration(
                color: AppColors.critical,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 3,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Center(
                child: Icon(
                  Icons.block,
                  color: Colors.white,
                  size: badgeSize * 0.65,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBrandedFallback(BorderRadius radius) {
    final lowerPkg = widget.packageName.toLowerCase();
    final lowerApp = (widget.appName ?? '').toLowerCase();

    // 1. Google Chrome
    if (lowerPkg.contains('chrome') || lowerApp.contains('chrome')) {
      return _buildContainer(
        radius: radius,
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade300, width: 0.8),
        child: CustomPaint(
          size: Size(widget.size, widget.size),
          painter: _ChromeIconPainter(),
        ),
      );
    }

    // 2. YouTube & YouTube Music
    if (lowerPkg.contains('youtube') || lowerApp.contains('youtube')) {
      final isMusic = lowerPkg.contains('music') || lowerApp.contains('music');
      return _buildContainer(
        radius: radius,
        color: isMusic ? const Color(0xFF212121) : const Color(0xFFFF0000),
        child: Center(
          child: isMusic
              ? Icon(Icons.music_note, color: const Color(0xFFFF0000), size: widget.size * 0.58)
              : CustomPaint(
                  size: Size(widget.size * 0.55, widget.size * 0.40),
                  painter: _PlayTrianglePainter(color: Colors.white),
                ),
        ),
      );
    }

    // 3. WhatsApp
    if (lowerPkg.contains('whatsapp') || lowerApp.contains('whatsapp')) {
      return _buildContainer(
        radius: radius,
        gradient: const LinearGradient(
          colors: [Color(0xFF25D366), Color(0xFF128C7E)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        child: Center(
          child: Icon(Icons.chat_bubble_rounded, color: Colors.white, size: widget.size * 0.55),
        ),
      );
    }

    // 4. Google Play Store
    if (lowerPkg.contains('vending') || lowerPkg.contains('finsky') || lowerApp.contains('play store')) {
      return _buildContainer(
        radius: radius,
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade300, width: 0.8),
        child: Center(
          child: CustomPaint(
            size: Size(widget.size * 0.55, widget.size * 0.55),
            painter: _PlayStoreLogoPainter(),
          ),
        ),
      );
    }

    // 5. Gmail
    if (lowerPkg.contains('gmail') || lowerPkg.contains('.gm') || lowerApp.contains('gmail')) {
      return _buildContainer(
        radius: radius,
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade300, width: 0.8),
        child: Center(
          child: Icon(Icons.mail_rounded, color: const Color(0xFFEA4335), size: widget.size * 0.60),
        ),
      );
    }

    // 6. Google Maps
    if (lowerPkg.contains('maps') || lowerApp.contains('maps')) {
      return _buildContainer(
        radius: radius,
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade300, width: 0.8),
        child: Center(
          child: Icon(Icons.location_on_rounded, color: const Color(0xFFEA4335), size: widget.size * 0.65),
        ),
      );
    }

    // 7. Instagram
    if (lowerPkg.contains('instagram') || lowerApp.contains('instagram')) {
      return _buildContainer(
        radius: radius,
        gradient: const LinearGradient(
          colors: [Color(0xFF833AB4), Color(0xFFFD1D1D), Color(0xFFFCB045)],
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
        ),
        child: Center(
          child: Icon(Icons.camera_alt_outlined, color: Colors.white, size: widget.size * 0.58),
        ),
      );
    }

    // 8. Facebook
    if (lowerPkg.contains('facebook') && !lowerPkg.contains('orca')) {
      return _buildContainer(
        radius: radius,
        color: const Color(0xFF1877F2),
        child: Center(
          child: Text(
            'f',
            style: TextStyle(
              color: Colors.white,
              fontSize: widget.size * 0.68,
              fontWeight: FontWeight.w900,
              fontFamily: 'Roboto',
              height: 1.1,
            ),
          ),
        ),
      );
    }

    // 9. Messenger
    if (lowerPkg.contains('orca') || lowerApp.contains('messenger')) {
      return _buildContainer(
        radius: radius,
        gradient: const LinearGradient(
          colors: [Color(0xFF00B2FF), Color(0xFF006AFF)],
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
        ),
        child: Center(
          child: Icon(Icons.flash_on_rounded, color: Colors.white, size: widget.size * 0.58),
        ),
      );
    }

    // 10. Spotify
    if (lowerPkg.contains('spotify') || lowerApp.contains('spotify')) {
      return _buildContainer(
        radius: radius,
        color: const Color(0xFF191414),
        child: Center(
          child: Icon(Icons.graphic_eq_rounded, color: const Color(0xFF1DB954), size: widget.size * 0.62),
        ),
      );
    }

    // 11. Netflix
    if (lowerPkg.contains('netflix') || lowerApp.contains('netflix')) {
      return _buildContainer(
        radius: radius,
        color: const Color(0xFF141414),
        child: Center(
          child: Text(
            'N',
            style: TextStyle(
              color: const Color(0xFFE50914),
              fontSize: widget.size * 0.65,
              fontWeight: FontWeight.w900,
              fontFamily: 'Helvetica',
            ),
          ),
        ),
      );
    }

    // 12. TikTok
    if (lowerPkg.contains('tiktok') || lowerPkg.contains('musically') || lowerApp.contains('tiktok')) {
      return _buildContainer(
        radius: radius,
        color: Colors.black,
        child: Center(
          child: Icon(Icons.music_video_rounded, color: const Color(0xFF25F4EE), size: widget.size * 0.60),
        ),
      );
    }

    // 13. Snapchat
    if (lowerPkg.contains('snapchat') || lowerApp.contains('snapchat')) {
      return _buildContainer(
        radius: radius,
        color: const Color(0xFFFFFC00),
        child: Center(
          child: Icon(Icons.mood_rounded, color: Colors.black87, size: widget.size * 0.60),
        ),
      );
    }

    // 14. Roblox
    if (lowerPkg.contains('roblox') || lowerApp.contains('roblox')) {
      return _buildContainer(
        radius: radius,
        color: const Color(0xFF232527),
        child: Center(
          child: Transform.rotate(
            angle: 0.25,
            child: Container(
              width: widget.size * 0.35,
              height: widget.size * 0.35,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
        ),
      );
    }

    // 15. Discord
    if (lowerPkg.contains('discord') || lowerApp.contains('discord')) {
      return _buildContainer(
        radius: radius,
        color: const Color(0xFF5865F2),
        child: Center(
          child: Icon(Icons.sports_esports_rounded, color: Colors.white, size: widget.size * 0.58),
        ),
      );
    }

    // 16. Telegram
    if (lowerPkg.contains('telegram') || lowerApp.contains('telegram')) {
      return _buildContainer(
        radius: radius,
        gradient: const LinearGradient(
          colors: [Color(0xFF2AABEE), Color(0xFF229ED9)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        child: Center(
          child: Icon(Icons.send_rounded, color: Colors.white, size: widget.size * 0.52),
        ),
      );
    }

    // 17. X (Twitter)
    if (lowerPkg.contains('twitter') || lowerPkg.contains('.x.') || lowerApp.contains('twitter')) {
      return _buildContainer(
        radius: radius,
        color: Colors.black,
        child: Center(
          child: Text(
            '𝕏',
            style: TextStyle(
              color: Colors.white,
              fontSize: widget.size * 0.55,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      );
    }

    // 18. Settings
    if (lowerPkg.contains('settings') || lowerApp.contains('settings')) {
      return _buildContainer(
        radius: radius,
        gradient: const LinearGradient(
          colors: [Color(0xFF78909C), Color(0xFF455A64)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        child: Center(
          child: Icon(Icons.settings_rounded, color: Colors.white, size: widget.size * 0.58),
        ),
      );
    }

    // 19. Camera
    if (lowerPkg.contains('camera') || lowerApp.contains('camera')) {
      return _buildContainer(
        radius: radius,
        gradient: const LinearGradient(
          colors: [Color(0xFF37474F), Color(0xFF212121)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        child: Center(
          child: Icon(Icons.camera_alt_rounded, color: Colors.white, size: widget.size * 0.55),
        ),
      );
    }

    // 20. Phone
    if (lowerPkg.contains('dialer') || lowerPkg.contains('phone')) {
      return _buildContainer(
        radius: radius,
        color: const Color(0xFF34C759),
        child: Center(
          child: Icon(Icons.call_rounded, color: Colors.white, size: widget.size * 0.55),
        ),
      );
    }

    // 21. Messages
    if (lowerPkg.contains('messaging') || lowerPkg.contains('mms')) {
      return _buildContainer(
        radius: radius,
        color: const Color(0xFF007AFF),
        child: Center(
          child: Icon(Icons.message_rounded, color: Colors.white, size: widget.size * 0.55),
        ),
      );
    }

    // 22. Calculator
    if (lowerPkg.contains('calculator')) {
      return _buildContainer(
        radius: radius,
        color: const Color(0xFFFF9500),
        child: Center(
          child: Icon(Icons.calculate_rounded, color: Colors.white, size: widget.size * 0.58),
        ),
      );
    }

    // 23. Clock
    if (lowerPkg.contains('clock')) {
      return _buildContainer(
        radius: radius,
        color: const Color(0xFF1E293B),
        child: Center(
          child: Icon(Icons.access_time_filled_rounded, color: Colors.white, size: widget.size * 0.58),
        ),
      );
    }

    // 24. Car Maintenance Log
    if (lowerPkg.contains('car_maintenance_log')) {
      return _buildContainer(
        radius: radius,
        gradient: const LinearGradient(
          colors: [Color(0xFF1E3A8A), Color(0xFF0D9488)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        child: Center(
          child: Icon(Icons.directions_car_rounded, color: Colors.white, size: widget.size * 0.55),
        ),
      );
    }

    // 25. Digital Wellbeing / Forest
    if (lowerPkg.contains('forest') || lowerApp.contains('wellbeing')) {
      return _buildContainer(
        radius: radius,
        gradient: const LinearGradient(
          colors: [Color(0xFF2E7D32), Color(0xFF1B5E20)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        child: Center(
          child: Icon(Icons.eco_rounded, color: Colors.white, size: widget.size * 0.55),
        ),
      );
    }

    // 26. Google Play Games
    if (lowerPkg.contains('play.games')) {
      return _buildContainer(
        radius: radius,
        color: const Color(0xFF0F9D58),
        child: Center(
          child: Icon(Icons.sports_esports_rounded, color: Colors.white, size: widget.size * 0.58),
        ),
      );
    }

    // 27. Default Monogram Squircle with deterministic gradient
    return _buildMonogram(radius);
  }

  Widget _buildContainer({
    required BorderRadius radius,
    Color? color,
    Gradient? gradient,
    Border? border,
    required Widget child,
  }) {
    return Container(
      width: widget.size,
      height: widget.size,
      decoration: BoxDecoration(
        color: color,
        gradient: gradient,
        borderRadius: radius,
        border: border,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }

  Widget _buildMonogram(BorderRadius radius) {
    final title = AppNameResolver.resolve(widget.packageName, widget.appName);
    final words = title.split(' ').where((w) => w.isNotEmpty).toList();
    String initials = 'A';
    if (words.length >= 2) {
      initials = '${words[0][0]}${words[1][0]}'.toUpperCase();
    } else if (words.isNotEmpty && words[0].isNotEmpty) {
      initials = words[0].substring(0, math.min(2, words[0].length)).toUpperCase();
    }

    // Deterministic palette based on package hash
    final hash = widget.packageName.hashCode.abs();
    final gradients = [
      [const Color(0xFF4F46E5), const Color(0xFF7C3AED)], // Indigo / Purple
      [const Color(0xFF0284C7), const Color(0xFF0D9488)], // Sky / Teal
      [const Color(0xFFEA580C), const Color(0xFFD97706)], // Orange / Amber
      [const Color(0xFF059669), const Color(0xFF10B981)], // Emerald
      [const Color(0xFFE11D48), const Color(0xFFF43F5E)], // Rose
      [const Color(0xFF8B5CF6), const Color(0xFFEC4899)], // Violet / Pink
      [const Color(0xFF2563EB), const Color(0xFF3B82F6)], // Blue
    ];
    final selectedGradient = gradients[hash % gradients.length];

    return _buildContainer(
      radius: radius,
      gradient: LinearGradient(
        colors: selectedGradient,
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      child: Center(
        child: Text(
          initials,
          style: TextStyle(
            color: Colors.white,
            fontSize: widget.size * 0.42,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }
}

class _PlayTrianglePainter extends CustomPainter {
  final Color color;
  _PlayTrianglePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, size.height / 2)
      ..lineTo(0, size.height)
      ..close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _PlayStoreLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Triangle paths for Cyan, Green, Red, Yellow
    final cyanPaint = Paint()..color = const Color(0xFF00C3FF);
    final redPaint = Paint()..color = const Color(0xFFFF3333);
    final greenPaint = Paint()..color = const Color(0xFF00E676);
    final yellowPaint = Paint()..color = const Color(0xFFFFD400);

    // Cyan base
    final pathCyan = Path()
      ..moveTo(0, 0)
      ..lineTo(w * 0.65, h * 0.5)
      ..lineTo(0, h)
      ..close();
    canvas.drawPath(pathCyan, cyanPaint);

    // Green bottom
    final pathGreen = Path()
      ..moveTo(0, h)
      ..lineTo(w * 0.65, h * 0.5)
      ..lineTo(w * 0.82, h * 0.62)
      ..close();
    canvas.drawPath(pathGreen, greenPaint);

    // Red top
    final pathRed = Path()
      ..moveTo(0, 0)
      ..lineTo(w * 0.65, h * 0.5)
      ..lineTo(w * 0.82, h * 0.38)
      ..close();
    canvas.drawPath(pathRed, redPaint);

    // Yellow right point
    final pathYellow = Path()
      ..moveTo(w * 0.65, h * 0.5)
      ..lineTo(w * 0.82, h * 0.38)
      ..lineTo(w, h * 0.5)
      ..lineTo(w * 0.82, h * 0.62)
      ..close();
    canvas.drawPath(pathYellow, yellowPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _ChromeIconPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width * 0.38;

    final redPaint = Paint()..color = const Color(0xFFEA4335);
    final greenPaint = Paint()..color = const Color(0xFF34A853);
    final yellowPaint = Paint()..color = const Color(0xFFFBBC05);
    final bluePaint = Paint()..color = const Color(0xFF4285F4);
    final whitePaint = Paint()..color = Colors.white;

    final rect = Rect.fromCircle(center: center, radius: radius);

    // Outer segments
    canvas.drawArc(rect, -math.pi / 2, 2 * math.pi / 3, true, redPaint);
    canvas.drawArc(rect, math.pi / 6, 2 * math.pi / 3, true, greenPaint);
    canvas.drawArc(rect, 5 * math.pi / 6, 2 * math.pi / 3, true, yellowPaint);

    // White ring
    canvas.drawCircle(center, radius * 0.52, whitePaint);

    // Blue center circle
    canvas.drawCircle(center, radius * 0.40, bluePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
