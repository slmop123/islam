import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, ExternalLink, Key, CheckCircle, Save } from 'lucide-react';

export default function SettingsPage() {
  const [googleKey, setGoogleKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setGoogleKey(localStorage.getItem('GOOGLE_API_KEY') || '');
    setOpenRouterKey(localStorage.getItem('OPENROUTER_API_KEY') || '');
    setGroqKey(localStorage.getItem('GROQ_API_KEY') || '');
  }, []);

  const handleSave = () => {
    localStorage.setItem('GOOGLE_API_KEY', googleKey.trim());
    localStorage.setItem('OPENROUTER_API_KEY', openRouterKey.trim());
    localStorage.setItem('GROQ_API_KEY', groqKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-8 font-arabic" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col gap-8 relative"
      >
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <Settings className="text-blue-400" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white mb-2">إعدادات واجهات برمجة التطبيقات (API Keys)</h2>
            <p className="text-blue-200">قم بإعداد مفاتيح الذكاء الاصطناعي لضمان عمل محرك الاستنباط بكفاءة. سيبدأ النظام بمفتاح Google، وفي حال توقفه سينتقل تلقائياً للخيارات الأخرى.</p>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Google API Key */}
          <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Key className="text-violet-400" size={24} />
                <h3 className="text-xl font-bold text-white">Google Gemini API (الأساسي)</h3>
              </div>
              <a 
                href="https://aistudio.google.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 px-4 py-2 rounded-lg border border-violet-500/30 transition-colors"
              >
                كيفية الحصول عليه <ExternalLink size={14} />
              </a>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              1. اضغط على الزر أعلاه للذهاب لموقع Google AI Studio.<br/>
              2. قم بتسجيل الدخول بحساب جوجل واضغط على "Get API key".<br/>
              3. اضغط على "Create API key" ثم انسخ الرمز والصقه هنا.
            </p>
            <input 
              type="password" 
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-left focus:outline-none focus:border-violet-500 transition-colors"
              dir="ltr"
            />
          </div>

          {/* OpenRouter API Key */}
          <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Key className="text-blue-400" size={24} />
                <h3 className="text-xl font-bold text-white">OpenRouter API (بديل أول)</h3>
              </div>
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-4 py-2 rounded-lg border border-blue-500/30 transition-colors"
              >
                كيفية الحصول عليه <ExternalLink size={14} />
              </a>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              1. اذهب لموقع OpenRouter من خلال الزر أعلاه.<br/>
              2. قم بإنشاء حساب أو تسجيل الدخول.<br/>
              3. انقر على "Create Key"، اختر اسماً له، وانسخ الرمز والصقه هنا.
            </p>
            <input 
              type="password" 
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-left focus:outline-none focus:border-blue-500 transition-colors"
              dir="ltr"
            />
          </div>

          {/* Groq API Key */}
          <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Key className="text-emerald-400" size={24} />
                <h3 className="text-xl font-bold text-white">Groq API (بديل ثاني)</h3>
              </div>
              <a 
                href="https://console.groq.com/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 px-4 py-2 rounded-lg border border-emerald-500/30 transition-colors"
              >
                كيفية الحصول عليه <ExternalLink size={14} />
              </a>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              1. انتقل إلى منصة Groq.<br/>
              2. سجل الدخول واذهب إلى قسم API Keys.<br/>
              3. انقر "Create API Key" وانسخه ثم الصقه هنا.
            </p>
            <input 
              type="password" 
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-left focus:outline-none focus:border-emerald-500 transition-colors"
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-4">
          {saved ? (
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle size={20} />
              تم الحفظ بنجاح!
            </div>
          ) : (
            <div></div>
          )}
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors shadow-lg"
          >
            <Save size={20} />
            حفظ الإعدادات
          </button>
        </div>
      </motion.div>
    </div>
  );
}
