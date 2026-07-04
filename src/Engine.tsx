import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, Rocket, Save, FileDown, CheckCircle, BrainCircuit, X, Sparkles, BookOpen } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { FlyingLetters } from './components/FlyingLetters';
import { GlowingInput } from './components/GlowingInput';
import { GlowingTextarea } from './components/GlowingTextarea';
import confetti from 'canvas-confetti';

interface AIResponse {
  explanation: string;
  real_life_example: string;
  sources: string;
  quiz_question: string;
  quiz_answer: string;
}

export default function Engine() {
  const [apiKey, setApiKey] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [error, setError] = useState('');
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizUserAnswer, setQuizUserAnswer] = useState('');
  const [quizResult, setQuizResult] = useState<'idle' | 'success' | 'fail'>('idle');

  const resultCardRef = useRef<HTMLDivElement>(null);

  const handleLaunch = async () => {
    if (!apiKey.trim()) {
      setError('الرجاء إدخال مفتاح الذكاء الاصطناعي (Gemini API Key).');
      return;
    }
    if (!query.trim()) {
      setError('الرجاء إدخال سؤالك الشرعي.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          userApiKey: apiKey.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء الاتصال بالمحرك.');
      }

      if (data.text) {
        const parsed = JSON.parse(data.text) as AIResponse;
        setResult(parsed);
      } else {
        throw new Error("No response generated.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء الاتصال بالمحرك.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDatabase = () => {
    if (!result) return;
    
    try {
      const existing = localStorage.getItem('SiteSec_DB');
      const db = existing ? JSON.parse(existing) : [];
      
      const entry = {
        id: Date.now().toString(),
        query,
        timestamp: new Date().toISOString(),
        data: result
      };
      
      db.push(entry);
      localStorage.setItem('SiteSec_DB', JSON.stringify(db));
      
      // Play a simple success beep using Web Audio API
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);

      alert('تم الحفظ في المعرض بنجاح! 🎉');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الحفظ.');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleQuizSubmit = () => {
    // Basic validation, checking if they typed something meaningful
    if (quizUserAnswer.length > 3) {
      setQuizResult('success');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#3b82f6', '#ffffff']
      });
      setTimeout(() => {
        setQuizModalOpen(false);
        setQuizResult('idle');
        setQuizUserAnswer('');
      }, 3000);
    } else {
      setQuizResult('fail');
    }
  };

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl z-10 flex flex-col items-center flex-grow">
        
        {/* Input Hub */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col gap-6 relative"
        >
          <div className="flex flex-col gap-1 w-full">
            <GlowingInput 
              type="password" 
              placeholder="إجباري: أدخل المفتاح هنا..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              label="مفتاح الذكاء الاصطناعي (Gemini API Key) - إجباري"
            />
            <div className="text-right px-2 w-full font-arabic" dir="rtl">
              <a 
                href="https://aistudio.google.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 transition-colors text-xs underline"
              >
                احصل على مفتاح مجاني من هنا (aistudio.google.com/api-keys)
              </a>
            </div>
          </div>

          <GlowingTextarea 
            placeholder="ابحث عن تفسير آية، صحة حديث، أو اطرح أي سؤال شرعي..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {error && <div className="text-red-400 font-arabic text-sm px-2">{error}</div>}

          <button 
            onClick={handleLaunch}
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-arabic font-black text-2xl hover:from-blue-500 hover:to-violet-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? 'جاري الاستنباط...' : 'إطلاق المحرك'}
            {!loading && <Rocket className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" size={28} />}
          </button>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full py-12 flex flex-col items-center gap-4"
            >
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-t-violet-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-cyan-400 border-l-purple-500 rounded-full animate-[spin_1.5s_linear_reverse]"></div>
                <BrainCircuit className="text-white animate-pulse" size={32} />
              </div>
              <p className="text-blue-200 font-arabic font-bold text-lg animate-pulse tracking-widest">جاري معالجة البيانات من المصادر الموثوقة...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Container */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div 
              ref={resultCardRef}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="w-full mt-12 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2rem] p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col gap-8 relative overflow-hidden text-right print-area"
            >
              {/* Decorative glare */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-violet-300 font-arabic font-bold text-xl mb-3 flex items-center gap-2">
                    <CheckCircle size={20} /> الخلاصة الشرعية
                  </h4>
                  <p className="text-white font-arabic text-lg leading-relaxed bg-black/20 p-6 rounded-2xl border border-white/5">{result.explanation}</p>
                </div>

                <div>
                  <h4 className="text-blue-300 font-arabic font-bold text-xl mb-3 flex items-center gap-2">
                    <Sparkles size={20} /> مثال من الواقع
                  </h4>
                  <p className="text-blue-50 font-arabic text-lg leading-relaxed bg-blue-900/20 p-6 rounded-2xl border border-blue-500/20">{result.real_life_example}</p>
                </div>

                <div>
                  <h4 className="text-emerald-300 font-arabic font-bold text-xl mb-3 flex items-center gap-2">
                    <BookOpen size={20} /> المصادر المعتمدة
                  </h4>
                  <p className="text-emerald-50 font-arabic text-base bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20">{result.sources}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 mt-4 pdf-hide border-t border-white/10 pt-8">
                <button 
                  onClick={handleSaveToDatabase}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-arabic font-bold border border-white/10 transition"
                >
                  <Save size={20} />
                  حفظ في المعرض
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-arabic font-bold border border-white/10 transition"
                >
                  <FileDown size={20} />
                  تصدير PDF
                </button>
                <button 
                  onClick={() => setQuizModalOpen(true)}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-arabic font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] transition"
                >
                  <BrainCircuit size={20} />
                  اختبر فهمك
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      {/* Quiz Modal */}
      <AnimatePresence>
        {quizModalOpen && result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setQuizModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-violet-500/30 p-8 rounded-3xl shadow-2xl z-10 w-full max-w-lg relative"
            >
              <button 
                onClick={() => setQuizModalOpen(false)}
                className="absolute top-4 left-4 text-white/50 hover:text-white"
              >
                <X size={24} />
              </button>
              <h3 className="text-2xl font-arabic font-bold text-white mb-6 pr-6">سؤال الاختبار الذكي</h3>
              <p className="text-blue-200 font-arabic mb-6 bg-blue-900/20 p-4 rounded-xl border border-blue-500/20">
                {result.quiz_question}
              </p>
              
              {quizResult !== 'success' ? (
                <>
                  <textarea 
                    rows={4}
                    placeholder="أدخل إجابتك هنا..."
                    value={quizUserAnswer}
                    onChange={(e) => setQuizUserAnswer(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-arabic resize-none focus:border-violet-500 focus:outline-none mb-4"
                  />
                  {quizResult === 'fail' && (
                    <p className="text-red-400 font-arabic text-sm mb-4">الإجابة قصيرة جداً أو غير مكتملة، حاول مرة أخرى.</p>
                  )}
                  <button 
                    onClick={handleQuizSubmit}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-arabic font-bold transition"
                  >
                    تحقق من الإجابة
                  </button>
                </>
              ) : (
                <div className="bg-emerald-900/30 border border-emerald-500/30 p-6 rounded-xl text-center">
                  <CheckCircle className="text-emerald-400 mx-auto mb-4" size={48} />
                  <p className="text-white font-arabic font-bold text-lg mb-4">أحسنت! إجابة ممتازة.</p>
                  <div className="text-right">
                    <p className="text-emerald-300 font-arabic text-sm mb-2">الإجابة النموذجية:</p>
                    <p className="text-white/80 font-arabic text-sm">{result.quiz_answer}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
