/**
 * Canonical dictionary and resolver for Android application identifiers
 */
const KNOWN_PACKAGES = {
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

  // Social & Communication
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

  // Entertainment
  'com.spotify.music': 'Spotify',
  'com.spotify.lite': 'Spotify Lite',
  'com.netflix.mediaclient': 'Netflix',
  'com.amazon.avod.thirdpartyclient': 'Prime Video',
  'com.disney.disneyplus': 'Disney+',
  'com.soundcloud.android': 'SoundCloud',
  'tv.twitch.android.app': 'Twitch',

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

  // Samsung
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

  // Standard System
  'com.android.settings': 'Settings',
  'com.android.camera': 'Camera',
  'com.android.dialer': 'Phone',
  'com.android.phone': 'Phone',
  'com.android.contacts': 'Contacts',
  'com.android.mms': 'Messages',
  'com.android.calculator2': 'Calculator',
  'com.android.deskclock': 'Clock',

  // Custom & Project
  'com.opxmirza.car_maintenance_log': 'Car Maintenance Log',
  'com.guardianx.app': 'GuardianX'
};

function formatIdentifier(identifier) {
  if (!identifier) return 'App';
  // Split underscores, dashes, dots, or camelCase
  const normalized = identifier
    .replace(/[_\-\.]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2');

  const words = normalized.split(' ').filter(w => w.trim().length > 0);
  if (words.length === 0) return identifier;

  return words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function resolveAppName(packageName, rawAppName) {
  const pkg = (packageName || '').trim();
  if (!pkg) {
    return (rawAppName || '').trim() || 'Unknown App';
  }

  // 1. Exact dictionary match
  if (KNOWN_PACKAGES[pkg]) {
    return KNOWN_PACKAGES[pkg];
  }

  // 2. Substring matching
  const lowerPkg = pkg.toLowerCase();
  if (lowerPkg.includes('youtube') && lowerPkg.includes('music')) return 'YouTube Music';
  if (lowerPkg.includes('youtube')) return 'YouTube';
  if (lowerPkg.includes('whatsapp')) return 'WhatsApp';
  if (lowerPkg.includes('chrome')) return 'Google Chrome';
  if (lowerPkg.includes('instagram')) return 'Instagram';
  if (lowerPkg.includes('facebook') && lowerPkg.includes('orca')) return 'Messenger';
  if (lowerPkg.includes('facebook')) return 'Facebook';
  if (lowerPkg.includes('tiktok') || lowerPkg.includes('musically')) return 'TikTok';
  if (lowerPkg.includes('snapchat')) return 'Snapchat';
  if (lowerPkg.includes('spotify')) return 'Spotify';
  if (lowerPkg.includes('netflix')) return 'Netflix';
  if (lowerPkg.includes('roblox')) return 'Roblox';
  if (lowerPkg.includes('discord')) return 'Discord';
  if (lowerPkg.includes('telegram')) return 'Telegram';
  if (lowerPkg.includes('twitter') || lowerPkg.includes('.x.')) return 'X (Twitter)';
  if (lowerPkg.includes('maps')) return 'Google Maps';
  if (lowerPkg.includes('gmail') || lowerPkg.includes('.gm')) return 'Gmail';
  if (lowerPkg.includes('play.games')) return 'Google Play Games';
  if (lowerPkg.includes('vending')) return 'Google Play Store';
  if (lowerPkg.includes('settings')) return 'Settings';
  if (lowerPkg.includes('camera')) return 'Camera';
  if (lowerPkg.includes('calculator')) return 'Calculator';
  if (lowerPkg.includes('forest')) return 'Digital Wellbeing';

  // 3. Check if rawAppName is already an authentic title
  const cleanRaw = (rawAppName || '').trim();
  const lastSegment = pkg.split('.').pop();
  if (
    cleanRaw.length > 2 &&
    cleanRaw !== pkg &&
    !cleanRaw.startsWith('com.') &&
    !cleanRaw.includes('_') &&
    !cleanRaw.includes('-') &&
    cleanRaw !== lastSegment
  ) {
    return cleanRaw;
  }

  // 4. Format the identifier
  const target = cleanRaw && cleanRaw !== pkg ? cleanRaw : lastSegment;
  return formatIdentifier(target);
}

module.exports = {
  resolveAppName,
  formatIdentifier,
  KNOWN_PACKAGES
};

