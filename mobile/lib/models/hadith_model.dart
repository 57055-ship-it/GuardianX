class HadithModel {
  final String id;
  final String title;
  final String arabic;
  final String english;
  final String urdu;
  final String collection;
  final String book;
  final int hadithNumber;
  final String authenticity;
  final String source;
  final String? audioUrl;

  HadithModel({
    required this.id,
    required this.title,
    required this.arabic,
    required this.english,
    required this.urdu,
    required this.collection,
    required this.book,
    required this.hadithNumber,
    required this.authenticity,
    required this.source,
    this.audioUrl,
  });

  factory HadithModel.fromJson(Map<String, dynamic> json) {
    return HadithModel(
      id: json['id'] ?? json['_id'] ?? '',
      title: json['title'] ?? '',
      arabic: json['arabic'] ?? '',
      english: json['english'] ?? '',
      urdu: json['urdu'] ?? '',
      collection: json['collection'] ?? '',
      book: json['book'] ?? '',
      hadithNumber: json['hadithNumber'] ?? 1,
      authenticity: json['authenticity'] ?? 'Sahih',
      source: json['source'] ?? '',
      audioUrl: json['audioUrl'],
    );
  }
}
