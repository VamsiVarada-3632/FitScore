import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const MESSAGES = ['Reading your resume…','Parsing job description…','Computing match score…','Running gap analysis…','Generating suggestions…','Almost done…'];
const TOTAL = 4500;
const rings = [{ size: 200, borderOpacity: 0.2, delay: 0 }, { size: 160, borderOpacity: 0.4, delay: 0.5 }, { size: 120, borderOpacity: 0.6, delay: 1 }];

export default function Loading() {
  const navigate = useNavigate();
  const { uploadedFile, jdText, startAnalysis } = useStore();
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!uploadedFile && !jdText) { navigate('/upload'); return; }
    const msgInterval = setInterval(() => setMsgIndex(i => Math.min(i + 1, MESSAGES.length - 1)), TOTAL / MESSAGES.length);
    const t0 = Date.now();
    const progInterval = setInterval(() => setProgress(Math.min(((Date.now() - t0) / TOTAL) * 100, 100)), 50);
    const completeTimer = setTimeout(() => {
      if (!started.current) { started.current = true; startAnalysis(); }
      setProgress(100); setDone(true);
      setTimeout(() => navigate('/results'), 600);
    }, TOTAL);
    return () => { clearInterval(msgInterval); clearInterval(progInterval); clearTimeout(completeTimer); };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full top-1/4 left-1/4" style={{ background: '#46f1c5', filter: 'blur(100px)', opacity: 0.04 }} />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
          <span className="font-syne font-bold text-2xl text-primary">FitScore</span>
        </div>
        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
          {rings.map((ring, i) => (
            <motion.div key={i} className="absolute rounded-full border-2"
              style={{ width: ring.size, height: ring.size, borderColor: `rgba(70,241,197,${ring.borderOpacity})`, boxShadow: i === 2 ? '0 0 20px rgba(70,241,197,0.2)' : 'none' }}
              animate={{ scale: [1, 1.12, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, delay: ring.delay, repeat: Infinity, ease: 'easeInOut' }} />
          ))}
          <motion.span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}
            animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>memory</motion.span>
        </div>
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p key={done ? 'done' : msgIndex} className="text-base text-center"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {done ? <span className="text-primary font-semibold">Analysis Complete! ✓</span> : <span className="text-on-surface-variant">{MESSAGES[msgIndex]}</span>}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
          <motion.div className="h-full rounded-full bg-primary" style={{ boxShadow: '0 0 10px rgba(70,241,197,0.8)' }}
            animate={{ width: `${progress}%` }} transition={{ ease: 'linear', duration: 0.05 }} />
        </div>
        <p className="text-xs text-on-surface-variant/50 font-mono">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
