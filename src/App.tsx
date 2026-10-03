import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  BookOpen, 
  Compass, 
  Layers, 
  BookMarked, 
  Sparkles, 
  Rocket, 
  CheckCircle2, 
  Zap, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Flame, 
  Award, 
  Bookmark, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  Play,
  Cpu,
  Lock
} from 'lucide-react';

interface GlassCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  isMain?: boolean;
  delay?: number;
  buttonText?: string;
  badge?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  isMain = false, 
  delay = 0,
  buttonText,
  badge
}) => {
  const isInternal = href.startsWith('/');
  const InnerLink = isInternal ? Link : 'a';
  const linkProps = isInternal ? { to: href } : { href };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: "spring", bounce: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full h-full min-h-[310px] rounded-3xl border border-white/20
        overflow-hidden group
        shadow-[0_8px_32px_0_rgba(0,0,0,0.35)]
        hover:border-white/40 hover:shadow-[0_15px_40px_-10px_rgba(139,92,246,0.35)]
        transition-all duration-500 flex flex-col
        ${isMain ? 'md:col-span-2 lg:col-span-2' : ''}
      `}
    >
      <InnerLink {...linkProps} className="block w-full h-full absolute inset-0 text-right">
        
        {/* Background Base with template cuts */}
        <div className="absolute inset-0 p-1 bg-gradient-to-br from-violet-400 via-indigo-500 to-blue-500">
          <div className="w-full h-full rounded-2xl rounded-tr-[100px] rounded-bl-[40px] bg-[#101026] transition-all duration-500 group-hover:bg-[#1a1a38]"></div>
        </div>

        {/* Liquid Glass Orb Effect */}
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-lg rounded-3xl overflow-hidden pointer-events-none z-0">
           <div 
             className={`rounded-full bg-gradient-to-tr from-purple-500 to-orange-300 animate-spin opacity-45 blur-xl transition-all duration-700 group-hover:opacity-75 group-hover:scale-125 ${isMain ? 'w-64 h-64' : 'w-40 h-40'}`}
             style={{ animationDuration: '12s' }}
           ></div>
        </div>

        {/* Content Layout */}
        <div className="absolute inset-0 p-3 sm:p-5 flex justify-between z-10 pointer-events-none">
          {/* Right section: Title & Description */}
          <div className="w-3/4 sm:w-2/3 p-4 flex flex-col rounded-2xl backdrop-blur-xl bg-gray-50/10 border border-white/5 text-gray-200 font-arabic h-full justify-between pointer-events-auto">
             <div>
                {badge && (
                  <span className="inline-block px-2.5 py-0.5 mb-2 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {badge}
                  </span>
                )}
                <h3 className={`font-bold ${isMain ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} mb-2 text-white drop-shadow-md`}>
                  {title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed drop-shadow-sm font-medium">
                  {description}
                </p>
             </div>
             
             {isMain && (
               <div className="button mt-4 self-start">
                 {buttonText || 'الدخول للمحرك 🚀'}
               </div>
             )}
          </div>
          
          {/* Left section: Icon & Action */}
          <div className="h-full flex flex-col items-center justify-between text-white/60 pointer-events-auto pb-2 pl-2">
             <div className="w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-xl bg-gray-50/20 border border-white/10 text-white shadow-lg group-hover:bg-gray-50/30 transition-colors">
               <Icon size={24} />
             </div>
             
             {!isMain && (
               <div className="w-10 h-10 mt-auto flex items-center justify-center rounded-full backdrop-blur-xl bg-gray-50/20 border border-white/10 cursor-pointer transition-all duration-300 hover:bg-gray-50/30 text-white">
                 <ArrowLeft size={18} />
               </div>
             )}
          </div>
        </div>

      </InnerLink>
    </motion.div>
  );
};

export default function App() {
  // AI Setup & Key State
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('GOOGLE_API_KEY') || '';
  });
  const [showKeyPassword, setShowKeyPassword] = useState<boolean>(false);
  const [keySaveSuccess, setKeySaveSuccess] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [keyTesting, setKeyTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveApiKey = () => {
    const trimmed = geminiApiKey.trim();
    localStorage.setItem('GOOGLE_API_KEY', trimmed);
    setKeySaveSuccess(true);
    setTestResult(null);
    window.dispatchEvent(new Event('storage'));
    setTimeout(() => setKeySaveSuccess(false), 3500);
  };

  const handlePasteApiKey = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setGeminiApiKey(text.trim());
      }
    } catch {
      // Clipboard read fallback if restricted
    }
  };

  const handleTestApiKey = async () => {
    const keyToTest = geminiApiKey.trim() || localStorage.getItem('GOOGLE_API_KEY') || '';
    if (!keyToTest) {
      setTestResult({
        success: false,
        message: 'يرجى إدخال أو لصق مفتاح API أولاً لتتمكن من اختباره.'
      });
      return;
    }

    setKeyTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'سؤال تجريبي سريع: ما الحكمة من تدبر القرآن الكريم في جملة واحدة؟',
          provider: 'google',
          googleKey: keyToTest
        })
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setTestResult({
          success: true,
          message: '✓ تم التحقق بنجاح فائق! مفتاح Google Gemini متصل وصالح، ومحرك التدبر الذكي جاهز للانطلاق 🚀.'
        });
      } else {
        setTestResult({
          success: false,
          message: `تنبيه من Google: ${data.details || data.error || 'يرجى التأكد من نسخ المفتاح كاملاً دون فراغات وتفعيله في Google AI Studio'}`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `تعذر الاتصال: ${err.message || 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.'}`
      });
    } finally {
      setKeyTesting(false);
    }
  };

  // Interactive Simulator Tab state
  const [activeSimTab, setActiveSimTab] = useState<'tafsir' | 'evidence' | 'quiz' | 'gallery'>('tafsir');
  const [simQuizSelected, setSimQuizSelected] = useState<number | null>(null);
  const [simEvidenceOpen, setSimEvidenceOpen] = useState<boolean>(true);

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Stepper active step
  const [activeStep, setActiveStep] = useState<number>(0);

  const inspirationalSlogans = [
    "اعْمَلْ لِآخِرَتِك.. وَاشْتَرِ نَجَاتَكَ فِي جَنَّتِك",
    "١٧ آية يومياً.. خطوتك المباركة لختم التدبر في عام",
    "نورٌ يهدي.. وعلمٌ يبني.. ويقينٌ ينجي",
    "لا تؤجل تدبر كتاب ربك.. فإن أنفاسك معدودة",
    "أصالة الوحي تلتقي بذكاء العصر",
    "من عاش في ظلال القرآن.. نال السكينة والأمان",
    "اقرأ بقلبك، وتدبر بعقلك، وعش بالقرآن سلوكاً واقعياً"
  ];

  const journeySteps = [
    {
      stepNum: "01",
      title: "التلاوة والتدبر الميسر",
      subtitle: "١٧ آية يومياً مقسمة بعد كل صلاة",
      desc: "تقرأ يومياً ١٧ آية مقرونة بالتفسير الميسر المعتمد من مجمع الملك فهد، موزعة بسلاسة بعد كل صلاة مفروضة (الفجر ٢، الظهر ٤، العصر ٤، المغرب ٣، العشاء ٤) بنفس عدد ركعات الصلاة لتختم القرآن كاملاً في عام واحد دون مشقة.",
      icon: BookOpen,
      color: "from-amber-400 to-orange-500",
      accent: "text-amber-400"
    },
    {
      stepNum: "02",
      title: "مؤقت السكينة والتركيز",
      subtitle: "15 ثانية للتأمل العميق",
      desc: "قبل الانتقال للاختبار، يتوقف المؤقت الذكي لـ 15 ثانية صامتة تستحضر فيها عظمة التوجيه الرباني، وتغرس معاني الآية في قلبك بعيداً عن التشتت السريع.",
      icon: Clock,
      color: "from-purple-400 to-indigo-500",
      accent: "text-purple-400"
    },
    {
      stepNum: "03",
      title: "الاختبار الذكي التفاعلي",
      subtitle: "توليد فوري بالذكاء الاصطناعي",
      desc: "محركات الذكاء الاصطناعي المتقدمة (Gemini / Groq / OpenRouter) تُنشئ لك سؤالاً تحليلياً متجدداً يقيس عمق استيعابك لمعنى الآية ويثبته في ذاكرتك.",
      icon: Zap,
      color: "from-cyan-400 to-blue-500",
      accent: "text-cyan-400"
    },
    {
      stepNum: "04",
      title: "المثال الواقعي والمعرض الشخصي",
      subtitle: "أثر الآية في حياتك اليومية",
      desc: "تتلقى تطبيقاً واقعياً في جملتين أو ثلاث، مع دليل متوهج مستنبط حصراً من التفسير، وتستطيع بنقرة واحدة حفظ الآية في معرضك الشخصي وتدوين خواطرك.",
      icon: BookMarked,
      color: "from-emerald-400 to-teal-500",
      accent: "text-emerald-400"
    }
  ];

  const faqs = [
    {
      q: "ما هي الفكرة الأساسية وراء منصة Shaheen Islam؟",
      a: "Shaheen Islam هي منصة معرفية تفاعلية تهدف لتقريب علوم القرآن والتدبر الإيماني لكل مسلم، من خلال دمج أصالة الوحي والتفاسير المعتمدة بأحدث تقنيات الذكاء الاصطناعي لتوفير تجربة تعلم ذكية، عملية، ومحفزة على الاستمرار اليومي."
    },
    {
      q: "لماذا تم اعتماد ١٧ آية يومياً؟ وكيف أوزعها بعد كل صلاة مفروضة؟",
      a: "الـ ١٧ آية يومياً تمثل القسمة المباركة لختم القرآن الكريم كاملاً (٦,٢٣٦ آية) تدبراً وفهماً وعملاً خلال عام واحد فقط (~٣٦٦ يوماً). وسر الاستمرار السهل هو توزيعها بعد الصلوات الخمس بالتوافق التام مع عدد ركعات الفريضة (١٧ ركعة مفروضة في اليوم والليلة):\n• بعد صلاة الفجر (ركعتان): آيتان فقط (٢ آية)\n• بعد صلاة الظهر (٤ ركعات): ٤ آيات\n• بعد صلاة العصر (٤ ركعات): ٤ آيات\n• بعد صلاة المغرب (٣ ركعات): ٣ آيات\n• بعد صلاة العشاء (٤ ركعات): ٤ آيات\nالمجموع = ١٧ آية يومياً! بضع دقائق فقط بعد كل صلاة تُبقي قلبك موصولاً بالقرآن طوال اليوم دون أي انقطاع."
    },
    {
      q: "ما هو مصدر التفسير المعتمد في المنصة؟ وهل يعتمد الذكاء الاصطناعي في الفتوى؟",
      a: "مصدر التفسير هو كتاب «التفسير الميسر» المعتمد والصادر عن مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة. الذكاء الاصطناعي لا يفتي ولا يؤلف، بل يُلزم بدقة صارمة بصياغة أسئلة الفهم والأمثلة واستخراج الأدلة حصراً من نص التفسير الميسر المعروض أمامه دون أي خروج عن النص."
    },
    {
      q: "كيف يعمل المعرض الشخصي للآيات؟",
      a: "المعرض الشخصي هو مستودعك الإيماني الخاص. عند مرورك بأي آية أثرت فيك أثناء رحلة التفسير، تضغط على «حفظ في المعرض الشخصي 📌». فتُحفظ كبطاقة نيونية متوهجة تضم الآية وتفسيرها ومثالها الواقعي، مع إمكانية إضافة خواطرك الخاصة وتعديلها والرجوع إليها في أي وقت."
    },
    {
      q: "لماذا يتم قفل التقدم اليومي بعد إكمال الورد حتى منتصف الليل؟",
      a: "هذا النظام التربوي وُضع لمنع القراءة السطحية المتعجلة ولغرس خُلق «الدوام والاستمرارية»، عملاً بحديث النبي ﷺ: «أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ». ليبقى لسانك رطباً بذكر الله وعقلك متدبراً لكتابه يوماً بيوم."
    },
    {
      q: "كيف أستخرج مفتاح الذكاء الاصطناعي مجاناً من Google AI Studio وأين أضعه؟",
      a: "يمكنك الدخول مباشرة إلى الرابط الرسمي https://aistudio.google.com/api-keys وتسجيل الدخول بحساب Google (Gmail). اضغط على «Get API key» ثم «Create key in new project» وانسخ الرمز السري الذي يبدأ بـ AIzaSy... بعد ذلك، ضعه مباشرة في صندوق التفعيل التفاعلي بالصفحة الرئيسية أو في صفحة «إعدادات API» من القائمة العلوية واضغط «حفظ وتفعيل». المفتاح مجاني 100% ولا يحتاج أي بطاقة بنكية ويُحفظ في جهازك فقط."
    }
  ];

  return (
    <div className="w-full flex flex-col items-center justify-between p-4 sm:p-8 md:p-12 font-arabic overflow-hidden" dir="rtl">
      
      {/* ========================================================
          1. TOP SLOGAN TICKER MARQUEE (شريط السلوجانز الإيمانية)
          ======================================================== */}
      <div className="w-full max-w-6xl mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/60 via-black/80 to-violet-950/60 border border-violet-500/30 backdrop-blur-xl p-3 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-xl border border-amber-400/40 whitespace-nowrap flex-shrink-0 animate-pulse">
            <Flame size={14} className="text-amber-400" />
            <span>نبض المنصة</span>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <motion.div 
              animate={{ x: [800, -800] }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="flex items-center gap-12 whitespace-nowrap text-xs sm:text-sm font-semibold text-blue-200/90"
            >
              {inspirationalSlogans.map((slogan, idx) => (
                <span key={idx} className="flex items-center gap-3">
                  <Sparkles size={13} className="text-amber-300 flex-shrink-0" />
                  <span className="font-bold text-white hover:text-amber-300 transition-colors cursor-default">{slogan}</span>
                  <span className="text-white/20">✦</span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto relative z-10 flex flex-col items-center flex-grow justify-center py-6">

        {/* ========================================================
            2. HERO SECTION WITH GRAND UPDATED SLOGAN
            ======================================================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 lg:mb-16 w-full flex flex-col items-center"
        >
          {/* Slogan Pill */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-violet-400/40 bg-gradient-to-r from-violet-900/40 via-purple-800/30 to-blue-900/40 backdrop-blur-md mb-6 text-amber-300 text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(167,139,250,0.3)] select-none hover:scale-105 transition-transform"
          >
            <Sparkles size={16} className="text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>منصة التدبر الشرعي الذكي المتكاملة</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-mono">١٤٤٦ هـ</span>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-300 drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)] mb-6 font-sans select-none" dir="ltr">
            Shaheen Islam
          </h1>

          {/* User Requested Main Headline Slogan */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-arabic font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-cyan-300 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] mb-6 select-none leading-tight max-w-4xl"
          >
            اعْمَلْ لِآخِرَتِك.. وَاشْتَرِ نَجَاتَكَ فِي جَنَّتِك
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-base sm:text-lg lg:text-xl text-blue-100/90 max-w-3xl mx-auto font-arabic leading-relaxed font-medium mb-8"
          >
            بوابتك الذكية الأولى لختم تدبر القرآن الكريم كاملاً، عبر نظام تفاعلي يجمع بين أصالة <span className="text-amber-300 font-bold">التفسير الميسر</span> وقوة <span className="text-cyan-300 font-bold">الذكاء الاصطناعي</span> لترسيخ الفهم واختبار الحفظ وربط الآيات بالواقع المعاش.
          </motion.p>

          {/* Spiritual Prayer Times Division Promo Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.8 }}
            className="w-full max-w-4xl p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-violet-950/70 via-black/80 to-blue-950/70 border border-amber-500/40 backdrop-blur-xl mb-8 shadow-[0_0_35px_rgba(245,158,11,0.2)] text-right relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30 flex-shrink-0">
                  <Sparkles size={20} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>خطة الـ ١٧ آية بعد كل صلاة: سر الاستمرار السهل</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-normal">
                      ١٧ ركعة مفروضة = ١٧ آية
                    </span>
                  </h4>
                  <p className="text-xs text-blue-200/70 mt-0.5">
                    لا ترهق نفسك دفعة واحدة! قسّم الـ ١٧ آية بعد صلواتك الخمس بنفس عدد ركعات الفريضة التي قضيتها:
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono font-bold text-amber-300 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10 whitespace-nowrap self-start sm:self-auto">
                المجموع: ٢ + ٤ + ٤ + ٣ + ٤ = ١٧ آية
              </div>
            </div>

            {/* 5 Prayers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all flex flex-col items-center gap-1 group">
                <span className="text-[11px] text-blue-200/80 font-bold group-hover:text-amber-300 transition-colors">بعد الفجر (ركعتان)</span>
                <span className="text-lg font-black text-amber-300 font-mono">٢ آيات</span>
                <span className="text-[10px] text-white/50">دقيقة ونصف فقط</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all flex flex-col items-center gap-1 group">
                <span className="text-[11px] text-blue-200/80 font-bold group-hover:text-amber-300 transition-colors">بعد الظهر (٤ ركعات)</span>
                <span className="text-lg font-black text-amber-300 font-mono">٤ آيات</span>
                <span className="text-[10px] text-white/50">٣ دقائق فقط</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all flex flex-col items-center gap-1 group">
                <span className="text-[11px] text-blue-200/80 font-bold group-hover:text-amber-300 transition-colors">بعد العصر (٤ ركعات)</span>
                <span className="text-lg font-black text-amber-300 font-mono">٤ آيات</span>
                <span className="text-[10px] text-white/50">٣ دقائق فقط</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all flex flex-col items-center gap-1 group">
                <span className="text-[11px] text-blue-200/80 font-bold group-hover:text-amber-300 transition-colors">بعد المغرب (٣ ركعات)</span>
                <span className="text-lg font-black text-amber-300 font-mono">٣ آيات</span>
                <span className="text-[10px] text-white/50">دقيقتان فقط</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all flex flex-col items-center gap-1 group col-span-2 sm:col-span-1">
                <span className="text-[11px] text-blue-200/80 font-bold group-hover:text-amber-300 transition-colors">بعد العشاء (٤ ركعات)</span>
                <span className="text-lg font-black text-amber-300 font-mono">٤ آيات</span>
                <span className="text-[10px] text-white/50">٣ دقائق فقط</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link 
              to="/tafsir.html" 
              className="button !w-auto !min-w-[260px] px-6 !h-12 !text-sm font-bold shadow-[0_0_25px_rgba(232,28,255,0.4)] whitespace-nowrap"
            >
              بدء رحلة التفسير اليومية (17 آية) 🚀
            </Link>
            <Link to="/database.html" className="button !w-44 !h-12 !text-sm font-bold shadow-[0_0_25px_rgba(64,201,255,0.4)]">
              المعرض الشخصي 📌
            </Link>
          </motion.div>
        </motion.div>

        {/* ========================================================
            3. PORTALS GRID (بوابات المنصة ومحركاتها)
            ======================================================== */}
        <div className="w-full mb-20">
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <span>بوابات ومحركات المنصة الرئيسية</span>
                <span className="text-xs px-2.5 py-1 bg-violet-600/30 text-violet-300 rounded-lg border border-violet-500/30">
                  انقر للدخول
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-blue-200/70 mt-1">
                اختر البوابة التي ترغب بالبدء بها، أو استكشف الشرح التفاعلي الشامل أدناه.
              </p>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[310px]">
            <GlassCard
              title="Shaheen Tafsir (الماستر)"
              badge="١٧ آية يومياً"
              description="المنصة الأساسية لختم تدبر القرآن كاملاً عبر ١٧ آية يومياً، مقسمة برحمة وسلاسة بعد كل صلاة مفروضة."
              href="/tafsir.html"
              icon={BookOpen}
              isMain={true}
              buttonText="دخول التفسير (١٧ آية) 🚀"
              delay={0.1}
            />

            <GlassCard
              title="المعرض الشخصي للآيات والتفاسير"
              badge="مستودع تدبرك الخاص"
              description="مستودعك الإيماني للآيات والتفاسير والأمثلة الواقعية التي أثرت فيك وقمت بحفظها بتأثيرات Uiverse النيونية."
              href="/database.html"
              icon={BookMarked}
              isMain={true}
              buttonText="دخول المعرض 📌"
              delay={0.2}
            />

            <GlassCard
              title="محرك القوانين الكونية"
              badge="المعادلات الإيمانية"
              description="يحول مشاكلك وحلولها الى معادلات بناء على القران والسنة لتطبيقها في حياتك اليومية."
              href="#"
              icon={Compass}
              delay={0.3}
            />

            <GlassCard
              title="رادار الوقت الميت"
              badge="منجم الحسنات"
              description="حول صفحات الانترنت واوقات الانتظار الى منجم من الحسنات وكنز لا يفنى."
              href="#"
              icon={Layers}
              delay={0.4}
            />
          </div>
        </div>

        {/* ========================================================
            4. INTERACTIVE STEP-BY-STEP ROADMAP (شرح تفاعلي من الألف إلى الياء)
            ======================================================== */}
        <section className="w-full mb-20">
          <div className="text-center mb-10">
            <span className="px-4 py-1.5 rounded-full bg-violet-600/20 border border-violet-400/40 text-violet-300 text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              الدليل التفاعلي الشامل من الألف إلى الياء
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              كيف تعمل منصة Shaheen Islam؟
            </h2>
            <p className="text-blue-200/80 text-sm sm:text-base max-w-2xl mx-auto mt-2">
              رحلة متكاملة في ٤ محطات تفاعلية مصممة بعناية فائقة لنقلك من مجرد القراءة العابرة إلى التدبر الراسخ والعمل الصالح.
            </p>
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {journeySteps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 sm:p-5 rounded-2xl border text-right transition-all duration-300 flex flex-col justify-between gap-3 cursor-pointer group relative overflow-hidden ${
                    isSelected 
                      ? 'bg-gradient-to-b from-white/15 to-white/5 border-violet-400 shadow-[0_0_25px_rgba(139,92,246,0.35)] scale-[1.02]' 
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm bg-gradient-to-r ${step.color} text-slate-950 shadow-md`}>
                      {step.stepNum}
                    </span>
                    <Icon size={20} className={`${isSelected ? 'text-white' : 'text-white/40 group-hover:text-white/80'} transition-colors`} />
                  </div>

                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-white group-hover:text-violet-200 transition-colors">
                      {step.title}
                    </h4>
                    <p className={`text-xs ${step.accent} font-semibold mt-0.5`}>
                      {step.subtitle}
                    </p>
                  </div>

                  {isSelected && (
                    <motion.div 
                      layoutId="activeStepLine"
                      className="absolute bottom-0 right-0 left-0 h-1 bg-gradient-to-r from-violet-500 via-amber-400 to-cyan-400"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Step Showcase Card with Hover & Interactive Elements */}
          <motion.div 
            key={activeStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900/90 via-violet-950/40 to-black/90 border border-white/15 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center gap-8 justify-between relative z-10">
              <div className="space-y-4 max-w-2xl text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono">
                  <span>المحطة رقم {journeySteps[activeStep].stepNum} من 04</span>
                  <span>✦</span>
                  <span className={journeySteps[activeStep].accent}>{journeySteps[activeStep].subtitle}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                  {journeySteps[activeStep].title}
                </h3>

                <p className="text-base sm:text-lg text-blue-100/80 leading-relaxed font-normal">
                  {journeySteps[activeStep].desc}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link 
                    to="/tafsir.html" 
                    className="button !w-auto !px-6 !h-11 !text-xs font-bold shadow-lg"
                  >
                    تجربة هذه الخطوة عملياً 🚀
                  </Link>

                  <span className="text-xs text-white/50">
                    * صُممت لتناسب المبتدئ والمتقدم في طلب العلم.
                  </span>
                </div>
              </div>

              {/* Visual Feature Badge for the Active Step */}
              <div className="w-full lg:w-96 p-6 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-md shadow-inner flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-white/80">مميزات المحطة</span>
                  <Sparkles size={16} className="text-amber-400" />
                </div>

                {activeStep === 0 && (
                  <div className="space-y-2.5 text-xs sm:text-sm text-gray-300">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                      <span>نص مصحفي موثق بالرسم العثماني.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                      <span>تفسير مجمع الملك فهد لطباعة المصحف.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                      <span>فهرس شامل لـ 114 سورة و6236 آية.</span>
                    </p>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-2.5 text-xs sm:text-sm text-gray-300">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-purple-400 flex-shrink-0" />
                      <span>مؤقت دائري نافر متوهج لغرس السكينة.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-purple-400 flex-shrink-0" />
                      <span>منع التسرع والقفز العشوائي بين الآيات.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-purple-400 flex-shrink-0" />
                      <span>تهيئة الذهن لاستقبال الاختبار بتركيز.</span>
                    </p>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-2.5 text-xs sm:text-sm text-gray-300">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                      <span>أسئلة ذكية تتجدد عبر خوادم AI متقدمة.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                      <span>٤ خيارات مع تحليل وتوضيح سبب الإجابة.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                      <span>نظام إعادة المحاولة لترسيخ الصواب.</span>
                    </p>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-2.5 text-xs sm:text-sm text-gray-300">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 flex-shrink-0" />
                      <span>مثال عملي في جملتين أو ثلاث كحد أقصى.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 flex-shrink-0" />
                      <span>دليل أحمر متوهج حصرياً من نص التفسير.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400 flex-shrink-0" />
                      <span>حفظ فوري في المعرض الشخصي بتأثير Uiverse.</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ========================================================
            5. AI ENGINE SETUP & API KEY GUIDE (دليل إعداد الذكاء الاصطناعي خطوة بخطوة)
            ======================================================== */}
        <section className="w-full mb-20" id="ai-setup-guide">
          <div className="text-center mb-10">
            <span className="px-4 py-1.5 rounded-full bg-cyan-600/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3 inline-flex items-center gap-1.5">
              <Zap size={14} className="text-cyan-400 animate-pulse" />
              <span>دليل تفعيل محرك الذكاء الاصطناعي (Gemini AI) خطوة بخطوة</span>
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              كيف تفعّل الذكاء الاصطناعي ليعمل الموقع بأعلى كفاءة؟
            </h2>
            <p className="text-blue-200/80 text-sm sm:text-base max-w-2xl mx-auto mt-2 leading-relaxed">
              محرك الذكاء الاصطناعي <span className="text-cyan-300 font-bold">Google Gemini</span> مجاني 100% بدون أي بطاقة بنكية. إليك كيفية استخراج المفتاح بالرابط المباشر وأين تضعه بالضبط:
            </p>
          </div>

          {/* Direct Link Banner */}
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-950/80 via-blue-950/70 to-slate-900/90 border border-cyan-400/40 shadow-[0_0_40px_rgba(64,201,255,0.2)] mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 flex-shrink-0 shadow-lg">
                <Key size={32} className="animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> مجاني تماماً 100%
                  </span>
                  <span className="text-xs text-blue-200/70">بدون أي بطاقة مصرفية</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  بوابة مفاتيح Google AI Studio الرسمية
                </h3>
                <p className="text-xs sm:text-sm text-cyan-200/90 font-mono mt-0.5" dir="ltr">
                  https://aistudio.google.com/api-keys
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end relative z-10">
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer flex-1 md:flex-none justify-center"
              >
                <span>الانتقال إلى aistudio.google.com/api-keys 🚀</span>
                <ExternalLink size={18} />
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("https://aistudio.google.com/api-keys");
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="px-4 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                <span>{copiedLink ? 'تم نسخ الرابط!' : 'نسخ الرابط'}</span>
              </button>
            </div>
          </div>

          {/* 4 Interactive Visual Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between gap-4 group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono font-black text-sm flex items-center justify-center border border-cyan-400/30">
                    01
                  </span>
                  <ExternalLink size={18} className="text-cyan-400/60 group-hover:text-cyan-300 transition-colors" />
                </div>
                <h4 className="text-white font-bold text-base mb-1.5">
                  الدخول للموقع الرسمي
                </h4>
                <p className="text-blue-100/70 text-xs leading-relaxed">
                  اضغط على الرابط المباشر أعلاه للدخول إلى <strong className="text-cyan-300 font-mono">aistudio.google.com/api-keys</strong>. الموقع مجاني ورسمي من شركة Google.
                </p>
              </div>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
              >
                <span>فتح صفحة المفاتيح</span>
                <ChevronRight size={14} className="rotate-180" />
              </a>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-400/40 transition-all flex flex-col justify-between gap-4 group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 font-mono font-black text-sm flex items-center justify-center border border-violet-400/30">
                    02
                  </span>
                  <Key size={18} className="text-violet-400/60 group-hover:text-violet-300 transition-colors" />
                </div>
                <h4 className="text-white font-bold text-base mb-1.5">
                  تسجيل الدخول والنقر
                </h4>
                <p className="text-blue-100/70 text-xs leading-relaxed">
                  سجل الدخول بحساب Google (Gmail) العادي. ثم انقر على الزر الأزرق الواضح بالإنجليزية: <strong className="text-violet-300">«Get API key»</strong> أو <strong className="text-violet-300">«Create API key»</strong>.
                </p>
              </div>
              <span className="text-[11px] text-violet-300/80 font-mono">
                زر Get API key 🔑
              </span>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between gap-4 group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-black text-sm flex items-center justify-center border border-amber-400/30">
                    03
                  </span>
                  <Copy size={18} className="text-amber-400/60 group-hover:text-amber-300 transition-colors" />
                </div>
                <h4 className="text-white font-bold text-base mb-1.5">
                  توليد المفتاح ونسخه
                </h4>
                <p className="text-blue-100/70 text-xs leading-relaxed">
                  اختر <strong className="text-amber-300">Create key in new project</strong>، وسيظهر لك رمز سري طويل يبدأ بـ <strong className="text-amber-300 font-mono">AIzaSy...</strong>. انقر على أيقونة النسخ (Copy).
                </p>
              </div>
              <span className="text-[11px] text-amber-300/80 font-mono">
                رمز يبدأ بـ AIzaSy... 📋
              </span>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-400/30 hover:border-emerald-400/60 transition-all flex flex-col justify-between gap-4 group shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-black text-sm flex items-center justify-center border border-emerald-400/30">
                    04
                  </span>
                  <Save size={18} className="text-emerald-400/60 group-hover:text-emerald-300 transition-colors" />
                </div>
                <h4 className="text-emerald-200 font-bold text-base mb-1.5">
                  أين نضع المفتاح؟
                </h4>
                <p className="text-emerald-100/80 text-xs leading-relaxed">
                  الصقه في حقل الإدخال أدناه واضغط <strong>«حفظ وتفعيل المفتاح 💾»</strong>، أو توجه لصفحة <strong className="text-white">إعدادات API</strong> من القائمة العلوية. سيُحفظ بأمان في متصفحك!
                </p>
              </div>
              <span className="text-[11px] text-emerald-300 font-bold">
                جاهز للتفعيل الفوري أدناه 👇
              </span>
            </div>
          </div>

          {/* Interactive Live API Key Box */}
          <div className="w-full bg-[#070b19] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
                  <Cpu size={24} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>صندوق تفعيل واختبار مفتاح الذكاء الاصطناعي (Gemini)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-normal">
                      مباشر بالصفحة
                    </span>
                  </h3>
                  <p className="text-xs text-blue-200/70 mt-0.5">
                    الصق المفتاح هنا واضغط حفظ، وسيتم ربطه تلقائياً بكل سور وآيات المنصة ومحاكي الاستنباط.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {localStorage.getItem('GOOGLE_API_KEY') ? (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 size={15} />
                    <span>المفتاح مفعّل ومخزّن بنجاح ✓</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold animate-pulse">
                    <AlertCircle size={15} />
                    <span>بانتظار إدخال المفتاح ⚠️</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input & Action Buttons */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showKeyPassword ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="الصق مفتاح Google Gemini هنا (يبدأ بـ AIzaSy...)"
                  className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-2xl px-5 py-4 pl-28 pr-12 text-sm sm:text-base text-white placeholder-blue-200/30 font-mono transition-all outline-none text-left"
                  dir="ltr"
                />
                <Key size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" />

                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowKeyPassword(!showKeyPassword)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
                    title={showKeyPassword ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
                  >
                    {showKeyPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={handlePasteApiKey}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 text-xs font-bold border border-cyan-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                    title="لصق من الحافظة"
                  >
                    <Copy size={13} />
                    <span>لصق</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                  >
                    <Save size={16} />
                    <span>{keySaveSuccess ? 'تم حفظ وتفعيل المفتاح بنجاح! ✓' : 'حفظ وتفعيل المفتاح 💾'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestApiKey}
                    disabled={keyTesting}
                    className="px-5 py-3 bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/40 font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {keyTesting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin text-cyan-400" />
                        <span>جاري فحص المفتاح مع Google...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={16} className="text-amber-400" />
                        <span>اختبار صلاحية المفتاح الآن ⚡</span>
                      </>
                    )}
                  </button>
                </div>

                <Link
                  to="/settings.html"
                  className="text-xs text-blue-200/80 hover:text-white flex items-center gap-1 underline underline-offset-4 transition-colors"
                >
                  <span>صفحة إعدادات API المتقدمة (Groq / OpenRouter)</span>
                  <ExternalLink size={13} />
                </Link>
              </div>

              {/* Live Test Result Alert */}
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                      : 'bg-red-500/15 border-red-500/30 text-red-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </motion.div>
              )}

              {/* Privacy Guarantee Note */}
              <div className="pt-2 text-[11px] text-blue-200/60 flex items-center gap-2">
                <Lock size={13} className="text-emerald-400 flex-shrink-0" />
                <span>ضمان الخصوصية التامة: مفتاحك يُحفظ حصراً داخل متصفحك محلياً (Local Storage) ولا يمكن لأحد الوصول إليه.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            6. LIVE INTERACTIVE SIMULATOR (محاكي تفاعلي حي للمنصة)
            ======================================================== */}
        <section className="w-full mb-20">
          <div className="text-center mb-8">
            <span className="px-4 py-1.5 rounded-full bg-cyan-600/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              تجربة حية تفاعلية على الصفحة الرئيسية
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              جرب تجربة Shaheen Islam الآن
            </h2>
            <p className="text-blue-200/80 text-sm max-w-xl mx-auto mt-2">
              اضغط على التبويبات أدناه لاختبار كل جزء من أجزاء المنصة مباشرة وتفاعل معها قبل الدخول للموقع كاملاً.
            </p>
          </div>

          {/* Simulator Container */}
          <div className="w-full bg-[#050510] border border-white/15 rounded-3xl p-4 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            
            {/* Simulator Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 border-b border-white/10 pb-4">
              <button
                onClick={() => setActiveSimTab('tafsir')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeSimTab === 'tafsir' 
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)]' 
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <BookOpen size={15} />
                <span>1. بطاقة الآية والتفسير</span>
              </button>

              <button
                onClick={() => setActiveSimTab('evidence')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeSimTab === 'evidence' 
                    ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <Zap size={15} />
                <span>2. المثال والدليل المتوهج</span>
              </button>

              <button
                onClick={() => setActiveSimTab('quiz')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeSimTab === 'quiz' 
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)]' 
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <Sparkles size={15} />
                <span>3. الاختبار التفاعلي الذكي</span>
              </button>

              <button
                onClick={() => setActiveSimTab('gallery')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeSimTab === 'gallery' 
                    ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]' 
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <BookMarked size={15} />
                <span>4. كارت المعرض النيوني</span>
              </button>
            </div>

            {/* Tab 1 Content: Verse & Tafsir */}
            {activeSimTab === 'tafsir' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-gradient-to-r from-amber-500/15 via-black/60 to-amber-500/15 p-6 sm:p-8 rounded-2xl border border-amber-400/30 text-center">
                  <span className="text-xs font-bold text-amber-300 block mb-2">سورة الفاتحة - الآية ٥</span>
                  <p className="font-uthmanic text-2xl sm:text-4xl text-amber-100 font-bold leading-loose">
                    ﴿ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴾
                  </p>
                </div>

                <div className="bg-black/60 p-5 sm:p-6 rounded-2xl border border-white/10 space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[#e81cff] flex items-center gap-2">
                    <BookOpen size={16} />
                    <span>التفسير الميسر المعتمد (مجمع الملك فهد):</span>
                  </h4>
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                    إِنَّا نَخُصُّكَ وَحْدَكَ بِالْعِبَادَةِ، وَنَسْتَعِينُ بِكَ وَحْدَكَ فِي جَمِيعِ أُمُورِنَا، فَالْأَمْرُ كُلُّهُ بِيَدِكَ، لَا يَمْلِكُ مِنْهُ أَحَدٌ مِثْقَالَ ذَرَّةٍ.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Tab 2 Content: Real-Life Example & Glowing Evidence Button */}
            {activeSimTab === 'evidence' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-blue-900/20 p-5 sm:p-6 rounded-2xl border border-blue-500/30 space-y-3">
                  <h4 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                    <Zap size={16} className="text-blue-400" />
                    <span>تطبيق عملي ومثال من الواقع (جملتان أو ثلاث كحد أقصى):</span>
                  </h4>
                  <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                    حين يواجه المرء ضائقة في عمله أو دراسته، يبدأ بالتوكل الصادق على الله أولاً ودعائه بإخلاص، ثم يبذل أقصى وسعه في الأخذ بالأسباب المشروعة. هذا الجمع بين نية التعبد وطلب العون هو حقيقة التوحيد العملي في يومياتنا.
                  </p>

                  {/* Red Glowing Interactive Evidence Trigger */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => setSimEvidenceOpen(prev => !prev)}
                      className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        simEvidenceOpen
                          ? 'bg-red-600/30 text-red-200 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                          : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                      }`}
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <span>{simEvidenceOpen ? 'إخفاء الدليل من التفسير ✕' : 'ما هو الدليل على صحة ذلك من التفسير؟ (اضغط للتأكد) 🔍'}</span>
                    </button>

                    <AnimatePresence>
                      {simEvidenceOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-3"
                        >
                          <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-black to-red-950/80 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] text-xs sm:text-sm space-y-2">
                            <span className="text-red-400 font-bold block">
                              الدليل والحجة من نص التفسير الميسر المذكور فقط (دون أي مصدر خارجي):
                            </span>
                            <p className="text-red-100 bg-black/60 p-3 rounded-lg border border-red-500/30 font-medium">
                              قول التفسير الميسر صراحة: «إِنَّا نَخُصُّكَ وَحْدَكَ بِالْعِبَادَةِ، وَنَسْتَعِينُ بِكَ وَحْدَكَ فِي جَمِيعِ أُمُورِنَا، فَالْأَمْرُ كُلُّهُ بِيَدِكَ» — وهو الشاهد القاطع على أن الاستعانة بالله مقترنة بالعمل في جميع شؤون الحياة.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 3 Content: Interactive Quiz Simulator */}
            {activeSimTab === 'quiz' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-4 sm:p-6 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between text-xs text-white/50 border-b border-white/10 pb-2">
                    <span>سؤال استيعابي تفاعلي</span>
                    <span className="text-cyan-400 font-bold">مولد بالذكاء الاصطناعي</span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-white">
                    ما المعنى الجوهري المقصود بتقديم «إِيَّاكَ نَعْبُدُ» على «إِيَّاكَ نَسْتَعِينُ» في الآية؟
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { idx: 0, text: "تقديم حق الله تعالى في العبادة أولاً ثم التوسل بطلب عونه", isCorrect: true },
                      { idx: 1, text: "طلب المعونة من المخلوقين قبل الخالق سبحانه", isCorrect: false },
                      { idx: 2, text: "الاكتفاء بالدعاء دون السعي أو بذل الأسباب", isCorrect: false },
                      { idx: 3, text: "أن الاستعانة أهم من إفراد الله بالعبادة", isCorrect: false }
                    ].map((opt) => {
                      const isChosen = simQuizSelected === opt.idx;
                      return (
                        <button
                          key={opt.idx}
                          onClick={() => setSimQuizSelected(opt.idx)}
                          className={`p-3.5 rounded-xl border text-right text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                            isChosen
                              ? opt.isCorrect
                                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                : 'bg-red-500/25 border-red-400 text-red-200'
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/90'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {isChosen && opt.isCorrect && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mr-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {simQuizSelected !== null && (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-blue-200">
                      {simQuizSelected === 0 ? (
                        <span className="text-emerald-300 font-bold">
                          أحسنت! إجابة صحيحة. قُدمت العبادة لأنها حق الله، والاستعانة وسيلة لنيل ذلك الحق.
                        </span>
                      ) : (
                        <span className="text-red-300 font-bold">
                          إجابة غير دقيقة. حاول اختيار الخيار الأول لتتعرف على التوجيه الشرعي الدقيق.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tab 4 Content: Uiverse Personal Gallery Card */}
            {activeSimTab === 'gallery' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center p-2">
                <div className="gallery-compact-card !max-w-sm">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="px-2 py-0.5 bg-white/10 text-white text-xs font-bold rounded">
                      سورة الفاتحة - آية ٥
                    </span>
                    <span className="text-[11px] text-[#40c9ff] font-bold font-mono">
                      #5 من 6236
                    </span>
                  </div>

                  <div className="bg-black/90 p-2.5 rounded-xl border border-white/10 text-center">
                    <span className="text-[10px] text-amber-300 block mb-0.5">القسم الأول: الآية</span>
                    <p className="font-uthmanic text-xl text-amber-100 font-bold">
                      ﴿ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴾
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="bg-white/[0.02] p-2 rounded-lg border border-[#e81cff]/20 text-[11px]">
                      <span className="text-[#e81cff] font-bold block">القسم الثاني: التفسير</span>
                      <p className="text-white/80 line-clamp-1">إنا نخصك وحدك بالعبادة ونستعين بك وحدك...</p>
                    </div>

                    <div className="bg-white/[0.02] p-2 rounded-lg border border-[#40c9ff]/20 text-[11px]">
                      <span className="text-[#40c9ff] font-bold block">القسم الثالث: مثال من الواقع</span>
                      <p className="text-cyan-100/80 line-clamp-1">التوكل الصادق مع بذل الأسباب في العمل والدراسة...</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-[#40c9ff] font-bold flex items-center gap-1">
                      <Maximize2 size={12} /> انقر للتكبير
                    </span>
                    <span className="font-bold tracking-wider" style={{ color: '#e81cff' }}>
                      Shaheen Tafsir
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </section>

        {/* ========================================================
            6. PLATFORM IMPACT & STATS COUNTERS (إحصائيات إيمانية)
            ======================================================== */}
        <section className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[
            { num: "٦,٢٣٦", label: "آية كريمة كاملة", sub: "مغطاة بالتفسير الميسر", icon: BookOpen },
            { num: "١١٤", label: "سورة مباركة", sub: "من الفاتحة إلى الناس", icon: Award },
            { num: "١٧", label: "آية يومياً", sub: "معدل الإنجاز المتوازن", icon: Flame },
            { num: "٣٦٥", label: "يوماً فقط", sub: "لختم القرآن تدبراً وعملاً", icon: Clock },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i} 
                className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center gap-2 hover:bg-white/10 hover:border-violet-500/40 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon size={20} />
                </div>
                <span className="font-mono text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-cyan-300">
                  {stat.num}
                </span>
                <span className="text-white font-bold text-sm sm:text-base">
                  {stat.label}
                </span>
                <span className="text-blue-200/60 text-xs">
                  {stat.sub}
                </span>
              </div>
            );
          })}
        </section>

        {/* ========================================================
            7. FAQ ACCORDION (الأسئلة الشائعة التفاعلية)
            ======================================================== */}
        <section className="w-full mb-20 max-w-4xl">
          <div className="text-center mb-8">
            <span className="px-4 py-1.5 rounded-full bg-violet-600/20 border border-violet-400/40 text-violet-300 text-xs font-bold uppercase tracking-wider mb-2 inline-block">
              كل ما تود معرفته عن المنصة
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              الأسئلة الشائعة والأجوبة الوافية
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-md transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-right text-white font-bold text-sm sm:text-base hover:text-amber-300 transition-colors cursor-pointer gap-4"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle size={18} className="text-violet-400 flex-shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    {isOpen ? <ChevronUp size={18} className="text-white/60" /> : <ChevronDown size={18} className="text-white/60" />}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 sm:p-5 pt-0 text-blue-100/80 text-xs sm:text-sm leading-relaxed border-t border-white/5 bg-black/20">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            8. FINAL CALL TO ACTION (السلوجان الختامي ونداء الانطلاق)
            ======================================================== */}
        <div className="w-full p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 border border-violet-400/40 text-center relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.3)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)]" />
          
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold inline-block">
              ﴿ وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ ﴾
            </span>

            <h3 className="text-3xl sm:text-4xl font-black text-white">
              اعْمَلْ لِآخِرَتِك.. وَاشْتَرِ نَجَاتَكَ فِي جَنَّتِك
            </h3>

            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
              ابدأ الآن ولا تؤجل، دقائق معدودة يومياً تصنع فارقاً أبدياً في ميزان حسناتك وترفع درجاتك في الفردوس الأعلى.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link 
                to="/tafsir.html" 
                className="button !w-auto !min-w-[260px] px-6 !h-12 !text-sm font-bold shadow-[0_0_30px_rgba(232,28,255,0.5)] whitespace-nowrap"
              >
                بدء رحلة التفسير اليومية (17 آية) 🚀
              </Link>
              <Link to="/database.html" className="button !w-48 !h-12 !text-sm font-bold shadow-[0_0_30px_rgba(64,201,255,0.5)]">
                تصفح المعرض الشخصي 📌
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
