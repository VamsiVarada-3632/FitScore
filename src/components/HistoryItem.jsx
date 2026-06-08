import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getScoreColor, formatRelativeTime } from '../utils/scoring';

const HistoryItem = memo(function HistoryItem({ analysis, isActive, onClick, onDelete, index = 0 }) {
  const scoreColor = getScoreColor(analysis.score);

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      onDelete(analysis.id);
    },
    [analysis.id, onDelete]
  );

  return (
    <motion.div
      className={`relative group flex items-center gap-3 p-4 cursor-pointer rounded-xl transition-colors duration-150 ${
        isActive ? 'bg-primary/10' : 'hover:bg-surface-container-low'
      }`}
      style={isActive ? { borderLeft: '3px solid #46f1c5', paddingLeft: 13 } : { borderLeft: '3px solid transparent' }}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.06 }}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <p className="font-syne font-bold text-sm text-on-surface truncate">{analysis.role}</p>
        <p className="text-xs text-on-surface-variant truncate">{analysis.company}</p>
        <p className="text-xs text-on-surface-variant/60 mt-1">{formatRelativeTime(analysis.createdAt)}</p>
      </div>
      <div
        className="font-mono font-bold text-sm flex-shrink-0"
        style={{ color: scoreColor }}
      >
        {analysis.score}
      </div>
      <motion.button
        className="absolute right-3 top-3 p-1 rounded-md text-on-surface-variant hover:text-error transition-colors"
        initial={{ opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        onClick={handleDelete}
        style={{ opacity: undefined }}
        aria-label="Delete analysis"
      >
        <X size={14} />
      </motion.button>
    </motion.div>
  );
});

export default HistoryItem;
