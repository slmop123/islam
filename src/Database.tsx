import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookMarked, 
  Trash2, 
  Calendar, 
  BookOpen, 
  Zap, 
  ExternalLink, 
  Search, 
  Check, 
  Copy, 
  Edit3, 
  Save, 
  Info,
  Sparkles,
  ArrowRight,
  Bookmark,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
  CheckCircle2
} from 'lucide-react';
import { 
  SavedTafsirItem, 
  getSavedTafsirs, 
  removeSavedTafsir, 
  updateSavedTafsirNote 
} from './data/savedTafsirStorage';

export default function Database() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<SavedTafsirItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSurahFilter, setSelectedSurahFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mushaf'>('newest');
  
  // Enlarged modal selected item & evidence toggle
  const [selectedModalItem, setSelectedModalItem] = useState<SavedTafsirItem | null>(null);
  const [showModalEvidence, setShowModalEvidence] = useState<boolean>(false);

  // Reset modal evidence when switching items
  useEffect(() => {
    setShowModalEvidence(false);
  }, [selectedModalItem?.verseId]);

  // Note editing state: mapping verseId -> current text
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');

  // Toast feedback
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Load entries on mount and listen to changes
  useEffect(() => {
    const load = () => {
      const all = getSavedTafsirs();
      setEntries(all);
      // If modal is open, sync the active modal item
      if (selectedModalItem) {
        const refreshed = all.find(i => i.verseId === selectedModalItem.verseId);
        if (refreshed) {
          setSelectedModalItem(refreshed);
        }
      }
    };
    load();

    window.addEventListener('sitesec_saved_tafsirs_updated', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('sitesec_saved_tafsirs_updated', load);
      window.removeEventListener('storage', load);
    };
  }, [selectedModalItem?.verseId]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedModalItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 3000);
  };

  const handleDelete = (e: React.MouseEvent, verseId: number, surahName: string, verseNum: number) => {
    e.stopPropagation();
    if (window.confirm(`هل أنت متأكد من رغبتك في إزالة آية (${surahName} - ${verseNum}) من معرضك الشخصي؟`)) {
      removeSavedTafsir(verseId);
      if (selectedModalItem?.verseId === verseId) {
        setSelectedModalItem(null);
      }
      showToast('تمت إزالة الآية من المعرض الشخصي');
    }
  };

  const handleCopy = (e: React.MouseEvent, item: SavedTafsirItem) => {
    e.stopPropagation();
    const textToCopy = `﴿ ${item.arabicText} ﴾
[${item.surahName} - الآية ${item.verseNumber}]

📖 التفسير الميسر:
${item.tafsir}

⚡ تطبيق عملي ومثال من الواقع:
${item.realLifeExample}

🔍 الدليل من التفسير الميسر:
${item.tafsirEvidence || 'مستنبط مباشرة من عبارات التفسير الميسر المعتمد أعلاه.'}

محفوظة عبر منصة: Shaheen Islam (Shaheen Tafsir)`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(item.verseId);
      showToast('تم نسخ نص الآية والتفسير والمثال للحافظة ✅');
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleStartEditNote = (e: React.MouseEvent, item: SavedTafsirItem) => {
    e.stopPropagation();
    setEditingNoteId(item.verseId);
    setNoteDraft(item.personalNote || '');
  };

  const handleSaveNote = (verseId: number) => {
    updateSavedTafsirNote(verseId, noteDraft.trim());
    setEditingNoteId(null);
    showToast('تم حفظ خاطرتك وملاحظتك الشخصية بنجاح 📝');
  };

  const handleOpenInTafsir = (e: React.MouseEvent, verseId: number) => {
    e.stopPropagation();
    navigate(`/tafsir.html?verse=${verseId}`);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
    } catch {
      return 'تاريخ محفوظ';
    }
  };

  // Distinct surahs present in saved list
  const availableSurahs = useMemo(() => {
    const surahSet = new Set<string>();
    entries.forEach(e => surahSet.add(e.surahName));
    return Array.from(surahSet);
  }, [entries]);

  // Filtered and sorted entries
  const filteredEntries = useMemo(() => {
    return entries.filter(item => {
      // Surah filter
      if (selectedSurahFilter !== 'all' && item.surahName !== selectedSurahFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesArabic = item.arabicText.toLowerCase().includes(q);
        const matchesTafsir = item.tafsir.toLowerCase().includes(q);
        const matchesExample = item.realLifeExample.toLowerCase().includes(q);
        const matchesSurah = item.surahName.toLowerCase().includes(q);
        const matchesNote = (item.personalNote || '').toLowerCase().includes(q);
        const matchesNum = item.verseNumber.toString() === q;
        return matchesArabic || matchesTafsir || matchesExample || matchesSurah || matchesNote || matchesNum;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
      }
      if (sortBy === 'mushaf') {
        return a.verseId - b.verseId;
      }
      return 0;
    });
  }, [entries, searchQuery, selectedSurahFilter, sortBy]);

  // Navigate next / prev in modal
  const handleNextInModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedModalItem) return;
    const currentIndex = filteredEntries.findIndex(i => i.verseId === selectedModalItem.verseId);
    if (currentIndex >= 0 && currentIndex < filteredEntries.length - 1) {
      setSelectedModalItem(filteredEntries[currentIndex + 1]);
    } else if (filteredEntries.length > 0) {
      setSelectedModalItem(filteredEntries[0]); // Loop around
    }
  };

  const handlePrevInModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedModalItem) return;
    const currentIndex = filteredEntries.findIndex(i => i.verseId === selectedModalItem.verseId);
    if (currentIndex > 0) {
      setSelectedModalItem(filteredEntries[currentIndex - 1]);
    } else if (filteredEntries.length > 0) {
      setSelectedModalItem(filteredEntries[filteredEntries.length - 1]); // Loop around
    }
  };

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-8 font-arabic" dir="rtl">
      {/* Toast Notification */}
      <AnimatePresence>
        {notificationMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-amber-600 via-violet-600 to-indigo-600 text-white px-6 py-3.5 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-amber-300/40 font-bold flex items-center gap-3 backdrop-blur-xl"
          >
            <Sparkles size={18} className="text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-sm sm:text-base">{notificationMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-6xl z-10 flex flex-col flex-grow mt-4 gap-8">
        
        {/* Top Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-gradient-to-br from-slate-900/90 via-violet-950/40 to-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Background Ambient Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold border border-amber-500/30">
                <BookMarked size={16} />
                <span>المعرض الشخصي للآيات والتفاسير</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                مستودعك القرآني للتفاسير والأمثلة
              </h1>
              <p className="text-blue-100/80 text-sm sm:text-base max-w-2xl leading-relaxed">
                بطاقات مصغرة ذكية لكل آية قمت بحفظها أثناء رحلتك في <span className="text-amber-300 font-bold">SiteSec Tafsir</span>. <strong className="text-white">اضغط على أي بطاقة لعرض الآية كاملة ومكبرة</strong> مع تفسيرها وتطبيقها العملي.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <Link
                to="/tafsir.html"
                className="px-6 py-3.5 bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <BookOpen size={18} />
                <span>متابعة التفسير (SiteSec Tafsir)</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-blue-200/70 font-medium">الآيات المحفوظة</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {entries.length}
              </span>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-blue-200/70 font-medium">السور المشمولة</span>
              <span className="text-2xl sm:text-3xl font-black text-violet-300 font-mono">
                {availableSurahs.length}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-blue-200/70 font-medium">طريقة القراءة</span>
              <span className="text-sm sm:text-base font-bold text-[#40c9ff] flex items-center gap-1.5 mt-1">
                <Maximize2 size={16} /> انقر على أي بطاقة لتكبيرها
              </span>
            </div>
          </div>
        </motion.div>

        {/* Filter & Search Bar */}
        {entries.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-lg"
          >
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search size={18} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في نص الآية، السورة، التفسير، أو المثال العملي..."
                className="w-full pr-11 pl-4 py-3 bg-black/30 border border-white/15 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-violet-400 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-white/50 hover:text-white bg-white/10 px-2 py-0.5 rounded-lg"
                >
                  مسح
                </button>
              )}
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              {/* Surah Filter Dropdown */}
              <div className="relative flex-grow sm:flex-grow-0 min-w-[150px]">
                <select
                  value={selectedSurahFilter}
                  onChange={(e) => setSelectedSurahFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-violet-400 cursor-pointer appearance-none"
                >
                  <option value="all" className="bg-slate-900 text-white">كل السور ({availableSurahs.length})</option>
                  {availableSurahs.map(s => (
                    <option key={s} value={s} className="bg-slate-900 text-white">
                      سورة {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="relative flex-grow sm:flex-grow-0 min-w-[150px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-violet-400 cursor-pointer appearance-none"
                >
                  <option value="newest" className="bg-slate-900 text-white">الأحدث حفظاً</option>
                  <option value="oldest" className="bg-slate-900 text-white">الأقدم حفظاً</option>
                  <option value="mushaf" className="bg-slate-900 text-white">ترتيب المصحف</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Saved Items Grid or Empty State */}
        {entries.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-6 bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col items-center gap-6 shadow-2xl"
          >
            <div className="w-24 h-24 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Bookmark size={48} className="animate-pulse" />
            </div>

            <div className="space-y-2 max-w-lg">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                معرضك الشخصي لا يزال فارغاً
              </h2>
              <p className="text-blue-200/80 text-base leading-relaxed">
                أثناء قراءتك وتدبرك في <span className="text-amber-300 font-bold">Shaheen Tafsir</span>، عند مرورك بأي آية يعجبك تفسيرها أو مثالها الواقعي، اضغط على زر <span className="bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-bold border border-amber-500/30">حفظ في المعرض الشخصي 📌</span> وستظهر هنا كبطاقة تفاعلية مميزة.
              </p>
            </div>

            <Link
              to="/tafsir.html"
              className="mt-4 px-8 py-4 bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-bold text-lg rounded-2xl shadow-xl transition-all transform hover:scale-105 flex items-center gap-3"
            >
              <BookOpen size={22} />
              <span>ابدأ التفسير واحفظ أول آية الآن 🚀</span>
            </Link>
          </motion.div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
            <Search size={40} className="mx-auto text-white/30 mb-3" />
            <p className="text-white/70 text-lg font-bold">لا توجد نتائج مطابقة لبحثك أو التصفية الحالية</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedSurahFilter('all'); }}
              className="mt-4 text-xs font-bold text-amber-300 underline"
            >
              إعادة تعيين البحث والتصفية
            </button>
          </div>
        ) : (
          /* =======================================================
             Compact Cards Grid (Smaller cards with Uiverse glow effect)
             Clicking opens the Fullscreen Modal
             ======================================================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-1">
            <AnimatePresence>
              {filteredEntries.map((item) => (
                <motion.div
                  key={item.id || item.verseId}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  onClick={() => setSelectedModalItem(item)}
                  className="gallery-compact-card group"
                  title="انقر لتكبير البطاقة وقراءة التفسير كاملاً"
                >
                  {/* Card Header & Controls */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-white/10 text-white font-bold text-xs rounded-md border border-white/15">
                        سورة {item.surahName}
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#40c9ff]/15 text-[#40c9ff] text-[11px] font-mono font-bold rounded border border-[#40c9ff]/30">
                        آية {item.verseNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleCopy(e, item)}
                        className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition"
                        title="نسخ"
                      >
                        {copiedId === item.verseId ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, item.verseId, item.surahName, item.verseNumber)}
                        className="p-1 rounded-md bg-red-500/10 hover:bg-red-500/25 text-red-300 hover:text-red-200 transition"
                        title="حذف"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Section 1 Preview: Holy Quranic Ayah */}
                  <div className="bg-black/90 p-2.5 rounded-xl border border-white/10 text-center relative overflow-hidden group-hover:border-amber-400/40 transition-colors">
                    <span className="text-[10px] text-amber-300/80 font-bold block mb-1">
                      القسم الأول: الآية الكريمة
                    </span>
                    <p className="font-uthmanic text-lg sm:text-xl text-amber-100 font-bold leading-relaxed line-clamp-2">
                      ﴿ {item.arabicText} ﴾
                    </p>
                  </div>

                  {/* Sections 2 & 3 Snippet Previews */}
                  <div className="space-y-2 flex-grow">
                    {/* Section 2 Tafsir Snippet */}
                    <div className="bg-white/[0.02] p-2 rounded-lg border border-[#e81cff]/20">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#e81cff] mb-0.5">
                        <BookOpen size={12} />
                        <span>القسم الثاني: التفسير</span>
                      </div>
                      <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed">
                        {item.tafsir}
                      </p>
                    </div>

                    {/* Section 3 Practical Example Snippet */}
                    <div className="bg-white/[0.02] p-2 rounded-lg border border-[#40c9ff]/20">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#40c9ff] mb-0.5">
                        <Zap size={12} />
                        <span>القسم الثالث: مثال من الواقع</span>
                      </div>
                      <p className="text-[11px] text-cyan-100/80 line-clamp-2 leading-relaxed">
                        {item.realLifeExample}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom CTA & Footer matching Uiverse template */}
                  <div className="pt-2 border-t border-white/10 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#40c9ff] group-hover:text-white font-bold flex items-center gap-1 transition-colors">
                        <Maximize2 size={12} />
                        <span>انقر للتكبير والقراءة الكاملة</span>
                      </span>

                      <span className="text-[10px] text-white/40">
                        {formatDate(item.savedAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-white/40">Powered By</span>
                      <span className="font-bold tracking-wider" style={{ color: '#e81cff' }}>Shaheen Tafsir</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* =======================================================
          ENLARGED CARD MODAL (View in Full Screen / Large Card)
          ======================================================= */}
      <AnimatePresence>
        {selectedModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModalItem(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-xl"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              className="gallery-uiverse-card z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto custom-scrollbar relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 sticky top-0 bg-[#04040a]/95 backdrop-blur-md z-20 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-4 py-2 bg-white/10 text-white font-bold text-base sm:text-lg rounded-2xl border border-white/15">
                    سورة {selectedModalItem.surahName} - الآية {selectedModalItem.verseNumber}
                  </span>
                  <span className="px-3 py-1 bg-[#40c9ff]/15 text-[#40c9ff] text-xs font-mono font-bold rounded-xl border border-[#40c9ff]/30">
                    الآية رقم #{selectedModalItem.verseId} من 6236
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-white/50 font-medium mr-2">
                    <Calendar size={13} />
                    <span>{formatDate(selectedModalItem.savedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Prev / Next Ayah Controls */}
                  <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-0.5 ml-2">
                    <button
                      onClick={handleNextInModal}
                      className="p-2 hover:bg-white/15 text-white/80 hover:text-white rounded-lg transition"
                      title="الآية المحفوظة التالية"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <button
                      onClick={handlePrevInModal}
                      className="p-2 hover:bg-white/15 text-white/80 hover:text-white rounded-lg transition"
                      title="الآية المحفوظة السابقة"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleCopy(e, selectedModalItem)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
                    title="نسخ"
                  >
                    {copiedId === selectedModalItem.verseId ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    <span className="hidden sm:inline">نسخ</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, selectedModalItem.verseId, selectedModalItem.surahName, selectedModalItem.verseNumber)}
                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-300 hover:text-red-200 transition text-xs font-bold"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>

                  <button
                    onClick={() => setSelectedModalItem(null)}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors mr-1"
                    title="إغلاق العرض المكبر"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* ==========================================
                  القسم الأول: الآية الكريمة كاملة
                  ========================================== */}
              <div className="flex flex-col gap-2 mt-2">
                <p className="gallery-uiverse-heading flex items-center gap-2 text-white">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 flex-shrink-0">
                    📖
                  </span>
                  <span>القسم الأول: نص الآية الكريمة</span>
                </p>

                <div className="bg-black/90 p-6 sm:p-10 rounded-3xl border border-white/10 text-center relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e81cff]/10 via-transparent to-[#40c9ff]/10 pointer-events-none"></div>
                  <p className="font-uthmanic text-3xl sm:text-4xl lg:text-5xl text-amber-100 leading-loose tracking-wide font-bold drop-shadow-lg">
                    ﴿ {selectedModalItem.arabicText} ﴾
                  </p>
                </div>
              </div>

              {/* ==========================================
                  القسم الثاني: التفسير الميسر والمختصر كامل
                  ========================================== */}
              <div className="flex flex-col gap-2 mt-2">
                <p className="gallery-uiverse-heading flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#e81cff]/20 border border-[#e81cff]/40 flex items-center justify-center text-[#e81cff] flex-shrink-0">
                    <BookOpen size={20} />
                  </span>
                  <span className="text-[#e81cff] font-bold">القسم الثاني: التفسير الميسر والمختصر المعتمد</span>
                </p>

                <div className="bg-black/70 p-6 sm:p-7 rounded-2xl border border-[#e81cff]/30 flex flex-col justify-between gap-3 relative overflow-hidden shadow-inner">
                  <div className="absolute -left-10 -top-10 w-36 h-36 bg-[#e81cff]/10 rounded-full blur-2xl pointer-events-none"></div>
                  <p className="text-white text-lg sm:text-xl leading-relaxed font-normal">
                    {selectedModalItem.tafsir}
                  </p>

                  {selectedModalItem.sources && (
                    <div className="text-xs sm:text-sm text-pink-300/80 pt-4 border-t border-white/10 flex items-center gap-2">
                      <Info size={15} />
                      <span>المصادر المعتمدة: {selectedModalItem.sources}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ==========================================
                  القسم الثالث: تطبيق عملي ومثال من الواقع كامل
                  ========================================== */}
              <div className="flex flex-col gap-2 mt-2">
                <p className="gallery-uiverse-heading flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#40c9ff]/20 border border-[#40c9ff]/40 flex items-center justify-center text-[#40c9ff] flex-shrink-0">
                    <Zap size={20} />
                  </span>
                  <span className="text-[#40c9ff] font-bold">القسم الثالث: تطبيق عملي ومثال من الواقع</span>
                </p>

                <div className="bg-black/70 p-6 sm:p-7 rounded-2xl border border-[#40c9ff]/30 flex flex-col justify-between gap-4 relative overflow-hidden shadow-inner">
                  <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-[#40c9ff]/10 rounded-full blur-2xl pointer-events-none"></div>
                  <p className="text-cyan-100 text-lg sm:text-xl leading-relaxed font-normal">
                    {selectedModalItem.realLifeExample}
                  </p>

                  {/* Red Interactive Evidence Trigger & Glowing Evidence Box */}
                  <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModalEvidence(prev => !prev)}
                      className={`self-start px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer shadow-lg ${
                        showModalEvidence
                          ? 'bg-red-600/30 text-red-200 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                          : 'bg-red-500/15 hover:bg-red-500/25 text-red-300 hover:text-red-100 border-red-500/40 hover:border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                      }`}
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <span>{showModalEvidence ? 'إخفاء الدليل من التفسير ✕' : 'ما هو الدليل على صحة ذلك من التفسير؟ (اضغط للتأكد) 🔍'}</span>
                    </button>

                    <AnimatePresence>
                      {showModalEvidence && (
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
                              {selectedModalItem.tafsirEvidence || `الشاهد المباشر من التفسير الميسر: "${selectedModalItem.tafsir}" - وهو ما يثبت دلالة الآية الصريحة على صحة هذا التطبيق العملي وربطه المباشر بالمعنى المعتمد دون أي خروج عن النص.`}
                            </p>

                            <div className="text-[11px] text-red-300/70 flex items-center justify-between pt-1">
                              <span>* تم استنباط هذا الدليل حصرياً من التفسير الميسر المذكور أعلاه دون أي مصدر خارجي.</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="text-xs sm:text-sm text-[#40c9ff]/80 pt-2 border-t border-[#40c9ff]/20">
                    سياق تربوي وعملي لتطبيق هدايات الآية في السلوك والتعاملات اليومية
                  </div>
                </div>
              </div>

              {/* ==========================================
                  القسم الإضافي: تأملاتي وملاحظاتي الخاصة
                  ========================================== */}
              <div className="bg-white/[0.04] p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col gap-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
                    <Edit3 size={16} />
                    <span>تأملاتي وملاحظاتي الخاصة على هذه الآية:</span>
                  </span>

                  {editingNoteId !== selectedModalItem.verseId && (
                    <button
                      onClick={(e) => handleStartEditNote(e, selectedModalItem)}
                      className="text-xs sm:text-sm text-[#40c9ff] hover:text-white underline font-bold"
                    >
                      {selectedModalItem.personalNote ? 'تعديل الخاطرة' : '+ تدوين خاطرة شخصية'}
                    </button>
                  )}
                </div>

                {editingNoteId === selectedModalItem.verseId ? (
                  <div className="space-y-3">
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="اكتب هنا لماذا حفظت هذه الآية، وما هو الأثر الإيماني أو التدبر الذي عقدت العزم عليه..."
                      rows={4}
                      className="w-full p-4 bg-black/80 border border-violet-500/40 rounded-xl text-white text-base focus:outline-none focus:border-amber-400 transition-colors placeholder-white/30"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white/80 text-xs font-bold rounded-xl transition"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleSaveNote(selectedModalItem.verseId)}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                      >
                        <Save size={14} />
                        <span>حفظ الخاطرة</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {selectedModalItem.personalNote ? (
                      <p className="text-amber-100 text-base leading-relaxed bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 italic">
                        "{selectedModalItem.personalNote}"
                      </p>
                    ) : (
                      <p className="text-white/40 text-sm italic">
                        لم تقم بتدوين ملاحظة بعد. انقر على "+ تدوين خاطرة شخصية" لإضافة تدبرك الخاص.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ==========================================
                  Modal Footer & Actions
                  ========================================== */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-3">
                <button
                  onClick={(e) => handleOpenInTafsir(e, selectedModalItem.verseId)}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-black text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2.5"
                >
                  <ExternalLink size={18} />
                  <span>فتح الآية في رحلة التفسير والاختبار التفاعلي ⚡</span>
                </button>

                <p className="flex items-center gap-2 text-sm">
                  <span className="text-white/40">Powered By</span>
                  <span className="font-bold tracking-wider text-base" style={{ color: '#e81cff' }}>Shaheen Tafsir</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
