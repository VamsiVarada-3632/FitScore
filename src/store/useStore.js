import { create } from 'zustand';
import { generateMockAnalysis } from '../utils/scoring';

const STORAGE_KEY = 'fitscore_analyses';
const API_BASE = import.meta.env.VITE_API_URL || 'https://vamsiii3632-fitscoreapi.hf.space';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToStorage(analyses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
  } catch {}
}

const ICONS = ['bolt', 'label', 'star'];

function normalizeApiResponse(apiResponse) {
  const tips = (apiResponse.suggestions.tips || []).map((item, i) => ({
    icon: ICONS[i % ICONS.length],
    text: typeof item === 'string' ? item : item.text || '',
  }));

  return {
    id: apiResponse.analysis_id,
    createdAt: apiResponse.created_at,
    filename: apiResponse.filename,
    jdSnippet: apiResponse.jd_snippet,
    role: apiResponse.role,
    company: apiResponse.company,
    // Flat score fields
    score: Math.round(apiResponse.score.match_score),
    scoreLabel: apiResponse.score.score_label,
    scoreColor: apiResponse.score.score_color,
    resumeWordCount: apiResponse.score.resume_word_count,
    jdWordCount: apiResponse.score.jd_word_count,
    matchedKeywords: apiResponse.score.matched_keywords || [],
    missingKeywords: apiResponse.score.missing_keywords || [],
    // Flat gap_analysis fields
    skillsGap: apiResponse.gap_analysis.skills_gap || [],
    experienceGap: apiResponse.gap_analysis.experience_gap || '',
    educationGap: apiResponse.gap_analysis.education_gap || null,
    overallSummary: apiResponse.gap_analysis.overall_summary || '',
    atsScore: apiResponse.gap_analysis.ats_score_estimate || 0,
    // Flat suggestions fields
    summaryRewrite: apiResponse.suggestions.summary_rewrite || { original: '', improved: '' },
    bulletImprovements: apiResponse.suggestions.bullet_improvements || [],
    keywordsToAdd: apiResponse.suggestions.keywords_to_add || [],
    tips,
    processingTimeMs: apiResponse.processing_time_ms,
  };
}

const useStore = create((set, get) => ({
  analyses: loadFromStorage(),
  currentAnalysis: null,
  uploadedFile: null,
  jdText: '',
  isAnalyzing: false,
  analysisError: null,

  setUploadedFile: (file) => set({ uploadedFile: file }),
  setJdText: (text) => set({ jdText: text }),
  setIsAnalyzing: (val) => set({ isAnalyzing: val }),
  resetUpload: () => set({ uploadedFile: null, jdText: '' }),
  clearError: () => set({ analysisError: null }),

  startAnalysis: async () => {
    const { uploadedFile, jdText } = get();
    set({ isAnalyzing: true, analysisError: null });

    const formData = new FormData();
    formData.append('resume', uploadedFile);
    formData.append('jd_text', jdText);

    const response = await fetch(`${API_BASE}/analyze/full`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData.detail || `Server error ${response.status}`;
      set({ isAnalyzing: false, analysisError: message });
      throw new Error(message);
    }

    const apiResponse = await response.json();
    const normalized = normalizeApiResponse(apiResponse);

    const { analyses } = get();
    const updated = [normalized, ...analyses].slice(0, 20);
    saveToStorage(updated);

    set({ analyses: updated, currentAnalysis: normalized, isAnalyzing: false });
    return normalized;
  },

  setCurrentAnalysis: (id) => {
    const found = get().analyses.find((a) => a.id === id);
    set({ currentAnalysis: found || null });
  },

  deleteAnalysis: (id) => {
    const { analyses, currentAnalysis } = get();
    const updated = analyses.filter((a) => a.id !== id);
    saveToStorage(updated);
    set({
      analyses: updated,
      currentAnalysis: currentAnalysis?.id === id ? null : currentAnalysis,
    });
  },

  clearAll: () => {
    saveToStorage([]);
    set({ analyses: [], currentAnalysis: null });
  },

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
