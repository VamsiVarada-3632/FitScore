import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Copy, Check } from 'lucide-react';

export default function BeforeAfterCard({ original, improved, index = 0 }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(improved).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [improved]);

  return (
    <motion.div
      className="rounded-2xl overflow-hidden border border-outline-variant/50"
      style={{ background: '#0F1826' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.4 }}
    >
      {/* Original */}
      <motion.div
        className="p-4 border-b border-outline-variant/30"
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: index * 0.12 + 0.05 }}
      >
        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">
          Original
        </span>
        <p className="text-sm text-on-surface-variant/70 leading-relaxed">{original}</p>
      </motion.div>

      {/* Arrow */}
      <div className="flex items-center justify-center py-2 bg-surface-container-high/50">
        <ArrowRight size={16} className="text-primary" />
      </div>

      {/* Improved */}
      <motion.div
        className="p-4 relative"
        style={{ background: 'rgba(70,241,197,0.04)' }}
        initial={{ x: 24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: index * 0.12 + 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
            ✨ Improved
          </span>
          <motion.button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary transition-colors"
            whileTap={{ scale: 0.9 }}
            aria-label="Copy improved bullet"
          >
            {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
          </motion.button>
        </div>
        <p className="text-sm text-on-surface leading-relaxed">{improved}</p>
      </motion.div>
    </motion.div>
  );
}
