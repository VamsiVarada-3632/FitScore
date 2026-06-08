import { create } from 'zustand';
import { generateMockAnalysis } from '../utils/scoring';

const STORAGE_KEY = 'fitscore_analyses';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToStorage(analyses) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses)); } catch {}
}

const useStore = create((set, get) => ({
  analyses: loadFromStorage(),
  currentAnalysis: null,
  uploadedFile: null,
  jdText: '',
  isAnalyzing: false,

  setUploadedFile: (file) => set({ uploadedFile: file }),
  setJdText: (text) => set({ jdText: text }),
  setIsAnalyzing: (val) => set({ isAnalyzing: val }),
  resetUpload: () => set({ uploadedFile: null, jdText: '' }),

  startAnalysis: () => {
    const { uploadedFile, jdText, analyses } = get();
    const analysis = generateMockAnalysis(uploadedFile, jdText);
    const updated = [analysis, ...analyses];
    saveToStorage(updated);
    set({ analyses: updated, currentAnalysis: analysis, isAnalyzing: false });
    return analysis;
  },
}));

export default useStore;
