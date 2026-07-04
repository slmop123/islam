import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database as DBIcon, Trash2, Calendar } from 'lucide-react';
import { FlyingLetters } from './components/FlyingLetters';

interface SavedEntry {
  id: string;
  query: string;
  timestamp: string;
  data: {
    explanation: string;
    real_life_example: string;
    sources: string;
    quiz_question: string;
    quiz_answer: string;
  };
}

export default function Database() {
  const [entries, setEntries] = useState<SavedEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('SiteSec_DB');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // sort by newest
        setEntries(parsed.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('SiteSec_DB', JSON.stringify(updated));
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  };

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-5xl z-10 flex flex-col flex-grow mt-8">
        {entries.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
            <DBIcon size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/50 font-arabic text-xl">المعرض الشخصي فارغ. احفظ الاستنباطات من المحرك لتظهر هنا.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg flex flex-col gap-4 relative group"
                >
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="absolute top-4 left-4 p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-full transition opacity-0 group-hover:opacity-100"
                    title="حذف"
                  >
                    <Trash2 size={20} />
                  </button>
                  
                  <div className="flex items-center gap-2 text-blue-200/60 font-arabic text-sm">
                    <Calendar size={14} />
                    <span>{formatDate(entry.timestamp)}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold font-arabic text-white mb-2">"{entry.query}"</h3>
                  
                  <div className="flex-grow">
                    <p className="text-white/80 font-arabic text-sm line-clamp-3 bg-black/20 p-4 rounded-xl">
                      {entry.data.explanation}
                    </p>
                  </div>
                  
                  <div className="text-emerald-300/80 font-arabic text-xs mt-2 truncate">
                    المصادر: {entry.data.sources}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
