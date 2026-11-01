class AppNameResolver {
  AppNameResolver._();

  /// Canonical dictionary of popular package identifiers to official app names
  static const Map<String, String> _knownPackages = {
    // Google & Android Core
    'com.android.chrome': 'Google Chrome',
    'com.google.android.apps.chrome': 'Google Chrome',
    'com.google.android.youtube': 'YouTube',
    'com.google.android.youtube.tv': 'YouTube',
    'com.google.android.apps.youtube.music': 'YouTube Music',
    'com.google.android.apps.youtube.kids': 'YouTube Kids',
    'com.android.vending': 'Google Play Store',
    'com.google.android.finsky': 'Google Play Store',
    'com.google.android.play.games': 'Google Play Games',
    'com.google.android.gm': 'Gmail',
    'com.google.android.apps.maps': 'Google Maps',
    'com.google.android.apps.photos': 'Google Photos',
    'com.google.android.apps.docs': 'Google Drive',
    'com.google.android.keep': 'Google Keep',
    'com.google.android.googlequicksearchbox': 'Google',
    'com.google.android.calendar': 'Google Calendar',
    'com.google.android.calculator': 'Calculator',
    'com.google.android.contacts': 'Contacts',
    'com.google.android.dialer': 'Phone',
    'com.google.android.apps.messaging': 'Messages',
    'com.google.android.deskclock': 'Clock',
    'com.google.android.videos': 'Google TV',
    'com.google.android.apps.tachyon': 'Google Meet',
    'com.google.android.apps.podcasts': 'Google Podcasts',

    // Social & Messaging
    'com.whatsapp': 'WhatsApp',
    'com.whatsapp.w4b': 'WhatsApp Business',
    'com.instagram.android': 'Instagram',
    'com.facebook.katana': 'Facebook',
    'com.facebook.lite': 'Facebook Lite',
    'com.facebook.orca': 'Messenger',
    'com.snapchat.android': 'Snapchat',
    'com.zhiliaoapp.musically': 'TikTok',
    'com.ss.android.ugc.trill': 'TikTok',
    'com.twitter.android': 'X (Twitter)',
    'org.telegram.messenger': 'Telegram',
    'org.telegram.plus': 'Telegram',
    'com.discord': 'Discord',
    'com.reddit.frontpage': 'Reddit',
    'com.pinterest': 'Pinterest',
    'com.linkedin.android': 'LinkedIn',
    'com.microsoft.teams': 'Microsoft Teams',
    'us.zoom.videomeetings': 'Zoom',
    'com.skype.raider': 'Skype',
    'com.viber.voip': 'Viber',

    // Streaming, Entertainment & Media
    'com.spotify.music': 'Spotify',
    'com.spotify.lite': 'Spotify Lite',
    'com.netflix.mediaclient': 'Netflix',
    'com.amazon.avod.thirdpartyclient': 'Prime Video',
    'com.disney.disneyplus': 'Disney+',
    'com.soundcloud.android': 'SoundCloud',
    'tv.twitch.android.app': 'Twitch',
    'com.audible.application': 'Audible',

    // Games
    'com.roblox.client': 'Roblox',
    'com.mojang.minecraftpe': 'Minecraft',
    'com.kiloo.subwaysurf': 'Subway Surfers',
    'com.king.candycrushsaga': 'Candy Crush Saga',
    'com.dts.freefireth': 'Free Fire',
    'com.dts.freefiremax': 'Free Fire MAX',
    'com.tencent.ig': 'PUBG Mobile',
    'com.pubg.krmobile': 'PUBG Mobile',
    'com.supercell.clashofclans': 'Clash of Clans',
    'com.supercell.brawlstars': 'Brawl Stars',
    'com.supercell.clashroyale': 'Clash Royale',
    'com.ea.gp.fifamobile': 'EA SPORTS FC Mobile',
    'com.activision.callofduty.shooter': 'Call of Duty: Mobile',
    'com.innersloth.spacemafia': 'Among Us',

    // Samsung System
    'com.sec.android.app.camera': 'Camera',
    'com.sec.android.gallery3d': 'Gallery',
    'com.sec.android.app.popupcalculator': 'Calculator',
    'com.sec.android.app.clockpackage': 'Clock',
    'com.sec.android.app.myfiles': 'My Files',
    'com.samsung.android.messaging': 'Samsung Messages',
    'com.samsung.android.dialer': 'Phone',
    'com.samsung.android.app.contacts': 'Contacts',
    'com.samsung.android.calendar': 'Calendar',
    'com.samsung.android.app.notes': 'Samsung Notes',
    'com.samsung.android.forest': 'Digital Wellbeing',
    'com.sec.android.app.sbrowser': 'Samsung Internet',

    // Standard Android System
    'com.android.settings': 'Settings',
    'com.android.camera': 'Camera',
    'com.android.dialer': 'Phone',
    'com.android.phone': 'Phone',
    'com.android.contacts': 'Contacts',
    'com.android.mms': 'Messages',
    'com.android.calculator2': 'Calculator',
    'com.android.deskclock': 'Clock',
    'com.android.gallery3d': 'Gallery',
    'com.android.documentsui': 'Files',

    // Custom & Project Apps
    'com.opxmirza.car_maintenance_log': 'Car Maintenance Log',
    'com.guardianx.app': 'GuardianX',
  };

  /// Resolves the exact human-readable application name from packageName and optional raw name
  static String resolve(String packageName, [String? rawAppName]) {
    final pkg = packageName.trim();
    if (pkg.isEmpty) {
      return (rawAppName != null && rawAppName.trim().isNotEmpty) ? rawAppName.trim() : 'Unknown App';
    }

    // 1. Direct dictionary lookup by full package name
    if (_knownPackages.containsKey(pkg)) {
      return _knownPackages[pkg]!;
    }

    // 2. Substring matching for popular platforms
    final lowerPkg = pkg.toLowerCase();
    if (lowerPkg.contains('youtube') && lowerPkg.contains('music')) return 'YouTube Music';
    if (lowerPkg.contains('youtube') && lowerPkg.contains('kids')) return 'YouTube Kids';
    if (lowerPkg.contains('youtube')) return 'YouTube';
    if (lowerPkg.contains('whatsapp')) return 'WhatsApp';
    if (lowerPkg.contains('chrome')) return 'Google Chrome';
    if (lowerPkg.contains('instagram')) return 'Instagram';
    if (lowerPkg.contains('facebook') && lowerPkg.contains('orca')) return 'Messenger';
    if (lowerPkg.contains('facebook')) return 'Facebook';
    if (lowerPkg.contains('tiktok') || lowerPkg.contains('musically')) return 'TikTok';
    if (lowerPkg.contains('snapchat')) return 'Snapchat';
    if (lowerPkg.contains('spotify')) return 'Spotify';
    if (lowerPkg.contains('netflix')) return 'Netflix';
    if (lowerPkg.contains('roblox')) return 'Roblox';
    if (lowerPkg.contains('discord')) return 'Discord';
    if (lowerPkg.contains('telegram')) return 'Telegram';
    if (lowerPkg.contains('twitter') || lowerPkg.contains('.x.')) return 'X (Twitter)';
    if (lowerPkg.contains('maps')) return 'Google Maps';
    if (lowerPkg.contains('gmail') || lowerPkg.contains('.gm')) return 'Gmail';
    if (lowerPkg.contains('play.games')) return 'Google Play Games';
    if (lowerPkg.contains('vending')) return 'Google Play Store';
    if (lowerPkg.contains('settings')) return 'Settings';
    if (lowerPkg.contains('camera')) return 'Camera';
    if (lowerPkg.contains('calculator')) return 'Calculator';
    if (lowerPkg.contains('forest')) return 'Digital Wellbeing';

    // 3. Check if rawAppName is already an authentic, formatted human-readable title
    final cleanRaw = (rawAppName ?? '').trim();
    if (cleanRaw.isNotEmpty &&
        cleanRaw != pkg &&
        !cleanRaw.startsWith('com.') &&
        !cleanRaw.contains('_') &&
        !cleanRaw.contains('-') &&
        cleanRaw.length > 2 &&
        cleanRaw != pkg.split('.').last) {
      return cleanRaw;
    }

    // 4. Intelligently format the raw app name or last package segment
    final target = cleanRaw.isNotEmpty && cleanRaw != pkg ? cleanRaw : pkg.split('.').last;
    return formatIdentifierToTitle(target);
  }

  /// Converts identifiers like "car_maintenance_log" or "subwaySurfers" into "Car Maintenance Log"
  static String formatIdentifierToTitle(String identifier) {
    if (identifier.isEmpty) return 'App';

    // Split on underscores, dashes, dots, or camelCase transitions
    final normalized = identifier
        .replaceAll(RegExp(r'[_\-\.]+'), ' ')
        .replaceAllMapped(RegExp(r'([a-z])([A-Z])'), (m) => '${m.group(1)} ${m.group(2)}');

    final words = normalized.split(' ').where((w) => w.trim().isNotEmpty).toList();
    if (words.isEmpty) return identifier;

    return words.map((w) {
      if (w.isEmpty) return '';
      final lower = w.toLowerCase();
      // Capitalize first character
      return lower[0].toUpperCase() + lower.substring(1);
    }).join(' ');
  }
}

