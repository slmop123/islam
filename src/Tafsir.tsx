import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Play, 
  RotateCcw, 
  Award, 
  BookMarked,
  HelpCircle,
  Zap,
  Info,
  Server,
  RefreshCw,
  List,
  Search,
  Grid,
  ChevronDown,
  X,
  ArrowRight,
  Hash,
  Bookmark
} from 'lucide-react';
import { 
  VerseTafsir, 
  QuizData,
  TOTAL_QURAN_VERSES, 
  TOTAL_MADINAH_PAGES,
  DAILY_GOAL_VERSES, 
  fetchVerseTafsir,
  generateQuizWithCascade
} from './data/quranTafsirData';
import { 
  QURAN_SURAHS, 
  SurahMeta, 
  getGlobalVerseId, 
  getSurahAndVerseByGlobalId 
} from './data/quranSurahsData';
import {
  isVerseSaved,
  saveTafsir,
  removeSavedTafsir
} from './data/savedTafsirStorage';

// Helper function to calculate today and tomorrow date strings
function getTodayDateInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowDay = tomorrow.getDate();
  const tomorrowMonth = tomorrow.getMonth() + 1;

  const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const formattedToday = `${day} شهر ${month}`;
  const formattedTomorrow = `${tomorrowDay} شهر ${tomorrowMonth}`;

  return { key, formattedToday, formattedTomorrow, dateObj: now };
}

