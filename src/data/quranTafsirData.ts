export interface VerseTafsir {
  id: number; // Overall verse index from 1 to 6236
  surahName: string;
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  tafsir: string;
  realLifeExample: string;
  sources: string;
  quizQuestion: string;
  quizOptions: string[];
  correctOptionIndex: number;
  quizExplanation: string;
}

export interface QuizData {
  quizQuestion: string;
  quizOptions: string[];
  correctOptionIndex: number;
  quizExplanation: string;
  providerUsed?: string;
}

export const TOTAL_QURAN_VERSES = 6236;
export const DAILY_GOAL_VERSES = 17;

/**
 * Generates an interactive quiz question on-demand using Gemini -> Groq -> OpenRouter 
 * with 5s delays between failed requests and up to 3 retry iterations.
 */
export async function generateQuizWithCascade(
  verseText: string,
  tafsirText: string,
  surahName: string,
  verseNumber: number,
  onStatusUpdate?: (status: string, providerName: string, iteration: number) => void
): Promise<{ success: boolean; quiz?: QuizData; error?: string }> {
  const googleKey = localStorage.getItem('GOOGLE_API_KEY') || '';
  const openRouterKey = localStorage.getItem('OPENROUTER_API_KEY') || '';
  const groqKey = localStorage.getItem('GROQ_API_KEY') || '';

  const prompt = `الآية الكريمة: ﴿ ${verseText} ﴾
السورة: ${surahName} - رقم الآية: ${verseNumber}
التفسير الميسر المعتمد: ${tafsirText}

قم بإعداد سؤال اختباري تفاعلي ذكي وعالي الجودة لقياس فهم واستيعاب المستفيد للآية والتفسير أعلاه.
المطلوب:
1) سؤال اختباري دقيق ومصاغ بلغة عربية فصيحة.
2) 4 خيارات إجابة متكاملة (خيار واحد صحيح بدقة و3 خيارات خطأ منطقية).
3) تحديد رقم الخيار الصحيح (من 0 إلى 3).
4) شرح مختصر لسبب صحة الخيار الصحيح بناءً على التفسير.

أرجع النتيجة حصراً بصيغة JSON خالية تماماً من أي علامات ماركداون وبدون أي كلام خارجي كالتالي:
{
  "quizQuestion": "...",
  "quizOptions": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
  "correctOptionIndex": 0,
  "quizExplanation": "..."
}`;

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const providers = [
    { key: "google", name: "Gemini (Google AI)" },
    { key: "groq", name: "Groq AI" },
    { key: "openrouter", name: "OpenRouter AI" }
  ];

  const maxRetries = 3;

  for (let iteration = 1; iteration <= maxRetries; iteration++) {
    for (let pIdx = 0; pIdx < providers.length; pIdx++) {
      const provider = providers[pIdx];

      if (onStatusUpdate) {
        onStatusUpdate(
          `جاري إنشاء سؤال الاختبار بواسطة ${provider.name} (المحاولة ${iteration} من ${maxRetries})...`,
          provider.name,
          iteration
        );
      }

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: prompt,
            provider: provider.key,
            googleKey,
            openRouterKey,
            groqKey
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.text) {
            let parsedAI;
            try {
              parsedAI = JSON.parse(data.text);
            } catch {
              const match = data.text.match(/```json\n([\s\S]*?)\n```/);
              if (match) parsedAI = JSON.parse(match[1]);
            }

            if (
              parsedAI &&
              parsedAI.quizQuestion &&
              Array.isArray(parsedAI.quizOptions) &&
              parsedAI.quizOptions.length === 4 &&
              typeof parsedAI.correctOptionIndex === 'number' &&
              parsedAI.correctOptionIndex >= 0 &&
              parsedAI.correctOptionIndex < 4
            ) {
              return {
                success: true,
                quiz: {
                  quizQuestion: parsedAI.quizQuestion,
                  quizOptions: parsedAI.quizOptions,
                  correctOptionIndex: parsedAI.correctOptionIndex,
                  quizExplanation: parsedAI.quizExplanation || "الإجابة الصحيحة مستفادة مباشرة من التفسير الميسر للآية الكريمة.",
                  providerUsed: data.provider || provider.name
                }
              };
            }
          }
        }
      } catch (err) {
        console.warn(`Generation attempt ${iteration} with ${provider.name} failed:`, err);
      }

      // If not the very last provider in the last iteration, wait 5 seconds delay
      if (!(iteration === maxRetries && pIdx === providers.length - 1)) {
        if (onStatusUpdate) {
          onStatusUpdate(
            `لم يستجب خادم ${provider.name}. انتظار 5 ثوانٍ قبل الاتصال بالخادم التالي...`,
            provider.name,
            iteration
          );
        }
        await delay(5000);
      }
    }
  }

  // All 3 retries across all 3 providers failed
  return {
    success: false,
    error: "تعذر الاتصال بجميع خوادم الذكاء الاصطناعي لإنشاء السؤال بعد 3 محاولات متكررة."
  };
}

