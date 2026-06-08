import { create } from 'zustand';

const useStore = create(() => ({
  analyses: [],
  currentAnalysis: null,
  uploadedFile: null,
  jdText: '',
  isAnalyzing: false,
}));

export default useStore;
