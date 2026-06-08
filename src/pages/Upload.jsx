import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import AuroraBackground from '../components/AuroraBackground';
import UploadZone from '../components/UploadZone';
import TipCard from '../components/TipCard';
import useStore from '../store/useStore';

const TIPS = [
  { icon: 'bolt', title: 'Use a clean PDF', description: 'Text-based PDFs give the most accurate keyword extraction.' },
  { icon: 'label', title: 'Full job description', description: 'Paste the entire JD including requirements and responsibilities.' },
  { icon: 'star', title: 'One role at a time', description: 'Analyze your resume against one specific job posting for best results.' },
  { icon: 'bolt', title: 'Tailor each resume', description: 'Consider tweaking your resume for each role to maximize your score.' },
];

export default function Upload() {
  const navigate = useNavigate();
  const { uploadedFile, jdText, setUploadedFile, setJdText, setIsAnalyzing } = useStore();
  const [charCount, setCharCount] = useState(jdText.length);
  const [shakeZone, setShakeZone] = useState(false);
  const [shakeJD, setShakeJD] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJdChange = useCallback((e) => { setJdText(e.target.value); setCharCount(e.target.value.length); }, [setJdText]);

  const handleAnalyze = useCallback(() => {
    if (!uploadedFile) { setShakeZone(true); setTimeout(() => setShakeZone(false), 500); return; }
    if (!jdText.trim()) { setShakeJD(true); setTimeout(() => setShakeJD(false), 500); return; }
    setLoading(true); setIsAnalyzing(true);
    setTimeout(() => navigate('/loading'), 300);
  }, [uploadedFile, jdText, navigate, setIsAnalyzing]);

  const disabled = !uploadedFile || !jdText.trim() || loading;

  return (
    <div className="relative min-h-screen bg-background">
      <AuroraBackground />
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div className="lg:col-span-7 flex flex-col gap-8" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">1</div>
                  <h2 className="font-syne font-bold text-lg text-on-surface">Upload Resume</h2>
                </div>
                <UploadZone file={uploadedFile} onFileSelect={setUploadedFile} onRemove={() => setUploadedFile(null)} shake={shakeZone} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">2</div>
                  <h2 className="font-syne font-bold text-lg text-on-surface">Paste Job Description</h2>
                </div>
                <motion.div animate={shakeJD ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
                  <div className="relative">
                    <textarea value={jdText} onChange={handleJdChange} placeholder="Paste the full job description here…"
                      className="w-full p-4 rounded-2xl text-sm text-on-surface placeholder-on-surface-variant/50 resize-none outline-none"
                      style={{ minHeight: 220, background: '#0F1826', border: '1.5px solid #1A2740' }}
                      onFocus={e => { e.target.style.borderColor = '#46f1c5'; e.target.style.boxShadow = '0 0 0 2px rgba(70,241,197,0.18)'; }}
                      onBlur={e => { e.target.style.borderColor = '#1A2740'; e.target.style.boxShadow = 'none'; }} />
                    <span className="absolute bottom-3 right-3 text-xs text-on-surface-variant/50 font-mono">{charCount} chars</span>
                  </div>
                </motion.div>
              </div>
              <motion.button onClick={handleAnalyze} disabled={disabled}
                className="w-full h-14 rounded-full font-semibold text-base flex items-center justify-center gap-2"
                style={{ background: disabled ? '#242c28' : 'linear-gradient(135deg,#46f1c5,#28dfb5)', color: disabled ? '#85948d' : '#08100d', cursor: disabled ? 'not-allowed' : 'pointer' }}
                whileHover={!disabled ? { scale: 1.02, boxShadow: '0 0 24px rgba(70,241,197,0.4)' } : {}} whileTap={!disabled ? { scale: 0.98 } : {}} aria-label="Start analysis">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>Analyze My Resume</>}
              </motion.button>
            </motion.div>
            <motion.div className="lg:col-span-5 flex flex-col gap-6" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              <div className="relative rounded-2xl border border-outline-variant/40 p-6 overflow-hidden" style={{ background: '#161d1a' }}>
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: '#46f1c5', filter: 'blur(60px)', opacity: 0.04 }} />
                <h3 className="font-syne font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="text-secondary material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
                  Tips for best results
                </h3>
                <div className="space-y-3">{TIPS.map((tip, i) => <TipCard key={i} icon={tip.icon} title={tip.title} description={tip.description} index={i} />)}</div>
              </div>
              <div className="rounded-2xl border border-outline-variant/40 p-6" style={{ background: '#161d1a' }}>
                <h3 className="font-syne font-bold text-on-surface mb-4">How it works</h3>
                <div className="flex items-center gap-2">
                  {[{ icon: 'article', label: 'Extract' }, { icon: 'analytics', label: 'Analyze' }, { icon: 'grade', label: 'Score' }].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl border border-outline-variant/50 flex items-center justify-center mb-1" style={{ background: '#19211e' }}>
                          <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                        </div>
                        <span className="text-xs text-on-surface-variant">{step.label}</span>
                      </div>
                      {i < 2 && <div className="w-6 h-px bg-outline-variant/50 mt-[-12px]" />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
