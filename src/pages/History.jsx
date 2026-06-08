import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <motion.aside className="w-64 flex-shrink-0 border-r border-outline-variant/40 flex flex-col" style={{ background: '#0d1512' }}
        initial={{ x: -280 }} animate={{ x: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
        <div className="p-5 border-b border-outline-variant/30">
          <Link to="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
            <span className="font-syne font-bold text-lg text-primary">FitScore</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[{ label: 'Dashboard', href: '/', icon: 'home' }, { label: 'New Analysis', href: '/upload', icon: 'add_circle' }, { label: 'Match History', href: '/history', icon: 'history', active: true }].map(item => (
            <Link key={item.label} to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-outline-variant/30">
          <motion.button onClick={() => navigate('/upload')} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-primary text-on-primary text-sm font-semibold"
            whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(70,241,197,0.35)' }} whileTap={{ scale: 0.97 }}>
            <Plus size={16} /> New Analysis
          </motion.button>
        </div>
      </motion.aside>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r border-outline-variant/40 flex items-center justify-center" style={{ background: '#161d1a' }}>
          <p className="text-on-surface-variant text-sm">History list loading…</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-on-surface-variant text-sm">Select an analysis to view details</p>
        </div>
      </div>
    </div>
  );
}
