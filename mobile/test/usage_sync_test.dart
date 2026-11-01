import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:guardianx/core/services/api_client.dart';
import 'package:guardianx/core/services/storage_service.dart';
import 'package:guardianx/core/services/usage_stats_service.dart';
import 'package:guardianx/models/app_usage_model.dart';
import 'package:guardianx/providers/usage_provider.dart';
import 'package:guardianx/repositories/usage_repository.dart';

class FakeApiClient extends ApiClient {
  FakeApiClient(super.storageService);

  final List<Map<String, dynamic>> postRequests = [];
  bool shouldThrowOnBatch = false;

  @override
  Future<dynamic> post(
    String endpoint, {
    dynamic body,
    bool withAuth = true,
  }) async {
    if (shouldThrowOnBatch && body != null && body is Map && body.containsKey('usages')) {
      throw ApiException(
        message: 'childId, packageName, appName, and usageDuration are required.',
        statusCode: 400,
      );
    }
    postRequests.add({'endpoint': endpoint, 'body': body});
    return {'success': true};
  }

  @override
  Future<dynamic> get(String endpoint, {bool withAuth = true}) async {
    if (endpoint.contains('/usage/app-usage')) {
      return {'success': true, 'usages': []};
    }
    if (endpoint.contains('/usage/screen-time')) {
      return {'success': true, 'totalDuration': 0};
    }
    return {'success': true};
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late StorageService storageService;
  late FakeApiClient fakeApiClient;
  late UsageRepository usageRepository;

  setUp(() async {
    SharedPreferences.setMockInitialValues({
      'flutter.child_id': '6ae72a9e94e5e0e0a91a9237',
      'flutter.jwt_token': 'test_token',
      'flutter.user_role': 'child',
    });
    final prefs = await SharedPreferences.getInstance();
    storageService = StorageService(prefs);
    fakeApiClient = FakeApiClient(storageService);
    usageRepository = UsageRepository(fakeApiClient);
  });

  group('AppUsageData Serialization & Duration Units', () {
    test('AppUsageData toJson matches MongoDB schema field names', () {
      final data = AppUsageData(
        packageName: 'com.android.chrome',
        appName: 'Google Chrome',
        usageDurationMinutes: 15,
        sessionCount: 2,
      );

      final json = data.toJson();
      expect(json['packageName'], equals('com.android.chrome'));
      expect(json['appName'], equals('Google Chrome'));
      expect(json['usageDuration'], equals(15));
      expect(json['sessionCount'], equals(2));
    });
  });

  group('UsageRepository Defensive Validation', () {
    test('recordUsage skips submission when packageName is empty', () async {
      await usageRepository.recordUsage(
        packageName: '   ',
        appName: 'Chrome',
        usageDuration: 10,
        childId: 'child_123',
      );
      expect(fakeApiClient.postRequests, isEmpty);
    });

    test('recordUsage skips submission when appName is empty', () async {
      await usageRepository.recordUsage(
        packageName: 'com.android.chrome',
        appName: '   ',
        usageDuration: 10,
        childId: 'child_123',
      );
      expect(fakeApiClient.postRequests, isEmpty);
    });

    test('recordUsage skips submission when usageDuration is negative', () async {
      await usageRepository.recordUsage(
        packageName: 'com.android.chrome',
        appName: 'Chrome',
        usageDuration: -5,
        childId: 'child_123',
      );
      expect(fakeApiClient.postRequests, isEmpty);
    });

    test('recordUsage submits valid payload with non-empty fields', () async {
      await usageRepository.recordUsage(
        packageName: 'com.android.chrome',
        appName: 'Google Chrome',
        usageDuration: 20,
        childId: '6ae72a9e94e5e0e0a91a9237',
      );

      expect(fakeApiClient.postRequests, hasLength(1));
      final body = fakeApiClient.postRequests.first['body'];
      expect(body['packageName'], equals('com.android.chrome'));
      expect(body['appName'], equals('Google Chrome'));
      expect(body['usageDuration'], equals(20));
      expect(body['childId'], equals('6ae72a9e94e5e0e0a91a9237'));
    });

    test('recordUsageBatch does not make API call when list is empty', () async {
      await usageRepository.recordUsageBatch(
        usages: [],
        childId: '6ae72a9e94e5e0e0a91a9237',
      );
      expect(fakeApiClient.postRequests, isEmpty);
    });

    test('recordUsageBatch filters out invalid records defensively', () async {
      final mixedList = [
        {'packageName': '', 'appName': 'Invalid Pkg', 'usageDuration': 10},
        {'packageName': 'com.app.no_name', 'appName': ' ', 'usageDuration': 15},
        {'packageName': 'com.app.neg', 'appName': 'Negative', 'usageDuration': -2},
        {'packageName': 'com.android.chrome', 'appName': 'Chrome', 'usageDuration': 12},
      ];

      await usageRepository.recordUsageBatch(
        usages: mixedList,
        childId: '6ae72a9e94e5e0e0a91a9237',
      );

      expect(fakeApiClient.postRequests, hasLength(1));
      final submittedUsages = fakeApiClient.postRequests.first['body']['usages'] as List;
      expect(submittedUsages, hasLength(1));
      expect(submittedUsages.first['packageName'], equals('com.android.chrome'));
      expect(submittedUsages.first['appName'], equals('Chrome'));
      expect(submittedUsages.first['usageDuration'], equals(12));
    });

    test('recordUsageBatch falls back to individual calls when batch endpoint fails', () async {
      fakeApiClient.shouldThrowOnBatch = true;

      final list = [
        {'packageName': 'com.android.chrome', 'appName': 'Chrome', 'usageDuration': 10},
        {'packageName': 'com.whatsapp', 'appName': 'WhatsApp', 'usageDuration': 20},
      ];

      await usageRepository.recordUsageBatch(
        usages: list,
        childId: '6ae72a9e94e5e0e0a91a9237',
      );

      // Should have fallen back and submitted each item individually
      expect(fakeApiClient.postRequests, hasLength(2));
      expect(fakeApiClient.postRequests[0]['body']['packageName'], equals('com.android.chrome'));
      expect(fakeApiClient.postRequests[1]['body']['packageName'], equals('com.whatsapp'));
    });
  });

  group('UsageStatsService App Title Resolution', () {
    test('Resolves known popular apps correctly', () async {
      final service = UsageStatsService();
      final chromeTitle = await service.resolveAppTitle('com.android.chrome', '');
      expect(chromeTitle, equals('Google Chrome'));

      final ytTitle = await service.resolveAppTitle('com.google.android.youtube', '');
      expect(ytTitle, equals('YouTube'));

      final waTitle = await service.resolveAppTitle('com.whatsapp', '');
      expect(waTitle, equals('WhatsApp'));
    });

    test('Falls back to capitalized package suffix for unknown package', () async {
      final service = UsageStatsService();
      final title = await service.resolveAppTitle('com.mycompany.mycoolapp', '');
      expect(title, equals('Mycoolapp'));
    });
  });

  group('UsageProvider Synchronization & State', () {
    test('Resolves childId from StorageService when not passed explicitly', () async {
      final provider = UsageProvider(usageRepository, storageService);
      expect(storageService.childId, equals('6ae72a9e94e5e0e0a91a9237'));
      expect(provider.totalScreenTimeMinutes, equals(0));
      expect(provider.appUsages, isEmpty);
    });

    test('Identifies and tracks consecutive errors to prevent log flooding', () {
      final provider = UsageProvider(usageRepository, storageService);
      expect(provider.consecutiveErrorCount, equals(0));
    });

    test('AppUsageModel handles isBlocked property and copyWith correctly', () {
      final unblocked = AppUsageModel(
        id: '1',
        packageName: 'com.android.chrome',
        appName: 'Chrome',
        usageDuration: 15,
        sessionCount: 1,
        date: '2026-11-01',
      );
      expect(unblocked.isBlocked, isFalse);

      final blocked = unblocked.copyWith(isBlocked: true);
      expect(blocked.isBlocked, isTrue);
      expect(blocked.appName, equals('Chrome'));

      final fromJson = AppUsageModel.fromJson({
        'id': '2',
        'packageName': 'com.tiktok',
        'appName': 'TikTok',
        'usageDuration': 30,
        'isBlocked': true,
      });
      expect(fromJson.isBlocked, isTrue);
    });

    test('UsageProvider updates blocked status optimistically', () async {
      final provider = UsageProvider(usageRepository, storageService);
      expect(provider.isAppBlocked('com.android.chrome'), isFalse);

      final res = await provider.toggleBlockApp(
        childId: '6ae72a9e94e5e0e0a91a9237',
        packageName: 'com.android.chrome',
        appName: 'Chrome',
        isBlocked: true,
      );
      expect(res, isTrue);
      expect(provider.isAppBlocked('com.android.chrome'), isTrue);

      final unblockRes = await provider.toggleBlockApp(
        childId: '6ae72a9e94e5e0e0a91a9237',
        packageName: 'com.android.chrome',
        appName: 'Chrome',
        isBlocked: false,
      );
      expect(unblockRes, isTrue);
      expect(provider.isAppBlocked('com.android.chrome'), isFalse);
    });
  });
}
