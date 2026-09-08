import 'package:flutter/material.dart';
import '../models/safety_insight_model.dart';
import '../repositories/report_repository.dart';

class ReportProvider with ChangeNotifier {
  final ReportRepository _reportRepository;

  Map<String, dynamic>? _dailyReport;
  Map<String, dynamic>? _weeklyReport;
  List<SafetyInsightModel> _insights = [];
  bool _isLoading = false;
  String? _error;

  ReportProvider(this._reportRepository);

  Map<String, dynamic>? get dailyReport => _dailyReport;
  Map<String, dynamic>? get weeklyReport => _weeklyReport;
  List<SafetyInsightModel> get insights => _insights;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get calculatedSafetyScore {
    int score = 100;
    for (final insight in _insights) {
      if (insight.severity == 'critical') {
        score -= 25;
      } else if (insight.severity == 'high') {
        score -= 15;
      } else if (insight.severity == 'medium') {
        score -= 10;
      }
    }
    return score.clamp(0, 100);
  }

  Future<void> fetchReportsAndInsights(String childId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _dailyReport = await _reportRepository.getDailyReport(childId);
      _weeklyReport = await _reportRepository.getWeeklyReport(childId);
      _insights = await _reportRepository.getSafetyInsights(childId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
