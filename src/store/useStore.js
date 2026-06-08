import { create } from 'zustand';
import { generateMockAnalysis } from '../utils/scoring';

const useStore = create((set, get) => ({
  analyses: [],
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
    set({ analyses: updated, currentAnalysis: analysis, isAnalyzing: false });
    return analysis;
  },
}));

export default useStore;
