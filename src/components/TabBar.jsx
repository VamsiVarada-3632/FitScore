import { memo } from 'react';
import { motion } from 'framer-motion';

const TabBar = memo(function TabBar({ tabs, activeTab, onChange }) {
  return (
    <div className="relative flex border-b border-outline-variant/40 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 focus:outline-none ${
            activeTab === tab.id
              ? 'text-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              style={{ borderRadius: 999 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
});

export default TabBar;
