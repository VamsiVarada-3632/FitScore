import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = ['Reading your resume…','Parsing job description…','Computing match score…','Running gap analysis…','Generating suggestions…','Almost done…'];
const rings = [{ size: 200, borderOpacity: 0.2, delay: 0 }, { size: 160, borderOpacity: 0.4, delay: 0.5 }, { size: 120, borderOpacity: 0.6, delay: 1 }];

export default function Loading() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setMsgIndex(i => Math.min(i + 1, MESSAGES.length - 1)), 750);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 mb-12">
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
        <span className="font-syne font-bold text-2xl text-primary">FitScore</span>
      </div>
      <div className="relative flex items-center justify-center mb-8" style={{ width: 220, height: 220 }}>
        {rings.map((ring, i) => (
          <motion.div key={i} className="absolute rounded-full border-2"
            style={{ width: ring.size, height: ring.size, borderColor: `rgba(70,241,197,${ring.borderOpacity})` }}
            animate={{ scale: [1, 1.12, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, delay: ring.delay, repeat: Infinity, ease: 'easeInOut' }} />
        ))}
        <motion.span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}
          animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>memory</motion.span>
      </div>
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p key={msgIndex} className="text-base text-on-surface-variant text-center"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
