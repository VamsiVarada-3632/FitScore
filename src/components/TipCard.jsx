import { memo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Tag, Star } from 'lucide-react';

const ICONS = { bolt: Zap, label: Tag, star: Star };

const TipCard = memo(function TipCard({ icon, title, description, text, index = 0 }) {
  const IconComponent = ICONS[icon] || Zap;
  const body = description || text || '';

  return (
    <motion.div
      className="p-4 rounded-xl border border-outline-variant/40 cursor-default"
      style={{ background: '#0F1826' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{
        borderColor: 'rgba(70,241,197,0.3)',
        backgroundColor: '#111c18',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg border border-tertiary/30 flex-shrink-0" style={{ background: 'rgba(255,206,166,0.08)' }}>
          <IconComponent size={16} className="text-tertiary" />
        </div>
        <div>
          {title && <p className="text-sm font-semibold text-on-surface mb-1">{title}</p>}
          <p className="text-sm text-on-surface-variant leading-relaxed">{body}</p>
        </div>
      </div>
    </motion.div>
  );
});

export default TipCard;
