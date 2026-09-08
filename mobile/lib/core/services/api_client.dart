import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';
import 'storage_service.dart';

class ApiException implements Exception {
  final String message;
  final int statusCode;
  final dynamic data;

  ApiException({required this.message, this.statusCode = 500, this.data});

  @override
  String toString() => message;
}

class ApiClient {
  final StorageService _storageService;
  final http.Client _client;

  ApiClient(this._storageService, {http.Client? client})
      : _client = client ?? http.Client();

  String get _baseUrl => ApiConstants.baseUrl;

  Map<String, String> _headers({bool withAuth = true}) {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (withAuth && _storageService.token != null) {
      headers['Authorization'] = 'Bearer ${_storageService.token}';
    }
    return headers;
  }

  dynamic _processResponse(http.Response response) {
    dynamic jsonBody;
    try {
      jsonBody = jsonDecode(response.body);
    } catch (_) {
      jsonBody = response.body;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonBody;
    } else {
      String message = 'An unexpected server error occurred.';
      if (jsonBody is Map<String, dynamic> && jsonBody['message'] != null) {
        message = jsonBody['message'];
      }
      throw ApiException(
        message: message,
        statusCode: response.statusCode,
        data: jsonBody,
      );
    }
  }

  Future<dynamic> get(String path, {bool withAuth = true}) async {
    try {
      final url = Uri.parse('$_baseUrl$path');
      final response = await _client.get(url, headers: _headers(withAuth: withAuth));
      return _processResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(message: 'Network error: Unable to connect to server.');
    }
  }

  Future<dynamic> post(String path, {dynamic body, bool withAuth = true}) async {
    try {
      final url = Uri.parse('$_baseUrl$path');
      final response = await _client.post(
        url,
        headers: _headers(withAuth: withAuth),
        body: body != null ? jsonEncode(body) : null,
      );
      return _processResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(message: 'Network error: Unable to connect to server.');
    }
  }

  Future<dynamic> put(String path, {dynamic body, bool withAuth = true}) async {
    try {
      final url = Uri.parse('$_baseUrl$path');
      final response = await _client.put(
        url,
        headers: _headers(withAuth: withAuth),
        body: body != null ? jsonEncode(body) : null,
      );
      return _processResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(message: 'Network error: Unable to connect to server.');
    }
  }

  Future<dynamic> delete(String path, {bool withAuth = true}) async {
    try {
      final url = Uri.parse('$_baseUrl$path');
      final response = await _client.delete(url, headers: _headers(withAuth: withAuth));
      return _processResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(message: 'Network error: Unable to connect to server.');
    }
  }
}
