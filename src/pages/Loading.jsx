import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const MESSAGES = [
  'Reading your resume…',
  'Parsing job description…',
  'Computing match score…',
  'Running gap analysis…',
  'Generating AI suggestions…',
  'Almost done…',
];

const rings = [
  { size: 200, borderOpacity: 0.2, delay: 0 },
  { size: 160, borderOpacity: 0.4, delay: 0.5 },
  { size: 120, borderOpacity: 0.6, delay: 1 },
];

// Progress fills to 88% over ~15s while API runs, then snaps to 100% on completion
const FILL_DURATION = 15000;

export default function Loading() {
  const navigate = useNavigate();
  const { uploadedFile, jdText, startAnalysis } = useStore();
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!uploadedFile && !jdText) { navigate('/upload'); return; }
    if (started.current) return;
    started.current = true;

    // Cycle messages every 2.5s while waiting for API
    const msgInterval = setInterval(() => {
      setMsgIndex(i => (i < MESSAGES.length - 1 ? i + 1 : i));
    }, 2500);

    // Animate progress 0 → 88% over FILL_DURATION (slow fill while API runs)
    const t0 = Date.now();
    const progInterval = setInterval(() => {
      const elapsed = Date.now() - t0;
      const pct = Math.min((elapsed / FILL_DURATION) * 88, 88);
      setProgress(pct);
    }, 80);

    // Fire the real API call
    startAnalysis()
      .then(() => {
        clearInterval(progInterval);
        clearInterval(msgInterval);
        setProgress(100);
        setDone(true);
        setTimeout(() => navigate('/results'), 700);
      })
      .catch(() => {
        clearInterval(progInterval);
        clearInterval(msgInterval);
        navigate('/upload?error=analysis_failed');
      });

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full top-1/4 left-1/4"
          style={{ background: '#46f1c5', filter: 'blur(100px)', opacity: 0.04 }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
          <span className="font-syne font-bold text-2xl text-primary">FitScore</span>
        </div>

        {/* Pulsing rings */}
        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
          {rings.map((ring, i) => (
            <motion.div key={i} className="absolute rounded-full border-2"
              style={{
                width: ring.size, height: ring.size,
                borderColor: `rgba(70,241,197,${ring.borderOpacity})`,
                boxShadow: i === 2 ? '0 0 20px rgba(70,241,197,0.2)' : 'none',
              }}
              animate={{ scale: [1, 1.12, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, delay: ring.delay, repeat: Infinity, ease: 'easeInOut' }} />
          ))}
          <motion.span className="material-symbols-outlined text-primary text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
            memory
          </motion.span>
        </div>

        {/* Status message */}
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p key={done ? 'done' : msgIndex} className="text-base text-center"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {done
                ? <span className="text-primary font-semibold">Analysis Complete! ✓</span>
                : <span className="text-on-surface-variant">{MESSAGES[msgIndex]}</span>}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
          <motion.div className="h-full rounded-full bg-primary"
            style={{ boxShadow: '0 0 10px rgba(70,241,197,0.8)' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: done ? [0.16, 1, 0.3, 1] : 'linear', duration: done ? 0.4 : 0.1 }} />
        </div>

        <p className="text-xs text-on-surface-variant/50 font-mono">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
