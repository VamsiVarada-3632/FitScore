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

  setCurrentAnalysis: (id) => {
    const found = get().analyses.find((a) => a.id === id);
    set({ currentAnalysis: found || null });
  },

  deleteAnalysis: (id) => {
    const { analyses, currentAnalysis } = get();
    const updated = analyses.filter((a) => a.id !== id);
    saveToStorage(updated);
    set({ analyses: updated, currentAnalysis: currentAnalysis?.id === id ? null : currentAnalysis });
  },

  clearAll: () => { saveToStorage([]); set({ analyses: [], currentAnalysis: null }); },

  loadDemoAnalysis: () => {
    const demo = generateMockAnalysis(
      { name: 'john_doe_resume.pdf' },
      'We are looking for a Senior Frontend Engineer at Acme Corp to join our platform team. You will work with React, TypeScript, Node.js, and AWS.'
    );
    const { analyses } = get();
    const updated = [demo, ...analyses];
    saveToStorage(updated);
    set({ analyses: updated, currentAnalysis: demo });
    return demo;
  },
}));

export default useStore;
