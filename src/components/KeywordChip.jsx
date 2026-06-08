import { memo } from 'react';
import { motion } from 'framer-motion';

const KeywordChip = memo(function KeywordChip({ label, variant = 'matched', index = 0 }) {
  const styles = variant === 'matched'
    ? 'bg-primary/10 text-primary border-primary/30 hover:border-primary/60'
    : 'bg-error-container/20 text-error border-error/30 hover:border-error/60';

  return (
    <motion.span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border cursor-default ${styles}`}
      initial={{ scale: 0.7, y: 10, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.05 }}
      whileHover={{ scale: 1.08 }}
    >
      {label}
    </motion.span>
  );
});

export default KeywordChip;
