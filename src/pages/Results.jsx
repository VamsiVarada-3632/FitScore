import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Download, RefreshCw, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import AuroraBackground from '../components/AuroraBackground';
import ScoreRing from '../components/ScoreRing';
import TabBar from '../components/TabBar';
import KeywordChip from '../components/KeywordChip';
import BeforeAfterCard from '../components/BeforeAfterCard';
import TipCard from '../components/TipCard';
import useStore from '../store/useStore';

const TABS = [
  { id: 'keywords', label: 'Keywords' },
  { id: 'gap', label: 'Gap Analysis' },
  { id: 'suggestions', label: 'Suggestions' },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);
  return (
    <motion.button onClick={handleCopy}
      className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary transition-colors"
      whileTap={{ scale: 0.9 }} aria-label="Copy text">
      {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
    </motion.button>
  );
}

function ATSCounter({ target }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let id;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 2000, 1);
      setCount(Math.round(progress * target));
      if (progress < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target]);
  return <span>{count}</span>;
}

function KeywordsTab({ analysis }) {
  const missingKeywords = analysis.missingKeywords || [];
  const matchedKeywords = analysis.matchedKeywords || [];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-semibold text-error mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-error" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
          Missing Keywords ({missingKeywords.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {missingKeywords.map((kw, i) => <KeywordChip key={kw} label={kw} variant="missing" index={i} />)}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Matched Keywords ({matchedKeywords.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {matchedKeywords.map((kw, i) => <KeywordChip key={kw} label={kw} variant="matched" index={i} />)}
        </div>
      </div>
      {missingKeywords.length > 0 && (
        <div className="md:col-span-2 p-4 rounded-xl border border-secondary/20 text-sm text-secondary" style={{ background: 'rgba(255,185,85,0.06)' }}>
          💡 Adding {missingKeywords.length} of these keywords could boost your score by ~{Math.round(missingKeywords.length * 2.4)} points
        </div>
      )}
    </motion.div>
  );
}

function GapTab({ analysis }) {
  const skillsGap = analysis.skillsGap || [];
  const experienceGap = analysis.experienceGap || '';
  const educationGap = analysis.educationGap || null;
  const atsScore = analysis.atsScore || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-4">
      {/* Skills Gap */}
      <motion.div className="p-5 rounded-2xl border border-secondary/20" style={{ background: '#161d1a' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <h3 className="font-syne font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1", fontSize: 20 }}>warning</span>
          Skills Gap
        </h3>
        {skillsGap.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skillsGap.map((skill, i) => (
              <motion.span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-secondary/30 text-secondary"
                style={{ background: 'rgba(255,185,85,0.08)' }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />{skill}
                <span className="text-on-surface-variant font-normal">Missing</span>
              </motion.span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant">No critical skills gap detected.</p>
        )}
      </motion.div>

      {/* Experience Gap */}
      <motion.div className="p-5 rounded-2xl border border-outline-variant/40" style={{ background: '#161d1a' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="font-syne font-bold text-on-surface mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>schedule</span>
          Experience Gap
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed">{experienceGap || 'No significant experience gap detected.'}</p>
      </motion.div>

      {/* Education Gap */}
      <motion.div className="p-5 rounded-2xl border border-outline-variant/40" style={{ background: '#161d1a' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h3 className="font-syne font-bold text-on-surface mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>school</span>
          Education Gap
        </h3>
        {educationGap ? (
          <p className="text-sm text-on-surface-variant">{educationGap}</p>
        ) : (
          <div className="flex items-center gap-2 text-primary text-sm">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            None detected — your education aligns well with the role.
          </div>
        )}
      </motion.div>

      {/* ATS Terminal */}
      <motion.div className="p-5 rounded-2xl border border-outline-variant/50 font-mono" style={{ background: '#080C14' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <p className="text-xs text-on-surface-variant mb-2">$ fitscore --ats-estimate</p>
        <p className="text-sm text-primary">
          {'> '}ATS Estimate: <ATSCounter target={atsScore} />{' / 100'}
          <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle" style={{ animation: 'blink 1s step-end infinite' }} />
        </p>
        <p className="text-xs text-on-surface-variant/50 mt-2">
          {atsScore >= 70 ? '✓ Likely to pass ATS filters' : '⚠ May be filtered — add more keywords'}
        </p>
      </motion.div>
    </motion.div>
  );
}

function SuggestionsTab({ analysis }) {
  const summaryRewrite = analysis.summaryRewrite || { original: '', improved: '' };
  const bulletImprovements = analysis.bulletImprovements || [];
  const keywordsToAdd = analysis.keywordsToAdd || [];
  const tips = analysis.tips || [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-6">
      {/* Summary Rewrite */}
      <div>
        <h3 className="font-syne font-bold text-on-surface mb-3">Professional Summary Rewrite</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div className="p-4 rounded-xl border border-outline-variant/40 opacity-70" style={{ background: '#161d1a' }}
            initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 0.7 }} transition={{ delay: 0.05 }}>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Your Current Summary</p>
            <p className="text-sm text-on-surface-variant leading-relaxed">{summaryRewrite.original || 'No summary found.'}</p>
          </motion.div>
          <motion.div className="p-4 rounded-xl border border-primary/30 relative" style={{ background: 'rgba(70,241,197,0.04)' }}
            initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-primary flex items-center gap-1">✨ AI Suggested Rewrite</span>
              <CopyButton text={summaryRewrite.improved || ''} />
            </div>
            <p className="text-sm text-on-surface leading-relaxed">{summaryRewrite.improved || 'Generating rewrite…'}</p>
          </motion.div>
        </div>
      </div>

      {/* Bullet improvements */}
      {bulletImprovements.length > 0 && (
        <div>
          <h3 className="font-syne font-bold text-on-surface mb-3">Bullet Point Improvements</h3>
          <div className="space-y-4">
            {bulletImprovements.map((item, i) => (
              <BeforeAfterCard key={i} original={item.original} improved={item.improved} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Keywords to add */}
      {keywordsToAdd.length > 0 && (
        <div>
          <h3 className="font-syne font-bold text-on-surface mb-3">Keywords to Add</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {keywordsToAdd.map((kw, i) => (
              <motion.span key={kw}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-secondary/30 text-secondary"
                style={{ background: 'rgba(255,185,85,0.08)' }}
                initial={{ scale: 0.7, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.05 }}
                whileHover={{ scale: 1.08 }}>
                {kw}
              </motion.span>
            ))}
          </div>
          <p className="text-sm text-on-surface-variant">Sprinkle these naturally into your skills section and experience bullets.</p>
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div>
          <h3 className="font-syne font-bold text-on-surface mb-3">Pro Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tips.map((tip, i) => (
              <TipCard key={i} icon={tip.icon || 'bolt'} text={tip.text || tip} index={i} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function Results() {
  const navigate = useNavigate();
  const { currentAnalysis, startAnalysis, resetUpload } = useStore();
  const [activeTab, setActiveTab] = useState('keywords');

  if (!currentAnalysis) { navigate('/upload'); return null; }

  const score = currentAnalysis.score || 0;
  const role = currentAnalysis.role || 'Analysis Result';
  const company = currentAnalysis.company || '';

  const handleDownload = useCallback(() => {
    const content = `FitScore AI Analysis Report
Generated: ${new Date(currentAnalysis.createdAt).toLocaleString()}

Role: ${role}
Company: ${company}
Match Score: ${score}/100
ATS Score: ${currentAnalysis.atsScore}/100

MATCHED KEYWORDS:
${(currentAnalysis.matchedKeywords || []).join(', ')}

MISSING KEYWORDS:
${(currentAnalysis.missingKeywords || []).join(', ')}

EXPERIENCE GAP:
${currentAnalysis.experienceGap || 'N/A'}

IMPROVED SUMMARY:
${currentAnalysis.summaryRewrite?.improved || 'N/A'}

BULLET IMPROVEMENTS:
${(currentAnalysis.bulletImprovements || []).map((b, i) => `${i + 1}. ORIGINAL: ${b.original}\n   IMPROVED: ${b.improved}`).join('\n\n')}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitscore_${role.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentAnalysis]);

  const handleNewResume = useCallback(() => { resetUpload(); navigate('/upload'); }, [navigate, resetUpload]);
  const handleReanalyze = useCallback(() => { navigate('/loading'); }, [navigate]);

  return (
    <div className="relative min-h-screen bg-background">
      <AuroraBackground />
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          {/* Score overview */}
          <motion.div className="rounded-2xl border border-outline-variant/40 p-6 mb-8" style={{ background: '#161d1a' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <ScoreRing score={score} />
              <div className="flex-1">
                <h1 className="font-syne font-extrabold text-2xl text-on-surface">{role}</h1>
                <p className="text-on-surface-variant mb-4">{company}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { label: currentAnalysis.filename, icon: 'description' },
                    { label: `${(currentAnalysis.matchedKeywords || []).length} matched`, icon: 'check_circle', color: 'text-primary' },
                    { label: `${(currentAnalysis.missingKeywords || []).length} missing`, icon: 'cancel', color: 'text-error' },
                  ].map((chip, i) => (
                    <motion.span key={chip.label}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-outline-variant/50 text-on-surface-variant"
                      style={{ background: '#19211e' }}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }}>
                      <span className={`material-symbols-outlined text-sm ${chip.color || ''}`}
                        style={{ fontVariationSettings: "'FILL' 1", fontSize: 14 }}>{chip.icon}</span>
                      {chip.label}
                    </motion.span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <motion.button onClick={handleReanalyze}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant/50 text-primary text-sm font-medium"
                    whileHover={{ backgroundColor: '#19211e', borderColor: 'rgba(70,241,197,0.4)' }} whileTap={{ scale: 0.97 }}>
                    <RefreshCw size={14} /> Re-analyze
                  </motion.button>
                  <motion.button onClick={handleNewResume}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant/50 text-on-surface-variant text-sm font-medium"
                    whileHover={{ backgroundColor: '#19211e' }} whileTap={{ scale: 0.97 }}>
                    <Plus size={14} /> New Resume
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div className="rounded-2xl border border-outline-variant/40 overflow-hidden" style={{ background: '#161d1a' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'keywords' && <KeywordsTab key="keywords" analysis={currentAnalysis} />}
                {activeTab === 'gap' && <GapTab key="gap" analysis={currentAnalysis} />}
                {activeTab === 'suggestions' && <SuggestionsTab key="suggestions" analysis={currentAnalysis} />}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div className="flex flex-col sm:flex-row gap-3 mt-8 pt-8 border-t border-outline-variant/30"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <motion.button onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-full bg-primary text-on-primary font-semibold text-sm"
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(70,241,197,0.4)' }} whileTap={{ scale: 0.97 }}>
              <Download size={16} /> Download Analysis Report
            </motion.button>
            <motion.button onClick={handleNewResume}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-full border border-outline-variant/50 text-on-surface-variant font-semibold text-sm"
              whileHover={{ backgroundColor: '#19211e' }} whileTap={{ scale: 0.97 }}>
              <Plus size={16} /> Analyze Another Resume
            </motion.button>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
