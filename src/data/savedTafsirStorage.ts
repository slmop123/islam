export interface SavedTafsirItem {
  id: string; // e.g., 'verse-1'
  verseId: number; // 1 to 6236
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  arabicText: string;
  tafsir: string;
  realLifeExample: string;
  tafsirEvidence?: string; // الدليل من التفسير على صحة المثال الواقعي
  sources?: string;
  savedAt: string; // ISO date string
  personalNote?: string;
}

const STORAGE_KEY = 'shaheen_saved_tafsirs';
const LEGACY_STORAGE_KEY_1 = 'sitesec_saved_tafsirs';
const LEGACY_STORAGE_KEY_2 = 'SiteSec_DB';

/**
 * Retrieve all saved tafsirs from local storage.
 * Automatically migrates or falls back gracefully to any legacy entries.
 */
export function getSavedTafsirs(): SavedTafsirItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY_1);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // Check if there are legacy entries from previous engine
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY_2);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
        // Map any valid legacy entries to new format
        const converted: SavedTafsirItem[] = legacyParsed.map((item: any, idx: number) => ({
          id: item.id || `legacy-${idx}`,
          verseId: item.verseId || (idx + 1),
          surahNumber: item.surahNumber || 1,
          surahName: item.surahName || (item.query ? `استنباط: ${item.query.slice(0, 20)}` : 'آية مختارة'),
          verseNumber: item.verseNumber || 1,
          arabicText: item.arabicText || item.query || '',
          tafsir: item.data?.explanation || item.tafsir || '',
          realLifeExample: item.data?.real_life_example || item.realLifeExample || '',
          sources: item.data?.sources || item.sources || 'مصادر معتمدة',
          savedAt: item.timestamp || new Date().toISOString(),
          personalNote: item.personalNote || ''
        }));
        // Store migrated version
        localStorage.setItem(STORAGE_KEY, JSON.stringify(converted));
        return converted;
      }
    }
  } catch (err) {
    console.error('Error reading saved tafsirs from localStorage', err);
  }
  return [];
}

/**
 * Save a new tafsir or update existing
 */
export function saveTafsir(item: SavedTafsirItem): void {
  try {
    const items = getSavedTafsirs();
    const existingIndex = items.findIndex(i => i.verseId === item.verseId);
    if (existingIndex >= 0) {
      // Update existing
      items[existingIndex] = { ...items[existingIndex], ...item };
    } else {
      // Prepend newest
      items.unshift(item);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Trigger custom event so any active component can re-sync
    window.dispatchEvent(new Event('sitesec_saved_tafsirs_updated'));
  } catch (err) {
    console.error('Error saving tafsir to localStorage', err);
  }
}

/**
 * Remove a saved tafsir by verseId
 */
export function removeSavedTafsir(verseId: number): void {
  try {
    const items = getSavedTafsirs();
    const filtered = items.filter(i => i.verseId !== verseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('sitesec_saved_tafsirs_updated'));
  } catch (err) {
    console.error('Error removing saved tafsir', err);
  }
}

/**
 * Check if a verse is currently saved
 */
export function isVerseSaved(verseId: number): boolean {
  try {
    const items = getSavedTafsirs();
    return items.some(i => i.verseId === verseId);
  } catch {
    return false;
  }
}

/**
 * Update personal note for a saved verse
 */
export function updateSavedTafsirNote(verseId: number, note: string): void {
  try {
    const items = getSavedTafsirs();
    const item = items.find(i => i.verseId === verseId);
    if (item) {
      item.personalNote = note;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event('sitesec_saved_tafsirs_updated'));
    }
  } catch (err) {
    console.error('Error updating personal note', err);
  }
}
