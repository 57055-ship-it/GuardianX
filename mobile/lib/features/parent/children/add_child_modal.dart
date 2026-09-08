import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/child_provider.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_text_field.dart';

class AddChildModal extends StatefulWidget {
  const AddChildModal({super.key});

  @override
  State<AddChildModal> createState() => _AddChildModalState();
}

class _AddChildModalState extends State<AddChildModal> {
  final _nameController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final childProvider = Provider.of<ChildProvider>(context, listen: false);
    final success = await childProvider.createChild(_nameController.text.trim());

    if (success && mounted) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Child profile created! Generate pairing code to link device.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final childProvider = Provider.of<ChildProvider>(context);

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        left: 20,
        right: 20,
        top: 20,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Add Child Profile',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (childProvider.error != null) ...[
              Text(
                childProvider.error!,
                style: const TextStyle(color: Colors.red, fontSize: 12),
              ),
              const SizedBox(height: 12),
            ],
            CustomTextField(
              controller: _nameController,
              label: "Child's Name",
              hint: 'e.g. Ali, Sara',
              prefixIcon: const Icon(Icons.person),
              validator: (val) => val == null || val.isEmpty ? 'Please enter name' : null,
            ),
            const SizedBox(height: 20),
            CustomButton(
              text: 'Save Child Profile',
              onPressed: _submit,
              isLoading: childProvider.isLoading,
            ),
          ],
        ),
      ),
    );
  }
}
