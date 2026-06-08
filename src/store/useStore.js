import { create } from 'zustand';
import { generateMockAnalysis } from '../utils/scoring';

const STORAGE_KEY = 'fitscore_analyses';
const API_BASE = 'http://localhost:8001';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToStorage(analyses) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses)); } catch {}
}

// Map backend FullAnalysisResponse → frontend analysis shape
function mapBackendResponse(data) {
  const ICONS = ['bolt', 'label', 'star'];
  return {
    id: data.analysis_id,
    createdAt: data.created_at,
    filename: data.filename,
    jdSnippet: data.jd_snippet,
    role: data.role,
    company: data.company,
    score: Math.round(data.score.match_score),
    matchedKeywords: data.score.matched_keywords,
    missingKeywords: data.score.missing_keywords,
    skillsGap: data.gap_analysis.skills_gap,
    experienceGap: data.gap_analysis.experience_gap,
    educationGap: data.gap_analysis.education_gap,
    atsScore: data.gap_analysis.ats_score_estimate,
    bulletImprovements: data.suggestions.bullet_improvements,
    keywordsToAdd: data.suggestions.keywords_to_add,
    summaryRewrite: data.suggestions.summary_rewrite,
    tips: data.suggestions.tips.map((text, i) => ({
      icon: ICONS[i % ICONS.length],
      text,
    })),
  };
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

  startAnalysis: async () => {
    const { uploadedFile, jdText, analyses } = get();
    let analysis;

    try {
      const formData = new FormData();
      formData.append('resume', uploadedFile);
      formData.append('jd_text', jdText);

      const res = await fetch(`${API_BASE}/analyze/full`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      analysis = mapBackendResponse(data);
    } catch (err) {
      console.warn('Backend unavailable, using mock analysis:', err.message);
      analysis = generateMockAnalysis(uploadedFile, jdText);
    }

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