export default function TafsirPage() {
  // Date lock state persistence
  const [lastCompletedDateKey, setLastCompletedDateKey] = useState<string | null>(() => {
    return localStorage.getItem('sitesec_tafsir_last_completed_date');
  });

  const [lastCompletedArabic, setLastCompletedArabic] = useState<string>(() => {
    return localStorage.getItem('sitesec_tafsir_last_completed_arabic') || '';
  });

  const [nextUnlockedArabic, setNextUnlockedArabic] = useState<string>(() => {
    return localStorage.getItem('sitesec_tafsir_next_unlocked_arabic') || '';
  });

  const [adminOverrideUnlocked, setAdminOverrideUnlocked] = useState<boolean>(false);

  // Time remaining until midnight for next session
  const [timeToMidnight, setTimeToMidnight] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });

  // Persistence state
  const [completedVerseIds, setCompletedVerseIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('sitesec_tafsir_completed');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(() => {
    const saved = localStorage.getItem('sitesec_tafsir_current_idx');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [hasAcknowledgedNotice, setHasAcknowledgedNotice] = useState<boolean>(() => {
    return localStorage.getItem('sitesec_tafsir_notice_ack') === 'true';
  });

  // Active Journey State
  const [journeyStarted, setJourneyStarted] = useState<boolean>(false);
  const [currentVerse, setCurrentVerse] = useState<VerseTafsir | null>(null);
  const [loadingVerse, setLoadingVerse] = useState<boolean>(false);

  // Dynamic Quiz State
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [quizGeneratingStatus, setQuizGeneratingStatus] = useState<string>('');
  const [quizGenerationError, setQuizGenerationError] = useState<string | null>(null);

  // Stage of current verse learning: 'card' | 'timer' | 'quiz_generating' | 'quiz' | 'server_error' | 'result_success' | 'result_fail'
  const [verseStage, setVerseStage] = useState<'card' | 'timer' | 'quiz_generating' | 'quiz' | 'server_error' | 'result_success' | 'result_fail'>('card');

  // Quran Surahs & Verse Index Modal State
  const [showQuranIndexModal, setShowQuranIndexModal] = useState<boolean>(false);
  const [selectedSurahForPicker, setSelectedSurahForPicker] = useState<SurahMeta | null>(null);
  const [surahSearchQuery, setSurahSearchQuery] = useState<string>('');
  const [surahTypeFilter, setSurahTypeFilter] = useState<'all' | 'مكية' | 'مدنية'>('all');
  const [jumpVerseInput, setJumpVerseInput] = useState<string>('');
  
  // Timer State (15 seconds countdown)
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  
  // Quiz Selection State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [todayCompletedCount, setTodayCompletedCount] = useState<number>(0);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);

  // Fixed Daily Goal: 17 verses (equal to the 17 obligatory Rak'ahs of the 5 daily prayers)
  const dailyTargetCount = DAILY_GOAL_VERSES;

  // Personal Gallery Save State
  const [searchParams] = useSearchParams();
  const [isSavedInGallery, setIsSavedInGallery] = useState<boolean>(false);
  const [saveToastMessage, setSaveToastMessage] = useState<string | null>(null);

  // Evidence from Tafsir toggle
  const [showTafsirEvidence, setShowTafsirEvidence] = useState<boolean>(false);

  // Sync saved status whenever currentVerse changes
  useEffect(() => {
    if (currentVerse) {
      setIsSavedInGallery(isVerseSaved(currentVerse.id));
    }
    setShowTafsirEvidence(false);
  }, [currentVerse]);

  // Handle URL query parameter ?verse=123 (e.g. navigation from Personal Gallery)
  useEffect(() => {
    const verseParam = searchParams.get('verse');
    if (verseParam) {
      const parsed = parseInt(verseParam, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= TOTAL_QURAN_VERSES) {
        setCurrentVerseIndex(parsed);
        setJourneyStarted(true);
        setVerseStage('card');
      }
    }
  }, [searchParams]);

  const handleToggleSaveToGallery = () => {
    if (!currentVerse) return;
    if (isSavedInGallery) {
      removeSavedTafsir(currentVerse.id);
      setIsSavedInGallery(false);
      setSaveToastMessage('تمت إزالة الآية من المعرض الشخصي');
    } else {
      saveTafsir({
        id: `verse-${currentVerse.id}`,
        verseId: currentVerse.id,
        surahNumber: currentVerse.surahNumber,
        surahName: currentVerse.surahName,
        verseNumber: currentVerse.verseNumber,
        arabicText: currentVerse.arabicText,
        tafsir: currentVerse.tafsir,
        realLifeExample: currentVerse.realLifeExample,
        tafsirEvidence: currentVerse.tafsirEvidence,
        sources: currentVerse.sources,
        savedAt: new Date().toISOString()
      });
      setIsSavedInGallery(true);
      setSaveToastMessage('تم حفظ الآية وتفسيرها ومثالها في المعرض الشخصي بنجاح! ✨');
    }

    setTimeout(() => {
      setSaveToastMessage(null);
    }, 3500);
  };

  // Load current verse when index changes or journey starts
  useEffect(() => {
    let isMounted = true;
    const loadVerse = async () => {
      setLoadingVerse(true);
      setCurrentQuiz(null);
      const verseData = await fetchVerseTafsir(currentVerseIndex);
      if (isMounted) {
        setCurrentVerse(verseData);
        setLoadingVerse(false);
      }
    };
    loadVerse();

    return () => { isMounted = false; };
  }, [currentVerseIndex]);

  const todayInfo = getTodayDateInfo();
  const isLockedToday = (lastCompletedDateKey === todayInfo.key) && !adminOverrideUnlocked;

  // Calculate countdown to midnight for unlocking next session
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeToMidnight({ hours, minutes, seconds });
      } else {
        setTimeToMidnight({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('sitesec_tafsir_completed', JSON.stringify(completedVerseIds));
    localStorage.setItem('sitesec_tafsir_current_idx', currentVerseIndex.toString());
  }, [completedVerseIds, currentVerseIndex]);

  // Dynamic Quiz Generation Trigger Function
  const triggerQuizGeneration = async () => {
    if (!currentVerse) return;
    setVerseStage('quiz_generating');
    setQuizGeneratingStatus('جاري الاتصال بخادم Gemini (Google AI) لإنشاء سؤال الاختبار...');
    setQuizGenerationError(null);

    const res = await generateQuizWithCascade(
      currentVerse.arabicText,
      currentVerse.tafsir,
      currentVerse.surahName,
      currentVerse.verseNumber,
      (statusMsg) => setQuizGeneratingStatus(statusMsg)
    );

    if (res.success && res.quiz) {
      setCurrentQuiz(res.quiz);
      setVerseStage('quiz');
    } else {
      setQuizGenerationError(res.error || "تعذر الاتصال بجميع خوادم الذكاء الاصطناعي لإنشاء سؤال الاختبار بعد 3 محاولات.");
      setVerseStage('server_error');
    }
  };

  // 15-second Timer Effect during 'timer' stage
  useEffect(() => {
    let interval: any = null;
    if (verseStage === 'timer' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (verseStage === 'timer' && timerSeconds === 0) {
      triggerQuizGeneration();
    }
    return () => clearInterval(interval);
  }, [verseStage, timerSeconds]);

  const handleAcknowledgeNotice = () => {
    setHasAcknowledgedNotice(true);
    localStorage.setItem('sitesec_tafsir_notice_ack', 'true');
  };

  const handleStartJourney = () => {
    setJourneyStarted(true);
    setVerseStage('card');
    setTodayCompletedCount(0);
    setCurrentQuiz(null);
  };

  const handleStartQuiz = () => {
    setVerseStage('timer');
    setTimerSeconds(15);
  };

  const handleSkipTimer = () => {
    triggerQuizGeneration();
  };

  const markVerseCompleted = () => {
    if (!currentVerse) return;
    if (!completedVerseIds.includes(currentVerse.id)) {
      setCompletedVerseIds(prev => [...prev, currentVerse.id]);
    }
    
    const newTodayCount = todayCompletedCount + 1;
    setTodayCompletedCount(newTodayCount);

    if (newTodayCount >= dailyTargetCount) {
      const dateInfo = getTodayDateInfo();
      setLastCompletedDateKey(dateInfo.key);
      setLastCompletedArabic(dateInfo.formattedToday);
      setNextUnlockedArabic(dateInfo.formattedTomorrow);

      localStorage.setItem('sitesec_tafsir_last_completed_date', dateInfo.key);
      localStorage.setItem('sitesec_tafsir_last_completed_arabic', dateInfo.formattedToday);
      localStorage.setItem('sitesec_tafsir_next_unlocked_arabic', dateInfo.formattedTomorrow);

      setShowGoalModal(true);
    }
  };

  const handleOptionSubmit = (optionIndex: number) => {
    if (!currentVerse) return;
    setSelectedOption(optionIndex);

    const correctIdx = currentQuiz ? currentQuiz.correctOptionIndex : currentVerse.correctOptionIndex;

    if (optionIndex === correctIdx) {
      setVerseStage('result_success');
      markVerseCompleted();
    } else {
      setVerseStage('result_fail');
    }
  };

  const handleBypassQuizDueToServerIssue = () => {
    setVerseStage('result_success');
    markVerseCompleted();
  };

  const handleNextVerse = () => {
    if (currentVerseIndex < TOTAL_QURAN_VERSES) {
      setCurrentVerseIndex(prev => prev + 1);
      setVerseStage('card');
      setSelectedOption(null);
      setCurrentQuiz(null);
    }
  };

  const handleRetryVerse = () => {
    setVerseStage('card');
    setSelectedOption(null);
  };

  const handleSelectSurahVerse = (surahNumber: number, verseNumberInSurah: number) => {
    const globalId = getGlobalVerseId(surahNumber, verseNumberInSurah);
    setCurrentVerseIndex(globalId);
    setJourneyStarted(true);
    setVerseStage('card');
    setSelectedOption(null);
    setCurrentQuiz(null);
    setShowQuranIndexModal(false);
    setSelectedSurahForPicker(null);
  };

  const overallProgressPercentage = ((completedVerseIds.length / TOTAL_QURAN_VERSES) * 100).toFixed(2);
  const currentDayNumber = Math.floor(completedVerseIds.length / dailyTargetCount) + 1;
  const currentMadinahPage = currentVerse?.page || Math.min(604, Math.max(1, Math.ceil(currentVerseIndex / 10.3)));

  return (
    <div className="w-full flex flex-col items-center justify-start p-4 sm:p-8 font-arabic text-white min-h-[85vh]" dir="rtl">
      <div className="max-w-5xl w-full mx-auto flex flex-col gap-6">

        {/* Master Branding Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-gradient-to-r from-violet-900/40 via-blue-900/40 to-slate-900/60 backdrop-blur-2xl border border-violet-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(139,92,246,0.2)] flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-5 z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-amber-500 p-[2px] shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BookOpen size={36} className="text-amber-300 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Sparkles size={12} /> الصفحة الأساسية لتعلم القرآن
                </span>
                <span className="bg-violet-500/20 text-violet-300 text-xs font-bold px-3 py-1 rounded-full border border-violet-500/30">
                  اليوم {currentDayNumber}
                </span>
                <span className="bg-cyan-500/20 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full border border-cyan-500/30 font-mono">
                  ص {currentMadinahPage} من {TOTAL_MADINAH_PAGES} مصحف المدينة
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                Shaheen Tafsir
              </h1>
              <p className="text-blue-200/90 text-sm sm:text-base mt-1 leading-relaxed">
                رحلتك التفاعلية لختم تفسير القرآن الكريم كاملاً (17 آية يومياً خلال سنة بالتوافق مع ركعات الصلوات الخمس).
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 z-10 w-full sm:w-auto">
            <div className="text-left font-mono text-2xl font-black text-amber-300 drop-shadow-md">
              {completedVerseIds.length} <span className="text-xs text-blue-200 font-arabic">/ {TOTAL_QURAN_VERSES} آية</span>
            </div>
            <div className="text-xs text-violet-200 font-bold bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              نسبة الإنجاز الإجمالية: {overallProgressPercentage}%
            </div>

            <button 
              onClick={() => setShowQuranIndexModal(true)}
              className="mt-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
            >
              <List size={16} />
              فهرس سور وآيات القرآن 📖
            </button>
          </div>
        </motion.div>

        {/* Prayer Times Division Banner: 17 verses = 17 Rak'ahs */}
        <div className="w-full bg-gradient-to-r from-violet-950/70 via-slate-900/90 to-blue-950/70 border border-amber-500/30 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-xl flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30 flex-shrink-0">
                <Sparkles size={20} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>خطة التدبر الميسر: ١٧ آية موزعة بعد كل صلاة</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-normal">
                    ١٧ ركعة مفروضة = ١٧ آية تدبر
                  </span>
                </h3>
                <p className="text-xs text-blue-200/70 mt-0.5">
                  قسّم وردك بعد الصلوات الخمس بنفس عدد ركعات الفريضة التي قضيتها، لدقائق معدودة تثبت التدبر دون أي مشقة:
                </p>
              </div>
            </div>

            <div className="text-xs font-mono font-bold text-amber-300 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
              المجموع: ٢ + ٤ + ٤ + ٣ + ٤ = ١٧ آية
            </div>
          </div>

          {/* 5 Prayers Division Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center flex flex-col items-center gap-1 hover:border-amber-400/40 transition-colors">
              <span className="text-[11px] text-blue-200/70 font-semibold">بعد الفجر (ركعتان)</span>
              <span className="text-base sm:text-lg font-black text-amber-300 font-mono">٢ آيات</span>
              <span className="text-[10px] text-white/50">الآيات ١ - ٢</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center flex flex-col items-center gap-1 hover:border-amber-400/40 transition-colors">
              <span className="text-[11px] text-blue-200/70 font-semibold">بعد الظهر (٤ ركعات)</span>
              <span className="text-base sm:text-lg font-black text-amber-300 font-mono">٤ آيات</span>
              <span className="text-[10px] text-white/50">الآيات ٣ - ٦</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center flex flex-col items-center gap-1 hover:border-amber-400/40 transition-colors">
              <span className="text-[11px] text-blue-200/70 font-semibold">بعد العصر (٤ ركعات)</span>
              <span className="text-base sm:text-lg font-black text-amber-300 font-mono">٤ آيات</span>
              <span className="text-[10px] text-white/50">الآيات ٧ - ١٠</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center flex flex-col items-center gap-1 hover:border-amber-400/40 transition-colors">
              <span className="text-[11px] text-blue-200/70 font-semibold">بعد المغرب (٣ ركعات)</span>
              <span className="text-base sm:text-lg font-black text-amber-300 font-mono">٣ آيات</span>
              <span className="text-[10px] text-white/50">الآيات ١١ - ١٣</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center flex flex-col items-center gap-1 hover:border-amber-400/40 transition-colors col-span-2 sm:col-span-1">
              <span className="text-[11px] text-blue-200/70 font-semibold">بعد العشاء (٤ ركعات)</span>
              <span className="text-base sm:text-lg font-black text-amber-300 font-mono">٤ آيات</span>
              <span className="text-[10px] text-white/50">الآيات ١٤ - ١٧</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-blue-200">
            <span className="flex items-center gap-2">
              <BookMarked size={16} className="text-amber-400" />
              تقدمك في إتمام تفسير القرآن الكلي
            </span>
            <span className="text-amber-300 font-mono">{completedVerseIds.length} من {TOTAL_QURAN_VERSES} آية</span>
          </div>

          <div className="w-full bg-black/50 h-3.5 rounded-full overflow-hidden border border-white/10 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.max((completedVerseIds.length / TOTAL_QURAN_VERSES) * 100, 0.5)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-violet-500 to-emerald-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
            />
          </div>
        </div>

        {/* Notice & Disclaimer Modal/Banner */}
        {!hasAcknowledgedNotice && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-gradient-to-br from-amber-950/80 via-slate-900 to-red-950/80 border border-amber-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col gap-5 relative"
          >
            <div className="flex items-center gap-3 text-amber-400 font-bold text-xl border-b border-amber-500/20 pb-4">
              <AlertTriangle className="text-amber-400 animate-bounce" size={28} />
              <span>إشعار تعريفي وإخلاء مسؤولية هام</span>
            </div>

            <div className="space-y-4 text-blue-100 text-base leading-relaxed">
              <p className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 text-amber-100">
                🌱 <strong>مرحباً بك في Shaheen Tafsir:</strong> تم تصميم هذه المنصة لتسهيل تعلم واستيعاب تفسير القرآن الكريم عبر <strong>١٧ آية يومياً</strong> (موزعة بيسر بعد الصلوات الخمس: الفجر ٢، الظهر ٤، العصر ٤، المغرب ٣، العشاء ٤ = ١٧ آية بعد ١٧ ركعة مفروضة) لتختم تفسير كلام الله بأسلوب تفاعلي منظم في عام واحد.
              </p>

              <p className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-red-200">
                ⚠️ <strong>إخلاء مسؤولية تنبيهي:</strong> تم إعداد الشروحات والتطبيقات لتكون مبسطة، وقد يحتوي محرك الاستنباط والذكاء الاصطناعي في بعض التفسيرات المتقدمة على خطأ غير مقصود. <strong>يرجى دائماً مراجعة المصادر وأمهات كتب التفسير المعتمدة (كتفسير ابن كثير، السعدي، الطبري، والميسر) والرجوع لأهل العلم الموثوقين.</strong>
              </p>
            </div>

            <button 
              onClick={handleAcknowledgeNotice}
              className="self-end px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105 mt-2 cursor-pointer"
            >
              فهمت ذلك وأوافق، بدء رحلة التفسير اليومية (17 آية) 🚀
            </button>
          </motion.div>
        )}

        {/* Start Journey Trigger / Date Lock Screen */}
        {!journeyStarted && hasAcknowledgedNotice && (
          isLockedToday ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-gradient-to-br from-slate-900/90 via-violet-950/60 to-slate-900/90 backdrop-blur-2xl border border-amber-500/40 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden"
            >
              <div className="w-24 h-24 rounded-3xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-2xl mb-1 animate-pulse">
                <Clock size={52} />
              </div>

              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold px-4 py-1.5 rounded-full text-xs sm:text-sm">
                <Sparkles size={14} /> تم إنجاز الورد اليومي الكامل (١٧ آية) لليوم {lastCompletedArabic || todayInfo.formattedToday}
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                أحسنت! أتممت جلسة التفسير لهذا اليوم 🎉
              </h2>

              <p className="text-blue-100 text-base sm:text-lg max-w-2xl leading-relaxed bg-black/30 p-6 rounded-2xl border border-white/10">
                حفاظاً على التدرج والترسيخ العلمي في تعلم القرآن الكريم (١٧ آية يومياً لختم القرآن في عام)، يُغلق التتابع تلقائياً لليوم <strong>({lastCompletedArabic || todayInfo.formattedToday})</strong>، وسيكون الموعد القادم لفتح الورد التالي غداً بتاريخ <strong>({nextUnlockedArabic || todayInfo.formattedTomorrow})</strong> بحول الله.
              </p>

              {/* Countdown Timer to Midnight */}
              <div className="flex flex-col items-center gap-2 bg-slate-950/80 border border-amber-500/30 p-6 rounded-2xl w-full max-w-md shadow-inner">
                <span className="text-xs font-bold text-amber-300/80">الوقت المتبقي لفتح جلسة الغد ({nextUnlockedArabic || todayInfo.formattedTomorrow}):</span>
                <div className="flex items-center gap-3 font-mono text-3xl sm:text-4xl font-black text-amber-400">
                  <div className="flex flex-col items-center">
                    <span>{String(timeToMidnight.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] text-blue-200 font-arabic font-normal">ساعة</span>
                  </div>
                  <span>:</span>
                  <div className="flex flex-col items-center">
                    <span>{String(timeToMidnight.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] text-blue-200 font-arabic font-normal">دقيقة</span>
                  </div>
                  <span>:</span>
                  <div className="flex flex-col items-center">
                    <span>{String(timeToMidnight.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] text-blue-200 font-arabic font-normal">ثانية</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                <button 
                  onClick={handleStartJourney}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-base rounded-2xl border border-white/15 transition-all flex items-center gap-2"
                >
                  <BookOpen size={20} className="text-amber-300" />
                  تصفح ومراجعة الآيات السابقة
                </button>

                <button 
                  onClick={() => {
                    setAdminOverrideUnlocked(true);
                    setJourneyStarted(true);
                    setVerseStage('card');
                  }}
                  className="px-6 py-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm rounded-2xl border border-amber-500/30 transition-all flex items-center gap-2"
                >
                  <Zap size={16} />
                  فتح المتابعة الاستثنائية (وضع التجربة والتقييم) 🔓
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden"
            >
              <div className="w-24 h-24 rounded-3xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-amber-300 shadow-inner mb-2">
                <BookOpen size={52} />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white">
                جاهز للبدء في برنامج التفسير اليومي؟
              </h2>

              <p className="text-blue-200 text-lg max-w-2xl leading-relaxed">
                ستقرأ وتتدبر 17 آية مع تفسيرها الميسر ومثال تطبيقي، ثم تبدأ الاختبار بعد فترة تفكير مدتها 15 ثانية لتأكيد الفهم والانتقال للآية التالية. يمكنك إتمامها دفعة واحدة أو تقسيمها بعد كل صلاة (الفجر ٢، الظهر ٤، العصر ٤، المغرب ٣، العشاء ٤).
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                <button 
                  onClick={handleStartJourney}
                  className="px-10 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-black text-xl rounded-2xl shadow-[0_0_35px_rgba(139,92,246,0.5)] transition-all transform hover:scale-105 flex items-center gap-3 cursor-pointer"
                >
                  <Play size={24} fill="white" />
                  بدء رحلة التفسير اليومية (17 آية)
                </button>
              </div>
            </motion.div>
          )
        )}

        {/* Main Verse Learning Experience */}
        {journeyStarted && hasAcknowledgedNotice && (
          <div className="w-full flex flex-col gap-6">

            {/* Daily Session Header Bar */}
            <div className="flex justify-between items-center bg-slate-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold text-white text-base sm:text-lg">
                  إنجاز جلسة اليوم: <span className="text-amber-400">{todayCompletedCount}</span> من <span className="text-amber-400">{DAILY_GOAL_VERSES} آية</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowQuranIndexModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <List size={14} />
                  فهرس القرآن
                </button>

                <button 
                  onClick={() => {
                    if (currentVerseIndex > 1) setCurrentVerseIndex(prev => prev - 1);
                    setVerseStage('card');
                  }}
                  disabled={currentVerseIndex <= 1}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  الآية السابقة
                </button>
                <button 
                  onClick={() => {
                    setCurrentVerseIndex(prev => prev + 1);
                    setVerseStage('card');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:bg-white/10"
                >
                  الآية التالية
                </button>
              </div>
            </div>

            {/* Toast Feedback for Saving to Personal Gallery */}
            <AnimatePresence>
              {saveToastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-amber-600 via-violet-600 to-indigo-600 text-white px-6 py-3.5 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-amber-300/40 font-arabic font-bold flex items-center gap-3 backdrop-blur-xl"
                >
                  <Bookmark size={20} className="fill-amber-300 text-amber-300 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{saveToastMessage}</span>
                  <Link 
                    to="/database.html" 
                    className="mr-2 px-3 py-1 bg-white/20 hover:bg-white/30 text-amber-200 text-xs rounded-xl border border-white/20 transition-colors whitespace-nowrap"
                  >
                    عرض المعرض ↗
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skeleton Loading State */}
            {loadingVerse && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full bg-gradient-to-br from-slate-900/90 via-violet-950/40 to-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col gap-8 animate-pulse"
              >
                {/* Header Tag Skeleton */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-44 bg-amber-500/20 rounded-2xl border border-amber-500/30"></div>
                    <div className="h-7 w-48 bg-violet-600/20 rounded-xl border border-violet-500/30"></div>
                  </div>
                  <div className="h-6 w-32 bg-white/10 rounded-lg"></div>
                </div>

                {/* Arabic Quranic Verse Skeleton */}
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 p-8 rounded-3xl flex flex-col items-center justify-center gap-3">
                  <div className="h-10 bg-amber-300/30 rounded-xl w-3/4"></div>
                  <div className="h-10 bg-amber-300/20 rounded-xl w-1/2"></div>
                </div>

                {/* Explanation / Tafsir Skeleton */}
                <div className="space-y-6">
                  <div className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-3">
                    <div className="h-6 bg-violet-400/30 rounded-lg w-40"></div>
                    <div className="h-4 bg-white/20 rounded w-full"></div>
                    <div className="h-4 bg-white/20 rounded w-11/12"></div>
                    <div className="h-4 bg-white/20 rounded w-4/5"></div>
                  </div>

                  {/* Real Life Example Skeleton */}
                  <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-500/20 space-y-3">
                    <div className="h-6 bg-blue-400/30 rounded-lg w-48"></div>
                    <div className="h-4 bg-blue-100/20 rounded w-full"></div>
                    <div className="h-4 bg-blue-100/20 rounded w-5/6"></div>
                  </div>

                  {/* Sources Skeleton */}
                  <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                    <div className="h-4 bg-emerald-400/30 rounded w-32"></div>
                    <div className="h-4 bg-emerald-100/20 rounded w-48"></div>
                  </div>
                </div>

                {/* Action Button Skeleton */}
                <div className="border-t border-white/10 pt-6 flex justify-end">
                  <div className="h-14 bg-gradient-to-r from-violet-600/40 to-amber-500/40 rounded-2xl w-full sm:w-72"></div>
                </div>
              </motion.div>
            )}

            {/* STAGE 1: Verse Glass Card */}
            {!loadingVerse && currentVerse && verseStage === 'card' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full bg-gradient-to-br from-slate-900/90 via-violet-950/40 to-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-[0_10px_50px_rgba(0,0,0,0.5)] flex flex-col gap-8 relative overflow-hidden"
              >
                {/* Header Tag */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-4 py-2 bg-amber-500/20 text-amber-300 font-bold text-base sm:text-lg rounded-2xl border border-amber-500/30">
                      سورة {currentVerse.surahName} - الآية {currentVerse.verseNumber}
                    </span>
                    <span className="px-3 py-1.5 bg-violet-600/20 text-violet-300 text-xs font-bold rounded-xl border border-violet-500/30">
                      الآية الشاملة #{currentVerse.id} من 6236
                    </span>
                    <span className="px-3 py-1.5 bg-cyan-600/20 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/30 font-mono">
                      ص {currentVerse.page || currentMadinahPage} مصحف المدينة
                    </span>
                    <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30">
                      الورد اليومي: {todayCompletedCount} من {dailyTargetCount} آية
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleToggleSaveToGallery}
                      className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border shadow-lg cursor-pointer ${
                        isSavedInGallery
                          ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : 'bg-white/10 hover:bg-white/20 border-white/20 text-white/90 hover:text-white'
                      }`}
                      title={isSavedInGallery ? 'الآية محفوظة في معرضك الشخصي' : 'حفظ هذا التفسير والمثال في المعرض الشخصي'}
                    >
                      <Bookmark size={18} className={isSavedInGallery ? 'fill-amber-400 text-amber-400' : 'text-white/70'} />
                      <span>{isSavedInGallery ? 'محفوظة بالمعرض الشخصي ★' : 'حفظ في المعرض الشخصي'}</span>
                    </button>

                    <span className="text-xs text-blue-200/80 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hidden sm:inline-block">
                      بطاقة التفسير التفاعلية 📖
                    </span>
                  </div>
                </div>

                {/* Arabic Quranic Verse */}
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 p-8 rounded-3xl text-center shadow-inner my-2">
                  <p className="font-uthmanic text-3xl sm:text-4xl text-amber-100 leading-loose tracking-wide font-bold drop-shadow-md">
                    ﴿ {currentVerse.arabicText} ﴾
                  </p>
                </div>

                {/* Explanation / Tafsir */}
                <div className="space-y-6">
                  <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold text-violet-300 mb-3 flex items-center gap-2">
                      <BookOpen size={22} className="text-violet-400" />
                      التفسير الميسر والمختصر
                    </h3>
                    <p className="text-white text-lg sm:text-xl leading-relaxed">
                      {currentVerse.tafsir}
                    </p>
                  </div>

                  {/* Real Life Example */}
                  <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-500/20 flex flex-col gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center gap-2">
                        <Zap size={22} className="text-blue-400" />
                        تطبيق عملي ومثال من الواقع
                      </h3>
                      <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
                        {currentVerse.realLifeExample}
                      </p>
                    </div>

                    {/* Red Interactive Evidence Trigger & Glowing Evidence Box */}
                    <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => setShowTafsirEvidence(prev => !prev)}
                        className={`self-start px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer shadow-lg ${
                          showTafsirEvidence
                            ? 'bg-red-600/30 text-red-200 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                            : 'bg-red-500/15 hover:bg-red-500/25 text-red-300 hover:text-red-100 border-red-500/40 hover:border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                        }`}
                      >
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span>{showTafsirEvidence ? 'إخفاء الدليل من التفسير ✕' : 'ما هو الدليل على صحة ذلك من التفسير؟ (اضغط للتأكد) 🔍'}</span>
                      </button>

                      <AnimatePresence>
                        {showTafsirEvidence && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/80 via-black/80 to-red-950/80 border-2 border-red-500/70 shadow-[0_0_35px_rgba(239,68,68,0.4)] relative backdrop-blur-xl space-y-2.5">
                              <div className="flex items-center justify-between text-xs text-red-300 font-bold border-b border-red-500/30 pb-2">
                                <span className="flex items-center gap-1.5 text-red-400 text-sm">
                                  <CheckCircle2 size={16} className="text-red-400 animate-pulse" />
                                  <span>الدليل والحجة من نص التفسير الميسر المعروض أعلاه فقط:</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[11px] text-red-300 font-mono">
                                  موثق من التفسير
                                </span>
                              </div>

                              <p className="text-red-100 text-sm sm:text-base leading-relaxed bg-black/50 p-4 rounded-xl border border-red-500/30 font-medium">
                                {currentVerse.tafsirEvidence || `الشاهد المباشر من التفسير الميسر: "${currentVerse.tafsir}" - وهو ما يثبت دلالة الآية الصريحة على صحة هذا التطبيق العملي وربطه المباشر بالمعنى المعتمد.`}
                              </p>

                              <div className="text-[11px] text-red-300/70 flex items-center justify-between pt-1">
                                <span>* تم استنباط هذا الدليل حصرياً من التفسير الميسر المذكور أعلاه دون أي مصدر خارجي.</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Sources */}
                  <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20 flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-emerald-300 font-bold flex items-center gap-2">
                      <Info size={16} /> المصادر المعتمدة:
                    </span>
                    <span className="text-emerald-100 font-medium">{currentVerse.sources}</span>
                  </div>
                </div>

                {/* Action Buttons: Save to Gallery & Start Quiz */}
                <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={handleToggleSaveToGallery}
                    className={`w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all border cursor-pointer ${
                      isSavedInGallery
                        ? 'bg-amber-500/25 border-amber-400/60 text-amber-300 hover:bg-amber-500/35'
                        : 'bg-white/10 hover:bg-white/15 border-white/20 text-white/95'
                    }`}
                  >
                    <Bookmark size={19} className={isSavedInGallery ? 'fill-amber-400 text-amber-400' : 'text-amber-300'} />
                    <span>{isSavedInGallery ? 'محفوظة في المعرض الشخصي (إلغاء الحفظ)' : 'حفظ التفسير في المعرض الشخصي 📌'}</span>
                  </button>

                  <button 
                    onClick={handleStartQuiz}
                    className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-black text-lg rounded-2xl shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all transform hover:scale-105 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    بدء الاختبار والتأكد من الفهم ⚡
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 2: 15-Second Timer Countdown */}
            {verseStage === 'timer' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-10 sm:p-16 text-center flex flex-col items-center justify-center gap-8 shadow-2xl relative"
              >
                <div className="relative flex items-center justify-center">
                  {/* Glowing Timer Circle */}
                  <div className="w-40 h-40 rounded-full border-4 border-amber-500/20 flex items-center justify-center bg-black/40 relative shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                    <span className="font-mono text-6xl font-black text-amber-400 drop-shadow-md animate-pulse">
                      {timerSeconds}
                    </span>
                    <span className="absolute bottom-4 text-xs font-bold text-amber-200/80">ثانية</span>
                  </div>
                </div>

                <div className="space-y-2 max-w-md">
                  <h3 className="text-2xl font-black text-white">استحضر المعنى والتفسير...</h3>
                  <p className="text-blue-200 text-sm">
                    تمر الأن 15 ثانية للتفكير الذهني والتأمل في الآية المعروضة قبل الانتقال للتحدي وسؤال الفهم.
                  </p>
                </div>

                <button 
                  onClick={handleSkipTimer}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/10 transition-all flex items-center gap-2"
                >
                  <Zap size={16} className="text-amber-400" />
                  تخطي الانتظار والبدء فوراً
                </button>
              </motion.div>
            )}

            {/* STAGE 3: Generating Quiz via AI Loading Screen */}
            {verseStage === 'quiz_generating' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-gradient-to-br from-slate-900/95 via-violet-950/60 to-slate-900/95 backdrop-blur-2xl border border-violet-500/40 rounded-3xl p-8 sm:p-14 text-center flex flex-col items-center justify-center gap-6 shadow-[0_0_60px_rgba(139,92,246,0.25)] relative overflow-hidden"
              >
                <div className="relative flex items-center justify-center mb-2">
                  <div className="w-24 h-24 rounded-3xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-amber-300 shadow-2xl relative animate-pulse">
                    <Sparkles size={48} className="animate-spin text-amber-300" style={{ animationDuration: '4s' }} />
                  </div>
                  <div className="absolute -inset-4 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin"></div>
                </div>

                <div className="space-y-3 max-w-xl">
                  <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-500/30 inline-flex items-center gap-1.5">
                    <Zap size={14} /> جاري صياغة سؤال جديد ومخصص للآية
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    الذكاء الاصطناعي يقوم بصياغة سؤال الاختبار التفاعلي...
                  </h3>
                  
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/10 text-amber-200 text-sm sm:text-base font-bold flex items-center justify-center gap-2">
                    <RefreshCw size={18} className="animate-spin text-amber-400" />
                    <span>{quizGeneratingStatus}</span>
                  </div>
                </div>

                <p className="text-blue-200/80 text-xs sm:text-sm max-w-lg leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                  تتم الاستجابة أولاً بواسطة Gemini، وعند حدوث بطء يتم انتظار 5 ثوانٍ والتجربة التلقائية على Groq ثم OpenRouter بتكرار يصل لـ 3 محاولات لضمان أفضل سؤال.
                </p>
              </motion.div>
            )}

            {/* STAGE 3.5: Server Error & Bypass Screen */}
            {verseStage === 'server_error' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-gradient-to-br from-slate-900/95 via-amber-950/40 to-red-950/60 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col items-center text-center gap-6 relative"
              >
                <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-2xl animate-bounce">
                  <AlertTriangle size={42} />
                </div>

                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-500/30">
                    <Server size={14} /> تعذر الاتصال بخوادم التوليد
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    تنبيه: الخوادم غير مستجيبة حالياً ⚠️
                  </h3>

                  <p className="text-blue-100 text-base leading-relaxed bg-black/40 p-5 rounded-2xl border border-white/10">
                    تمت المحاولة 3 مرات متكررة للاتصال بخوادم الذكاء الاصطناعي (Gemini / Groq / OpenRouter) مع مهلة 5 ثوانٍ في كل تجربة، ولم تنجح الاستجابة بسبب خلل في الخوادم. 
                    <br /><strong className="text-amber-300">يرجى إعادة مراجعة الآية وتفسيرها ذاتياً لترسيخ المعنى.</strong>
                  </p>
                </div>

                {/* Special Bypass Permission Box */}
                <div className="bg-emerald-950/60 border border-emerald-500/40 p-5 rounded-2xl max-w-2xl text-emerald-200 text-sm font-bold space-y-1">
                  <div className="flex items-center justify-center gap-2 text-emerald-300 text-base">
                    <CheckCircle2 size={18} /> تفعيل التجاوز الاستثنائي (وضع الخوادم)
                  </div>
                  <p>
                    نظراً لأن المشكلة خارجة عن إرادتك ومن خوادم الخدمة، يُسمح لك بالعبور وتجاوز الاختبار واحتساب الآية كمكتملة بنجاح كي لا تتوقف رحلتك اليومية.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                  <button 
                    onClick={handleBypassQuizDueToServerIssue}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    تجاوز الاختبار واحتساب الآية (بسبب خلل الخوادم) ✅
                  </button>

                  <button 
                    onClick={triggerQuizGeneration}
                    className="px-6 py-4 bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-sm rounded-2xl border border-amber-500/30 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    إعادة محاولة الاتصال بالخوادم
                  </button>

                  <button 
                    onClick={handleRetryVerse}
                    className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white/80 font-bold text-sm rounded-2xl border border-white/10 transition-all flex items-center gap-2"
                  >
                    <BookOpen size={16} />
                    العودة لبطاقة التفسير
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 4: Quiz Question Screen */}
            {currentVerse && verseStage === 'quiz' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-slate-900/90 backdrop-blur-2xl border border-violet-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col gap-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-amber-400 font-bold text-sm flex items-center gap-2">
                    <HelpCircle size={18} /> سؤال الفهم والاستيعاب للآية {currentVerse.verseNumber} ({currentVerse.surahName})
                  </span>
                  
                  {currentQuiz?.providerUsed && (
                    <span className="text-xs text-violet-300 font-bold bg-violet-600/20 px-3 py-1 rounded-full border border-violet-500/30">
                      بواسطة: {currentQuiz.providerUsed}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-white leading-relaxed bg-black/30 p-6 rounded-2xl border border-white/5">
                  {currentQuiz ? currentQuiz.quizQuestion : currentVerse.quizQuestion}
                </h3>

                <div className="grid grid-cols-1 gap-4 mt-2">
                  {(currentQuiz ? currentQuiz.quizOptions : currentVerse.quizOptions).map((option, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleOptionSubmit(idx)}
                      className="p-5 rounded-2xl bg-white/5 hover:bg-violet-600/30 border border-white/10 hover:border-violet-500/50 text-right text-white font-bold text-base sm:text-lg transition-all duration-200 flex items-center gap-4 group"
                    >
                      <span className="w-8 h-8 rounded-xl bg-white/10 group-hover:bg-violet-500 text-amber-300 flex items-center justify-center font-mono font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STAGE 5: Success Result */}
            {currentVerse && verseStage === 'result_success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-emerald-950/80 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-lg animate-bounce">
                  <CheckCircle2 size={48} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white">إجابة صحيحة! ممتازة جداً 🎉</h3>
                  <p className="text-emerald-200 text-lg max-w-lg">
                    {currentQuiz ? currentQuiz.quizExplanation : currentVerse.quizExplanation}
                  </p>
                </div>

                <div className="bg-black/30 px-6 py-3 rounded-2xl border border-emerald-500/20 text-emerald-300 font-bold text-sm">
                  تم تسديد الآية وإضافتها لسجل حفظك بنجاح ✅
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                  <button
                    onClick={handleToggleSaveToGallery}
                    className={`px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                      isSavedInGallery
                        ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                        : 'bg-black/30 hover:bg-black/50 border-white/20 text-white'
                    }`}
                  >
                    <Bookmark size={18} className={isSavedInGallery ? 'fill-amber-400 text-amber-400' : ''} />
                    <span>{isSavedInGallery ? 'محفوظة في المعرض الشخصي ★' : 'حفظ في المعرض الشخصي 📌'}</span>
                  </button>

                  <button 
                    onClick={handleNextVerse}
                    className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xl rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-3 cursor-pointer"
                  >
                    <span>الانتقال للآية التالية</span>
                    <ChevronRight size={24} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 5: Incorrect Result */}
            {currentVerse && verseStage === 'result_fail' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-red-950/80 backdrop-blur-2xl border border-red-500/40 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-400 shadow-lg">
                  <XCircle size={48} />
                </div>

                <div className="space-y-2 max-w-lg">
                  <h3 className="text-3xl font-black text-white">إجابة غير صحيحة ❌</h3>
                  <p className="text-red-200 text-base leading-relaxed">
                    لا بأس، الهدف هو الاستيعاب وتثبيت العلم. يرجى إعادة قراءة البطاقة والتأكد من التفسير والمثال ثم أعد الاختبار مرة أخرى.
                  </p>
                </div>

                <button 
                  onClick={handleRetryVerse}
                  className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-lg rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-3"
                >
                  <RotateCcw size={20} />
                  إعادة قراءة البطاقة والاختبار
                </button>
              </motion.div>
            )}

          </div>
        )}

        {/* Daily Goal Completed Modal */}
        <AnimatePresence>
          {showGoalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => setShowGoalModal(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-slate-900 border border-amber-500/50 p-8 sm:p-10 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.3)] z-10 w-full max-w-lg relative text-center flex flex-col items-center gap-6 font-arabic"
              >
                <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-2xl animate-bounce">
                  <Award size={48} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white">إنجاز يستحق الفخر! 🌟</h3>
                  <p className="text-amber-200 text-lg leading-relaxed">
                    مبارك! لقد أنجزت تعلم وتفسير <strong className="text-white">١٧ آية لهذا اليوم</strong> بنجاح واقتدار!
                  </p>
                </div>

                <div className="bg-black/40 p-4 rounded-2xl border border-white/10 text-xs text-blue-200 w-full leading-relaxed">
                  استمرارك اليومي بهذا المعدل المبارك (المتوافق مع ركعات الصلوات الخمس: ٢ فجر + ٤ ظهر + ٤ عصر + ٣ مغرب + ٤ عشاء) سيمكنك بفضل الله من ختم تدبر القرآن كاملاً في عام واحد (~٣٦٦ يوماً).
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button 
                    onClick={() => setShowGoalModal(false)}
                    className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-base transition-colors shadow-lg cursor-pointer"
                  >
                    متابعة الورد التالي 🔥
                  </button>
                  <Link 
                    to="/"
                    className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-base transition-colors border border-white/10 flex items-center justify-center"
                  >
                    العودة للرئيسية 🏠
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Full Quran Surahs & Verses Index Modal */}
        <AnimatePresence>
          {showQuranIndexModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-black/80 backdrop-blur-xl"
                onClick={() => {
                  setShowQuranIndexModal(false);
                  setSelectedSurahForPicker(null);
                }}
              />

              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-slate-900 border border-violet-500/40 rounded-3xl shadow-[0_0_80px_rgba(139,92,246,0.3)] z-10 w-full max-w-4xl max-h-[90vh] flex flex-col relative overflow-hidden font-arabic"
              >
                {/* Modal Header */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-violet-950 via-slate-900 to-slate-950 border-b border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
                      <BookOpen size={26} />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                        فهرس القرآن الكريم كاملاً
                      </h2>
                      <p className="text-blue-200/80 text-xs sm:text-sm">
                        اختر أي سورة من الـ 114 سورة، ثم اختر الآية التي تريد قراءة تفسيرها
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setShowQuranIndexModal(false);
                      setSelectedSurahForPicker(null);
                    }}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Content Body */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                  
                  {/* View 1: Surah Selector View */}
                  {!selectedSurahForPicker ? (
                    <>
                      {/* Search & Filter Controls */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search size={18} className="absolute right-3.5 top-3.5 text-blue-300/60" />
                          <input 
                            type="text"
                            value={surahSearchQuery}
                            onChange={(e) => setSurahSearchQuery(e.target.value)}
                            placeholder="ابحث عن اسم السورة (مثلاً: البقرة، يس) أو رقمها..."
                            className="w-full bg-slate-950 border border-white/15 rounded-2xl py-3 pr-10 pl-4 text-white placeholder:text-blue-200/40 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                          />
                          {surahSearchQuery && (
                            <button 
                              onClick={() => setSurahSearchQuery('')}
                              className="absolute left-3 top-3.5 text-xs text-white/50 hover:text-white"
                            >
                              إلغاء
                            </button>
                          )}
                        </div>

                        {/* Surah Type Filter Tabs */}
                        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-white/10">
                          <button 
                            onClick={() => setSurahTypeFilter('all')}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${surahTypeFilter === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'text-white/70 hover:text-white'}`}
                          >
                            الكل (114)
                          </button>
                          <button 
                            onClick={() => setSurahTypeFilter('مكية')}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${surahTypeFilter === 'مكية' ? 'bg-amber-500 text-slate-950 shadow' : 'text-white/70 hover:text-white'}`}
                          >
                            مكية
                          </button>
                          <button 
                            onClick={() => setSurahTypeFilter('مدنية')}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${surahTypeFilter === 'مدنية' ? 'bg-amber-500 text-slate-950 shadow' : 'text-white/70 hover:text-white'}`}
                          >
                            مدنية
                          </button>
                        </div>
                      </div>

                      {/* Direct Global Verse Jump Box */}
                      <div className="bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-blue-500/10 border border-amber-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-amber-300 text-sm font-bold">
                          <Hash size={18} />
                          <span>الانتقال السريع برقم الآية الكلي (من 1 إلى 6236):</span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input 
                            type="number"
                            min={1}
                            max={TOTAL_QURAN_VERSES}
                            value={jumpVerseInput}
                            onChange={(e) => setJumpVerseInput(e.target.value)}
                            placeholder="مثلاً: 255"
                            className="w-28 bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-white text-center text-sm font-mono focus:outline-none focus:border-amber-400"
                          />
                          <button 
                            onClick={() => {
                              const num = parseInt(jumpVerseInput, 10);
                              if (!isNaN(num) && num >= 1 && num <= TOTAL_QURAN_VERSES) {
                                setCurrentVerseIndex(num);
                                setJourneyStarted(true);
                                setVerseStage('card');
                                setSelectedOption(null);
                                setCurrentQuiz(null);
                                setShowQuranIndexModal(false);
                                setJumpVerseInput('');
                              }
                            }}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all"
                          >
                            انتقال 🚀
                          </button>
                        </div>
                      </div>

                      {/* Surahs Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {QURAN_SURAHS
                          .filter(s => {
                            const matchQuery = s.name.includes(surahSearchQuery.trim()) || 
                                               s.number.toString().includes(surahSearchQuery.trim()) ||
                                               s.englishName.toLowerCase().includes(surahSearchQuery.trim().toLowerCase());
                            const matchType = surahTypeFilter === 'all' || s.type === surahTypeFilter;
                            return matchQuery && matchType;
                          })
                          .map((surah) => (
                            <button 
                              key={surah.number}
                              onClick={() => setSelectedSurahForPicker(surah)}
                              className="bg-slate-950/80 hover:bg-violet-950/60 border border-white/10 hover:border-violet-500/50 p-4 rounded-2xl text-right transition-all transform hover:-translate-y-0.5 flex items-center justify-between group shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 font-mono text-amber-300 font-bold text-sm flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                                  {surah.number}
                                </div>
                                <div>
                                  <h4 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                                    سورة {surah.name}
                                  </h4>
                                  <p className="text-xs text-blue-200/70 mt-0.5">
                                    {surah.type} • {surah.versesCount} آية
                                  </p>
                                </div>
                              </div>

                              <ChevronRight size={18} className="text-white/30 group-hover:text-amber-400 transition-colors rotate-180" />
                            </button>
                          ))}
                      </div>
                    </>
                  ) : (
                    /* View 2: Verses Picker for Selected Surah */
                    <div className="space-y-6">
                      {/* Back button & Surah title */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <button 
                          onClick={() => setSelectedSurahForPicker(null)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 flex items-center gap-2 transition-colors"
                        >
                          <ArrowRight size={16} /> العودة لقائمة السور
                        </button>

                        <div className="text-left">
                          <h3 className="text-2xl font-black text-amber-300">
                            سورة {selectedSurahForPicker.name}
                          </h3>
                          <span className="text-xs text-blue-200">
                            سورة {selectedSurahForPicker.type} • عدد آياتها: {selectedSurahForPicker.versesCount} آية
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-blue-100 bg-black/40 p-3.5 rounded-2xl border border-white/10 text-center">
                        انقر على رقم أي آية أدناه لقراءة تفسيرها الميسر والمثال التطبيقي المباشر:
                      </p>

                      {/* Verses Number Buttons Grid */}
                      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
                        {Array.from({ length: selectedSurahForPicker.versesCount }, (_, i) => i + 1).map((vNum) => {
                          const globalId = getGlobalVerseId(selectedSurahForPicker.number, vNum);
                          const isCompleted = completedVerseIds.includes(globalId);
                          const isCurrent = currentVerseIndex === globalId;
                          const isSaved = isVerseSaved(globalId);

                          return (
                            <button
                              key={vNum}
                              onClick={() => handleSelectSurahVerse(selectedSurahForPicker.number, vNum)}
                              className={`py-3 px-2 rounded-xl font-mono text-sm font-bold border transition-all flex flex-col items-center justify-center gap-0.5 relative ${
                                isCurrent
                                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                                  : isCompleted
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                                  : 'bg-slate-950 text-white/90 border-white/10 hover:bg-violet-900/60 hover:border-amber-400/50 hover:text-amber-300'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <span>{vNum}</span>
                                {isSaved && <Bookmark size={10} className="fill-amber-400 text-amber-400" />}
                              </div>
                              {isCompleted ? (
                                <span className="text-[9px] font-arabic font-normal text-emerald-400">مكتملة</span>
                              ) : isSaved ? (
                                <span className="text-[9px] font-arabic font-normal text-amber-300">محفوظة</span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
