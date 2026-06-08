import { motion } from 'framer-motion';

const rings = [
  { size: 200, borderOpacity: 0.2, delay: 0, duration: 2 },
  { size: 160, borderOpacity: 0.4, delay: 0.5, duration: 2 },
  { size: 120, borderOpacity: 0.6, delay: 1, duration: 2 },
];

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 mb-12">
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
        <span className="font-syne font-bold text-2xl text-primary">FitScore</span>
      </div>
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        {rings.map((ring, i) => (
          <motion.div key={i} className="absolute rounded-full border-2"
            style={{ width: ring.size, height: ring.size, borderColor: `rgba(70,241,197,${ring.borderOpacity})` }}
            animate={{ scale: [1, 1.12, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: ring.duration, delay: ring.delay, repeat: Infinity, ease: 'easeInOut' }} />
        ))}
        <motion.span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}
          animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>memory</motion.span>
      </div>
    </div>
  );
}
