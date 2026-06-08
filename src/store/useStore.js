import { create } from 'zustand';

const useStore = create((set) => ({
  analyses: [],
  currentAnalysis: null,
  uploadedFile: null,
  jdText: '',
  isAnalyzing: false,

  setUploadedFile: (file) => set({ uploadedFile: file }),
  setJdText: (text) => set({ jdText: text }),
  setIsAnalyzing: (val) => set({ isAnalyzing: val }),
  resetUpload: () => set({ uploadedFile: null, jdText: '' }),
}));

export default useStore;
