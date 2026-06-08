import { memo } from 'react';

const KeywordChip = memo(function KeywordChip({ label, variant = 'matched' }) {
  const styles = variant === 'matched'
    ? 'bg-primary/10 text-primary border-primary/30'
    : 'bg-error-container/20 text-error border-error/30';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles}`}>
      {label}
    </span>
  );
});

export default KeywordChip;
