import 'package:flutter/material.dart';
import '../models/child_profile_model.dart';
import '../repositories/child_repository.dart';

class ChildProvider with ChangeNotifier {
  final ChildRepository _childRepository;

  List<ChildProfileModel> _children = [];
  ChildProfileModel? _selectedChild;
  bool _isLoading = false;
  String? _error;

  ChildProvider(this._childRepository);

  List<ChildProfileModel> get children => _children;
  ChildProfileModel? get selectedChild => _selectedChild;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchChildren() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _children = await _childRepository.getChildren();
      if (_children.isNotEmpty && _selectedChild == null) {
        _selectedChild = _children.first;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectChild(ChildProfileModel child) {
    _selectedChild = child;
    notifyListeners();
  }

  Future<bool> createChild(String name, {DateTime? dateOfBirth}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final newChild = await _childRepository.createChild(name, dateOfBirth: dateOfBirth);
      _children.add(newChild);
      _selectedChild = newChild;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
