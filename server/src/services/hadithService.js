const MOCK_HADITHS = [
  {
    id: 'h1',
    title: 'Purity and Actions',
    arabic: 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى',
    english: 'Actions are judged by intentions, and every person will get what they intended.',
    urdu: 'اعمال کا دارومدار نیتوں پر ہے اور ہر انسان کے لیے وہی ہے جس کی اس نے نیت کی۔',
    collection: 'Sahih Al-Bukhari',
    book: 'Book of Revelation',
    hadithNumber: 1,
    authenticity: 'Sahih (Muttafaq Alayh)',
    source: 'Sahih Bukhari 1, Sahih Muslim 1907',
    audioUrl: 'https://example.com/audio/hadith_1.mp3'
  },
  {
    id: 'h2',
    title: 'Kindness to Parents & Family',
    arabic: 'خيركم خيركم لأهله وأنا خيركم لأهلي',
    english: 'The best of you are those who are best to their families, and I am the best to my family.',
    urdu: 'تم میں سے بہترین وہ شخص ہے جو اپنے اہل و عیال کے لیے بہترین ہو اور میں اپنے اہل کے لیے بہترین ہوں۔',
    collection: 'Sunan At-Tirmidhi',
    book: 'Book of Virtues',
    hadithNumber: 3895,
    authenticity: 'Sahih (Tirmidhi)',
    source: 'Sunan At-Tirmidhi 3895',
    audioUrl: 'https://example.com/audio/hadith_2.mp3'
  },
  {
    id: 'h3',
    title: 'Seeking Knowledge',
    arabic: 'طلب العلم فريضة على كل مسلم',
    english: 'Seeking knowledge is an obligation upon every Muslim.',
    urdu: 'علم حاصل کرنا ہر مسلمان پر فرض ہے۔',
    collection: 'Sunan Ibn Majah',
    book: 'The Book of the Sunnah',
    hadithNumber: 224,
    authenticity: 'Hasan',
    source: 'Sunan Ibn Majah 224',
    audioUrl: 'https://example.com/audio/hadith_3.mp3'
  },
  {
    id: 'h4',
    title: 'Truthfulness and Integrity',
    arabic: 'عليكم بالصدق فإن الصدق يهدي إلى البر',
    english: 'Adhere to truthfulness, for truthfulness leads to righteousness, and righteousness leads to Paradise.',
    urdu: 'سچائی کو اپناؤ، کیونکہ سچائی نیکی کی طرف ہدایت دیتی ہے اور نیکی جنت کی طرف لے جاتی ہے۔',
    collection: 'Sahih Muslim',
    book: 'The Book of Virtue, Enjoining Good Manners',
    hadithNumber: 2607,
    authenticity: 'Sahih',
    source: 'Sahih Muslim 2607',
    audioUrl: 'https://example.com/audio/hadith_4.mp3'
  }
];

class HadithService {
  static getHadiths() {
    return MOCK_HADITHS;
  }

  static getHadithById(id) {
    return MOCK_HADITHS.find((h) => h.id === id) || MOCK_HADITHS[0];
  }

  static getRandomHadith() {
    const randomIndex = Math.floor(Math.random() * MOCK_HADITHS.length);
    return MOCK_HADITHS[randomIndex];
  }
}

module.exports = HadithService;
