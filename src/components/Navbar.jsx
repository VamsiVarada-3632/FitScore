import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Plus } from 'lucide-react';

export default function Navbar({ activeLink = '' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { label: 'Features', href: '/#features' },
    { label: 'How it Works', href: '/#how' },
    { label: 'History', href: '/history' },
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-outline-variant/30"
      style={{ background: 'rgba(13,21,18,0.8)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
          <span className="font-syne font-bold text-xl text-primary">FitScore</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.label} to={l.href}
              className={`text-sm font-medium transition-colors duration-200 ${activeLink === l.label ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/upload')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-semibold">
            <Plus size={15} /> Get Started
          </button>
          <button className="md:hidden p-2 text-on-surface-variant" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden md:hidden border-t border-outline-variant/30 bg-surface-container-lowest">
            <div className="px-4 py-4 flex flex-col gap-4">
              {links.map(l => (
                <Link key={l.label} to={l.href} className="text-sm text-on-surface-variant hover:text-primary" onClick={() => setMenuOpen(false)}>{l.label}</Link>
              ))}
              <button onClick={() => { navigate('/upload'); setMenuOpen(false); }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-semibold">
                <Plus size={15} /> Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
