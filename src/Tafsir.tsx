import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
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
  RefreshCw
} from 'lucide-react';
import { 
  VerseTafsir, 
  QuizData,
  TOTAL_QURAN_VERSES, 
  DAILY_GOAL_VERSES, 
  fetchVerseTafsir,
  generateQuizWithCascade
} from './data/quranTafsirData';

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
  
  // Timer State (15 seconds countdown)
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  
  // Quiz Selection State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [todayCompletedCount, setTodayCompletedCount] = useState<number>(0);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);

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

    if (newTodayCount >= DAILY_GOAL_VERSES) {
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

  const overallProgressPercentage = ((completedVerseIds.length / TOTAL_QURAN_VERSES) * 100).toFixed(2);
  const currentDayNumber = Math.floor(completedVerseIds.length / DAILY_GOAL_VERSES) + 1;

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
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Sparkles size={12} /> الصفحة الأساسية لتعلم القرآن
                </span>
                <span className="bg-violet-500/20 text-violet-300 text-xs font-bold px-3 py-1 rounded-full border border-violet-500/30">
                  اليوم {currentDayNumber} من 367
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                SiteSec Tafsir
              </h1>
              <p className="text-blue-200/90 text-sm sm:text-base mt-1 leading-relaxed">
                رحلتك التفاعلية لختم تفسير القرآن الكريم كاملاً (17 آية يومياً خلال سنة).
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
          </div>
        </motion.div>

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
                🌱 <strong>مرحباً بك في SiteSec Tafsir:</strong> تم تصميم هذه الصفحة لتسهيل تعلم واستيعاب تفسير القرآن الكريم عبر <strong>17 آية يومياً</strong>، لتختم تفسير كلام الله كاملاً في غضون سنة تقريباً بأسلوب تفاعلي منظم.
              </p>

              <p className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-red-200">
                ⚠️ <strong>إخلاء مسؤولية تنبيهي:</strong> تم إعداد الشروحات والتطبيقات لتكون مبسطة، وقد يحتوي محرك الاستنباط والذكاء الاصطناعي في بعض التفسيرات المتقدمة على خطأ غير مقصود. <strong>يرجى دائماً مراجعة المصادر وأمهات كتب التفسير المعتمدة (كتفسير ابن كثير، السعدي، الطبري، والميسر) والرجوع لأهل العلم الموثوقين.</strong>
              </p>
            </div>

            <button 
              onClick={handleAcknowledgeNotice}
              className="self-end px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105 mt-2"
            >
              فهمت ذلك وأوافق، ابدأ رحلة التعلم 🚀
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
                <Sparkles size={14} /> تم إنجاز الورد اليومي الكامل (17 آية) لليوم {lastCompletedArabic || todayInfo.formattedToday}
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                أحسنت! أتممت جلسة التفسير لهذا اليوم 🎉
              </h2>

              <p className="text-blue-100 text-base sm:text-lg max-w-2xl leading-relaxed bg-black/30 p-6 rounded-2xl border border-white/10">
                حفاظاً على التدرج والترسيخ العلمي في تعلم القرآن الكريم (17 آية يومياً لختم القرآن في سنة)، يُغلق التتابع تلقائياً لليوم <strong>({lastCompletedArabic || todayInfo.formattedToday})</strong>، وسيكون الموعد القادم لفتح الـ 17 آية التالية غداً بتاريخ <strong>({nextUnlockedArabic || todayInfo.formattedTomorrow})</strong> بحول الله.
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
                ستقرأ كل آية مع تفسيرها الميسر ومثال تطبيقي، ثم تبدأ الاختبار بعد فترة تفكير مدتها 15 ثانية لتأكيد الفهم والانتقال للآية التالية.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                <button 
                  onClick={handleStartJourney}
                  className="px-10 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-black text-xl rounded-2xl shadow-[0_0_35px_rgba(139,92,246,0.5)] transition-all transform hover:scale-105 flex items-center gap-3"
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
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-amber-500/20 text-amber-300 font-bold text-lg rounded-2xl border border-amber-500/30">
                      سورة {currentVerse.surahName} - الآية {currentVerse.verseNumber}
                    </span>
                    <span className="px-3 py-1.5 bg-violet-600/20 text-violet-300 text-xs font-bold rounded-xl border border-violet-500/30">
                      الآية الشاملة رقم {currentVerse.id} من 6236
                    </span>
                  </div>

                  <span className="text-xs text-blue-200/80 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    بطاقة التفسير التفاعلية 📖
                  </span>
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
                  <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-500/20">
                    <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center gap-2">
                      <Zap size={22} className="text-blue-400" />
                      تطبيق عملي ومثال من الواقع
                    </h3>
                    <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
                      {currentVerse.realLifeExample}
                    </p>
                  </div>

                  {/* Sources */}
                  <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20 flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-emerald-300 font-bold flex items-center gap-2">
                      <Info size={16} /> المصادر المعتمدة:
                    </span>
                    <span className="text-emerald-100 font-medium">{currentVerse.sources}</span>
                  </div>
                </div>

                {/* Action Button: Start Quiz */}
                <div className="border-t border-white/10 pt-6 flex justify-end">
                  <button 
                    onClick={handleStartQuiz}
                    className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-black text-lg rounded-2xl shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all transform hover:scale-105 flex items-center justify-center gap-3"
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

                <button 
                  onClick={handleNextVerse}
                  className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xl rounded-2xl shadow-lg transition-all transform hover:scale-105 mt-2 flex items-center gap-3"
                >
                  <span>الانتقال للآية التالية</span>
                  <ChevronRight size={24} />
                </button>
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
                    مبارك! لقد أنجزت تعلم وتفسير <strong className="text-white">17 آية لهذا اليوم</strong> بنجاح واقتدار!
                  </p>
                </div>

                <div className="bg-black/40 p-4 rounded-2xl border border-white/10 text-xs text-blue-200 w-full">
                  استمرارك اليومي بهذا المعدل سيمكنك بفضل الله من ختم تفسير القرآن كاملاً في عام واحد.
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button 
                    onClick={() => setShowGoalModal(false)}
                    className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-base transition-colors shadow-lg"
                  >
                    متابعة الـ 17 آية التالية 🔥
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

      </div>
    </div>
  );
}
