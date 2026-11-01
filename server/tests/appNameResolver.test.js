const { resolveAppName, formatIdentifier, KNOWN_PACKAGES } = require('../src/utils/appNameResolver');

describe('AppNameResolver Backend Utility', () => {
  test('Resolves official Google applications', () => {
    expect(resolveAppName('com.android.chrome', 'chrome')).toBe('Google Chrome');
    expect(resolveAppName('com.android.vending', 'vending')).toBe('Google Play Store');
    expect(resolveAppName('com.google.android.youtube')).toBe('YouTube');
    expect(resolveAppName('com.google.android.gm', 'gm')).toBe('Gmail');
    expect(resolveAppName('com.google.android.apps.maps')).toBe('Google Maps');
    expect(resolveAppName('com.google.android.play.games')).toBe('Google Play Games');
  });

  test('Resolves popular social media applications', () => {
    expect(resolveAppName('com.whatsapp')).toBe('WhatsApp');
    expect(resolveAppName('com.instagram.android')).toBe('Instagram');
    expect(resolveAppName('com.facebook.katana')).toBe('Facebook');
    expect(resolveAppName('com.facebook.orca')).toBe('Messenger');
    expect(resolveAppName('com.spotify.music')).toBe('Spotify');
    expect(resolveAppName('com.netflix.mediaclient')).toBe('Netflix');
    expect(resolveAppName('com.roblox.client')).toBe('Roblox');
    expect(resolveAppName('com.discord')).toBe('Discord');
  });

  test('Resolves Samsung and system applications', () => {
    expect(resolveAppName('com.android.settings')).toBe('Settings');
    expect(resolveAppName('com.sec.android.app.camera')).toBe('Camera');
    expect(resolveAppName('com.samsung.android.forest')).toBe('Digital Wellbeing');
  });

  test('Resolves custom and university project packages', () => {
    expect(resolveAppName('com.opxmirza.car_maintenance_log')).toBe('Car Maintenance Log');
    expect(resolveAppName('com.guardianx.app')).toBe('GuardianX');
  });

  test('Formats identifiers correctly with underscores and camelCase', () => {
    expect(formatIdentifier('car_maintenance_log')).toBe('Car Maintenance Log');
    expect(formatIdentifier('subwaySurfers')).toBe('Subway Surfers');
    expect(formatIdentifier('my_daily_planner')).toBe('My Daily Planner');
  });

  test('Gracefully handles edge cases', () => {
    expect(resolveAppName('')).toBe('Unknown App');
    expect(resolveAppName('', 'Custom App')).toBe('Custom App');
  });
});

