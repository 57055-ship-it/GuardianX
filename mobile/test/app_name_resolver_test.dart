import 'package:flutter_test/flutter_test.dart';
import 'package:guardianx/core/utils/app_name_resolver.dart';

void main() {
  group('AppNameResolver', () {
    test('Resolves canonical Google packages to official names', () {
      expect(AppNameResolver.resolve('com.android.chrome'), 'Google Chrome');
      expect(AppNameResolver.resolve('com.google.android.apps.chrome'), 'Google Chrome');
      expect(AppNameResolver.resolve('com.android.vending'), 'Google Play Store');
      expect(AppNameResolver.resolve('com.google.android.finsky'), 'Google Play Store');
      expect(AppNameResolver.resolve('com.google.android.youtube'), 'YouTube');
      expect(AppNameResolver.resolve('com.google.android.apps.youtube.music'), 'YouTube Music');
      expect(AppNameResolver.resolve('com.google.android.gm'), 'Gmail');
      expect(AppNameResolver.resolve('com.google.android.apps.maps'), 'Google Maps');
      expect(AppNameResolver.resolve('com.google.android.play.games'), 'Google Play Games');
    });

    test('Resolves popular social packages', () {
      expect(AppNameResolver.resolve('com.whatsapp'), 'WhatsApp');
      expect(AppNameResolver.resolve('com.instagram.android'), 'Instagram');
      expect(AppNameResolver.resolve('com.facebook.katana'), 'Facebook');
      expect(AppNameResolver.resolve('com.facebook.orca'), 'Messenger');
      expect(AppNameResolver.resolve('com.snapchat.android'), 'Snapchat');
      expect(AppNameResolver.resolve('com.spotify.music'), 'Spotify');
      expect(AppNameResolver.resolve('com.netflix.mediaclient'), 'Netflix');
      expect(AppNameResolver.resolve('com.roblox.client'), 'Roblox');
      expect(AppNameResolver.resolve('com.discord'), 'Discord');
      expect(AppNameResolver.resolve('org.telegram.messenger'), 'Telegram');
    });

    test('Resolves Samsung and standard Android system packages', () {
      expect(AppNameResolver.resolve('com.android.settings'), 'Settings');
      expect(AppNameResolver.resolve('com.sec.android.app.camera'), 'Camera');
      expect(AppNameResolver.resolve('com.samsung.android.forest'), 'Digital Wellbeing');
    });

    test('Resolves custom and university project packages', () {
      expect(AppNameResolver.resolve('com.opxmirza.car_maintenance_log'), 'Car Maintenance Log');
      expect(AppNameResolver.resolve('com.guardianx.app'), 'GuardianX');
    });

    test('Overrides raw package-segment appName with official name', () {
      // app_usage package returns last segment e.g. "chrome", "vending", "gm"
      expect(AppNameResolver.resolve('com.android.chrome', 'chrome'), 'Google Chrome');
      expect(AppNameResolver.resolve('com.android.vending', 'vending'), 'Google Play Store');
      expect(AppNameResolver.resolve('com.google.android.gm', 'gm'), 'Gmail');
    });

    test('Correctly formats custom identifiers with underscores and camelCase', () {
      expect(AppNameResolver.formatIdentifierToTitle('car_maintenance_log'), 'Car Maintenance Log');
      expect(AppNameResolver.formatIdentifierToTitle('subwaySurfers'), 'Subway Surfers');
      expect(AppNameResolver.formatIdentifierToTitle('daily_step_counter'), 'Daily Step Counter');
    });

    test('Handles edge cases gracefully', () {
      expect(AppNameResolver.resolve(''), 'Unknown App');
      expect(AppNameResolver.resolve('', 'Custom Title'), 'Custom Title');
    });
  });
}

