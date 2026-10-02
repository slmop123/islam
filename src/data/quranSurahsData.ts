export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  type: 'مكية' | 'مدنية';
  versesCount: number;
  startGlobalVerseId: number;
}

export const QURAN_SURAHS: SurahMeta[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatiha", type: "مكية", versesCount: 7, startGlobalVerseId: 1 },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", type: "مدنية", versesCount: 286, startGlobalVerseId: 8 },
  { number: 3, name: "آل عمران", englishName: "Aal-Imran", type: "مدنية", versesCount: 200, startGlobalVerseId: 294 },
  { number: 4, name: "النساء", englishName: "An-Nisa", type: "مدنية", versesCount: 176, startGlobalVerseId: 494 },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", type: "مدنية", versesCount: 120, startGlobalVerseId: 670 },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", type: "مكية", versesCount: 165, startGlobalVerseId: 790 },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", type: "مكية", versesCount: 206, startGlobalVerseId: 955 },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", type: "مدنية", versesCount: 75, startGlobalVerseId: 1161 },
  { number: 9, name: "التوبة", englishName: "At-Tawbah", type: "مدنية", versesCount: 129, startGlobalVerseId: 1236 },
  { number: 10, name: "يونس", englishName: "Yunus", type: "مكية", versesCount: 109, startGlobalVerseId: 1365 },
  { number: 11, name: "هود", englishName: "Hud", type: "مكية", versesCount: 123, startGlobalVerseId: 1474 },
  { number: 12, name: "يوسف", englishName: "Yusuf", type: "مكية", versesCount: 111, startGlobalVerseId: 1597 },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", type: "مدنية", versesCount: 43, startGlobalVerseId: 1708 },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", type: "مكية", versesCount: 52, startGlobalVerseId: 1751 },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", type: "مكية", versesCount: 99, startGlobalVerseId: 1803 },
  { number: 16, name: "النحل", englishName: "An-Nahl", type: "مكية", versesCount: 128, startGlobalVerseId: 1902 },
  { number: 17, name: "الإسراء", englishName: "Al-Isra", type: "مكية", versesCount: 111, startGlobalVerseId: 2030 },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", type: "مكية", versesCount: 110, startGlobalVerseId: 2141 },
  { number: 19, name: "مريم", englishName: "Maryam", type: "مكية", versesCount: 98, startGlobalVerseId: 2251 },
  { number: 20, name: "طه", englishName: "Taha", type: "مكية", versesCount: 135, startGlobalVerseId: 2349 },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiya", type: "مكية", versesCount: 112, startGlobalVerseId: 2484 },
  { number: 22, name: "الحج", englishName: "Al-Hajj", type: "مدنية", versesCount: 78, startGlobalVerseId: 2596 },
  { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun", type: "مكية", versesCount: 118, startGlobalVerseId: 2674 },
  { number: 24, name: "النور", englishName: "An-Nur", type: "مدنية", versesCount: 64, startGlobalVerseId: 2792 },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan", type: "مكية", versesCount: 77, startGlobalVerseId: 2856 },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara", type: "مكية", versesCount: 227, startGlobalVerseId: 2933 },
  { number: 27, name: "النمل", englishName: "An-Naml", type: "مكية", versesCount: 93, startGlobalVerseId: 3160 },
  { number: 28, name: "القصص", englishName: "Al-Qasas", type: "مكية", versesCount: 88, startGlobalVerseId: 3253 },
  { number: 29, name: "العنكبوت", englishName: "Al-Ankabut", type: "مكية", versesCount: 69, startGlobalVerseId: 3341 },
  { number: 30, name: "الروم", englishName: "Ar-Rum", type: "مكية", versesCount: 60, startGlobalVerseId: 3410 },
  { number: 31, name: "لقمان", englishName: "Luqman", type: "مكية", versesCount: 34, startGlobalVerseId: 3470 },
  { number: 32, name: "السجدة", englishName: "As-Sajdah", type: "مكية", versesCount: 30, startGlobalVerseId: 3504 },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab", type: "مدنية", versesCount: 73, startGlobalVerseId: 3534 },
  { number: 34, name: "سبأ", englishName: "Saba", type: "مكية", versesCount: 54, startGlobalVerseId: 3607 },
  { number: 35, name: "فاطر", englishName: "Fatir", type: "مكية", versesCount: 45, startGlobalVerseId: 3661 },
  { number: 36, name: "يس", englishName: "Ya-Sin", type: "مكية", versesCount: 83, startGlobalVerseId: 3706 },
  { number: 37, name: "الصافات", englishName: "As-Saffat", type: "مكية", versesCount: 182, startGlobalVerseId: 3789 },
  { number: 38, name: "ص", englishName: "Sad", type: "مكية", versesCount: 88, startGlobalVerseId: 3971 },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", type: "مكية", versesCount: 75, startGlobalVerseId: 4059 },
  { number: 40, name: "غافر", englishName: "Ghafir", type: "مكية", versesCount: 85, startGlobalVerseId: 4134 },
  { number: 41, name: "فصلت", englishName: "Fussilat", type: "مكية", versesCount: 54, startGlobalVerseId: 4219 },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", type: "مكية", versesCount: 53, startGlobalVerseId: 4273 },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", type: "مكية", versesCount: 89, startGlobalVerseId: 4326 },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan", type: "مكية", versesCount: 59, startGlobalVerseId: 4415 },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiyah", type: "مكية", versesCount: 37, startGlobalVerseId: 4474 },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", type: "مكية", versesCount: 35, startGlobalVerseId: 4511 },
  { number: 47, name: "محمد", englishName: "Muhammad", type: "مدنية", versesCount: 38, startGlobalVerseId: 4546 },
  { number: 48, name: "الفتح", englishName: "Al-Fath", type: "مدنية", versesCount: 29, startGlobalVerseId: 4584 },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat", type: "مدنية", versesCount: 18, startGlobalVerseId: 4613 },
  { number: 50, name: "ق", englishName: "Qaf", type: "مكية", versesCount: 45, startGlobalVerseId: 4631 },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat", type: "مكية", versesCount: 60, startGlobalVerseId: 4676 },
  { number: 52, name: "الطور", englishName: "At-Tur", type: "مكية", versesCount: 49, startGlobalVerseId: 4736 },
  { number: 53, name: "النجم", englishName: "An-Najm", type: "مكية", versesCount: 62, startGlobalVerseId: 4785 },
  { number: 54, name: "القمر", englishName: "Al-Qamar", type: "مكية", versesCount: 55, startGlobalVerseId: 4847 },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", type: "مدنية", versesCount: 78, startGlobalVerseId: 4902 },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'ah", type: "مكية", versesCount: 96, startGlobalVerseId: 4980 },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", type: "مدنية", versesCount: 29, startGlobalVerseId: 5076 },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadila", type: "مدنية", versesCount: 22, startGlobalVerseId: 5105 },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", type: "مدنية", versesCount: 24, startGlobalVerseId: 5127 },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahanah", type: "مدنية", versesCount: 13, startGlobalVerseId: 5151 },
  { number: 61, name: "الصف", englishName: "As-Saff", type: "مدنية", versesCount: 14, startGlobalVerseId: 5164 },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'ah", type: "مدنية", versesCount: 11, startGlobalVerseId: 5178 },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun", type: "مدنية", versesCount: 11, startGlobalVerseId: 5189 },
  { number: 64, name: "التغابن", englishName: "At-Taghabun", type: "مدنية", versesCount: 18, startGlobalVerseId: 5200 },
  { number: 65, name: "الطلاق", englishName: "At-Talaq", type: "مدنية", versesCount: 12, startGlobalVerseId: 5218 },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", type: "مدنية", versesCount: 12, startGlobalVerseId: 5230 },
  { number: 67, name: "الملك", englishName: "Al-Mulk", type: "مكية", versesCount: 30, startGlobalVerseId: 5242 },
  { number: 68, name: "القلم", englishName: "Al-Qalam", type: "مكية", versesCount: 52, startGlobalVerseId: 5272 },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqah", type: "مكية", versesCount: 52, startGlobalVerseId: 5324 },
  { number: 70, name: "المعارج", englishName: "Al-Ma'arij", type: "مكية", versesCount: 44, startGlobalVerseId: 5376 },
  { number: 71, name: "نوح", englishName: "Nuh", type: "مكية", versesCount: 28, startGlobalVerseId: 5420 },
  { number: 72, name: "الجن", englishName: "Al-Jinn", type: "مكية", versesCount: 28, startGlobalVerseId: 5448 },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", type: "مكية", versesCount: 20, startGlobalVerseId: 5476 },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", type: "مكية", versesCount: 56, startGlobalVerseId: 5496 },
  { number: 75, name: "القيامة", englishName: "Al-Qiyamah", type: "مكية", versesCount: 40, startGlobalVerseId: 5552 },
  { number: 76, name: "الإنسان", englishName: "Al-Insan", type: "مدنية", versesCount: 31, startGlobalVerseId: 5592 },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat", type: "مكية", versesCount: 50, startGlobalVerseId: 5623 },
  { number: 78, name: "النبأ", englishName: "An-Naba", type: "مكية", versesCount: 40, startGlobalVerseId: 5673 },
  { number: 79, name: "النازعات", englishName: "An-Nazi'at", type: "مكية", versesCount: 46, startGlobalVerseId: 5713 },
  { number: 80, name: "عبس", englishName: "Abasa", type: "مكية", versesCount: 42, startGlobalVerseId: 5759 },
  { number: 81, name: "التكوير", englishName: "At-Takwir", type: "مكية", versesCount: 29, startGlobalVerseId: 5801 },
  { number: 82, name: "الانفطار", englishName: "Al-Infitar", type: "مكية", versesCount: 19, startGlobalVerseId: 5830 },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", type: "مكية", versesCount: 36, startGlobalVerseId: 5849 },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaq", type: "مكية", versesCount: 25, startGlobalVerseId: 5885 },
  { number: 85, name: "البروج", englishName: "Al-Buruj", type: "مكية", versesCount: 22, startGlobalVerseId: 5910 },
  { number: 86, name: "الطارق", englishName: "At-Tariq", type: "مكية", versesCount: 17, startGlobalVerseId: 5932 },
  { number: 87, name: "الأعلى", englishName: "Al-A'la", type: "مكية", versesCount: 19, startGlobalVerseId: 5949 },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiyah", type: "مكية", versesCount: 26, startGlobalVerseId: 5968 },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", type: "مكية", versesCount: 30, startGlobalVerseId: 5994 },
  { number: 90, name: "البلد", englishName: "Al-Balad", type: "مكية", versesCount: 20, startGlobalVerseId: 6024 },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", type: "مكية", versesCount: 15, startGlobalVerseId: 6044 },
  { number: 92, name: "الليل", englishName: "Al-Layl", type: "مكية", versesCount: 21, startGlobalVerseId: 6059 },
  { number: 93, name: "الضحى", englishName: "Ad-Duha", type: "مكية", versesCount: 11, startGlobalVerseId: 6080 },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", type: "مكية", versesCount: 8, startGlobalVerseId: 6091 },
  { number: 95, name: "التين", englishName: "At-Tin", type: "مكية", versesCount: 8, startGlobalVerseId: 6099 },
  { number: 96, name: "العلق", englishName: "Al-Alaq", type: "مكية", versesCount: 19, startGlobalVerseId: 6107 },
  { number: 97, name: "القدر", englishName: "Al-Qadr", type: "مكية", versesCount: 5, startGlobalVerseId: 6126 },
  { number: 98, name: "البينة", englishName: "Al-Bayyinah", type: "مدنية", versesCount: 8, startGlobalVerseId: 6131 },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah", type: "مدنية", versesCount: 8, startGlobalVerseId: 6139 },
  { number: 100, name: "العاديات", englishName: "Al-Adiyat", type: "مكية", versesCount: 11, startGlobalVerseId: 6147 },
  { number: 101, name: "القارعة", englishName: "Al-Qari'ah", type: "مكية", versesCount: 11, startGlobalVerseId: 6158 },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", type: "مكية", versesCount: 8, startGlobalVerseId: 6169 },
  { number: 103, name: "العصر", englishName: "Al-Asr", type: "مكية", versesCount: 3, startGlobalVerseId: 6177 },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah", type: "مكية", versesCount: 9, startGlobalVerseId: 6180 },
  { number: 105, name: "الفيل", englishName: "Al-Fil", type: "مكية", versesCount: 5, startGlobalVerseId: 6189 },
  { number: 106, name: "قريش", englishName: "Quraysh", type: "مكية", versesCount: 4, startGlobalVerseId: 6194 },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", type: "مكية", versesCount: 7, startGlobalVerseId: 6198 },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", type: "مكية", versesCount: 3, startGlobalVerseId: 6205 },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", type: "مكية", versesCount: 6, startGlobalVerseId: 6208 },
  { number: 110, name: "النصر", englishName: "An-Nasr", type: "مدنية", versesCount: 3, startGlobalVerseId: 6214 },
  { number: 111, name: "المسد", englishName: "Al-Masad", type: "مكية", versesCount: 5, startGlobalVerseId: 6217 },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", type: "مكية", versesCount: 4, startGlobalVerseId: 6222 },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", type: "مكية", versesCount: 5, startGlobalVerseId: 6226 },
  { number: 114, name: "الناس", englishName: "An-Nas", type: "مكية", versesCount: 6, startGlobalVerseId: 6231 }
];

/**
 * Calculates global verse index (1..6236) given a surah number (1..114) and verse number inside the surah (1..versesCount)
 */
export function getGlobalVerseId(surahNumber: number, verseInSurah: number): number {
  const surah = QURAN_SURAHS.find(s => s.number === surahNumber);
  if (!surah) return 1;
  const safeVerse = Math.max(1, Math.min(verseInSurah, surah.versesCount));
  return surah.startGlobalVerseId + safeVerse - 1;
}

/**
 * Given a global verse index (1..6236), returns the surah meta and the relative verse number in that surah
 */
export function getSurahAndVerseByGlobalId(globalVerseId: number): { surah: SurahMeta; verseInSurah: number } {
  const safeId = Math.max(1, Math.min(globalVerseId, 6236));
  for (let i = QURAN_SURAHS.length - 1; i >= 0; i--) {
    const s = QURAN_SURAHS[i];
    if (safeId >= s.startGlobalVerseId) {
      const verseInSurah = safeId - s.startGlobalVerseId + 1;
      return { surah: s, verseInSurah };
    }
  }
  return { surah: QURAN_SURAHS[0], verseInSurah: 1 };
}