// In-memory & localStorage cache for fetched verse tafsir data
const verseCache: Map<number, VerseTafsir> = new Map();

// Helper to clean Arabic Surah Name prefix if needed
function cleanSurahName(rawName: string): string {
  if (!rawName) return "السورة";
  return rawName.replace(/^سُورَةُ\s+/, '').replace(/^سورة\s+/, '');
}

/**
 * Dynamic Fetch Function for any verse from 1 to 6236
 * 1. Fetches verse Uthmani text & Al-Muyassar Tafsir from Alquran Cloud API
 * 2. Connects to Gemini API to generate real-life practical example & interactive quiz card
 */
export async function fetchVerseTafsir(verseIndex: number): Promise<VerseTafsir> {
  const safeIndex = Math.max(1, Math.min(verseIndex, TOTAL_QURAN_VERSES));

  // Check in-memory cache
  if (verseCache.has(safeIndex)) {
    return verseCache.get(safeIndex)!;
  }

  // Check localStorage cache
  try {
    const cachedLocal = localStorage.getItem(`sitesec_verse_cache_${safeIndex}`);
    if (cachedLocal) {
      const parsed = JSON.parse(cachedLocal) as VerseTafsir;
      verseCache.set(safeIndex, parsed);
      return parsed;
    }
  } catch {
    // Ignore localStorage read error
  }

  try {
    // Step 1: Parallel Fetch from Al Quran Cloud API
    const [uthmaniRes, muyassarRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/ayah/${safeIndex}/ar.uthmani`),
      fetch(`https://api.alquran.cloud/v1/ayah/${safeIndex}/ar.muyassar`)
    ]);

    const uthmaniData = await uthmaniRes.json();
    const muyassarData = await muyassarRes.json();

    if (!uthmaniRes.ok || !muyassarRes.ok || uthmaniData.code !== 200 || muyassarData.code !== 200) {
      throw new Error("Failed to fetch verse from Alquran Cloud API");
    }

    const verseText = uthmaniData.data.text;
    const tafsirText = muyassarData.data.text;
    const surahName = cleanSurahName(uthmaniData.data.surah.name);
    const surahNumber = uthmaniData.data.surah.number;
    const verseNumber = uthmaniData.data.numberInSurah;

    // Step 2: Use Gemini API to generate practical example & MCQ quiz
    let realLifeExample = `عند قراءة قوله تعالى ﴿${verseText}﴾، يستشعر المسلم عظمة التوجيه الإلهي ويسعى لتطبيق هدى هذه الآية المباركة في تعاملاته اليومية ونيته الصالحة.`;
    let quizQuestion = `ما هو المعنى والمقصد الأساسي الموضح في التفسير الميسر للآية الكريمة (سورة ${surahName} - آية ${verseNumber})؟`;
    let quizOptions = [
      `الامتثال للتوجيه الإلهي وتدبر التفسير الميسر المذكور`,
      `إهمال العمل والاعتماد التام دون أخذ بالأسباب`,
      `القراءة فقط دون تفكر أو استيعاب للمعارف الشرعية`,
      `عدم الاهتمام بدراسة آيات القرآن الكريم`
    ];
    let correctOptionIndex = 0;
    let quizExplanation = `التفسير الميسر يوضح المعنى المباشر للآية ليتدبرها المسلم ويعمل بما فيها من نور وهداية.`;

    try {
      const googleKey = localStorage.getItem('GOOGLE_API_KEY') || '';
      const openRouterKey = localStorage.getItem('OPENROUTER_API_KEY') || '';
      const groqKey = localStorage.getItem('GROQ_API_KEY') || '';

      const prompt = `الآية الكريمة: ﴿ ${verseText} ﴾
السورة: ${surahName} - رقم الآية: ${verseNumber}
التفسير الميسر المعتمد: ${tafsirText}

بناءً على الآية والتفسير أعلاه، قم بإعداد:
1) تطبيق عملي ومثال تربوي واقعي يربط هدى الآية بحياة المسلم اليومية والمعاصرة (في فقرة ملهمة ومختصرة).
2) سؤال اختباري تفاعلي لقياس الفهم والاستيعاب مع 4 خيارات، وتحديد رقم الخيار الصحيح (من 0 إلى 3)، مع شرح مختصر لسبب صحة الخيار.

أرجع النتيجة حصراً بصيغة JSON بدون أي كلام خارجي كالتالي:
{
  "realLifeExample": "...",
  "quizQuestion": "...",
  "quizOptions": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
  "correctOptionIndex": 0,
  "quizExplanation": "..."
}`;

      const aiResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: prompt, googleKey, openRouterKey, groqKey })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        if (aiData.text) {
          let parsedAI;
          try {
            parsedAI = JSON.parse(aiData.text);
          } catch {
            const match = aiData.text.match(/```json\n([\s\S]*?)\n```/);
            if (match) parsedAI = JSON.parse(match[1]);
          }

          if (parsedAI) {
            if (parsedAI.realLifeExample) realLifeExample = parsedAI.realLifeExample;
            if (parsedAI.quizQuestion) quizQuestion = parsedAI.quizQuestion;
            if (Array.isArray(parsedAI.quizOptions) && parsedAI.quizOptions.length === 4) {
              quizOptions = parsedAI.quizOptions;
            }
            if (typeof parsedAI.correctOptionIndex === 'number' && parsedAI.correctOptionIndex >= 0 && parsedAI.correctOptionIndex < 4) {
              correctOptionIndex = parsedAI.correctOptionIndex;
            }
            if (parsedAI.quizExplanation) quizExplanation = parsedAI.quizExplanation;
          }
        }
      }
    } catch (aiErr) {
      console.warn("Gemini AI generation fallback used for verse:", safeIndex, aiErr);
    }

    const result: VerseTafsir = {
      id: safeIndex,
      surahName,
      surahNumber,
      verseNumber,
      arabicText: verseText,
      tafsir: tafsirText,
      realLifeExample,
      sources: "التفسير الميسر (مجمع الملك فهد لطباعة المصحف الشريف) - Alquran Cloud",
      quizQuestion,
      quizOptions,
      correctOptionIndex,
      quizExplanation
    };

    // Save in cache
    verseCache.set(safeIndex, result);
    try {
      localStorage.setItem(`sitesec_verse_cache_${safeIndex}`, JSON.stringify(result));
    } catch {
      // Ignore storage full or quota error
    }

    return result;

  } catch (err) {
    console.error("Error fetching verse:", safeIndex, err);
    // Ultimate fallback object so the application never breaks
    return {
      id: safeIndex,
      surahName: "تفسير القرآن",
      surahNumber: 1,
      verseNumber: safeIndex,
      arabicText: `آية رقم ${safeIndex} من كتاب الله العزيز`,
      tafsir: "تأمل وتفسير ميسر للآية الكريمة، تدعو إلى الإيمان والتقوى والتفكر في آيات الله العزيز الحكيم.",
      realLifeExample: "تطبيق هدى الآية العظيم في الحياة اليومية والمعاملات الأخلاقية العالية.",
      sources: "التفسير الميسر - Alquran Cloud",
      quizQuestion: `ما الغاية الأساسية المستفادة من الآية الكريمة رقم ${safeIndex}؟`,
      quizOptions: [
        "ترسيخ الإيمان والتقوى والعمل الصالح وفق القرآن الكريم",
        "اتباع الظن والهوى بغير هدى",
        "ترك التفكر والتدبر في كتاب الله",
        "إهمال العمل والتعلم"
      ],
      correctOptionIndex: 0,
      quizExplanation: "آيات القرآن الكريم جاءت كلها لهداية البشرية وترسيخ الإيمان والعمل الصالح."
    };
  }
}
