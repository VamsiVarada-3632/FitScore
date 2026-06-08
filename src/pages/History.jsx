import { useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText } from 'lucide-react';
import ScoreRing from '../components/ScoreRing';
import HistoryItem from '../components/HistoryItem';
import useStore from '../store/useStore';
import { formatRelativeTime } from '../utils/scoring';

export default function History() {
  const navigate = useNavigate();
  const { analyses, currentAnalysis, setCurrentAnalysis, deleteAnalysis } = useStore();

  const handleSelect = useCallback((id) => setCurrentAnalysis(id), [setCurrentAnalysis]);
  const handleDelete = useCallback((id) => deleteAnalysis(id), [deleteAnalysis]);
  const handleViewFull = useCallback(() => navigate('/results'), [navigate]);

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
        <div className="w-80 flex-shrink-0 border-r border-outline-variant/40 overflow-y-auto" style={{ background: '#161d1a' }}>
          <div className="p-4 border-b border-outline-variant/30">
            <h2 className="font-syne font-bold text-on-surface">Match History</h2>
            <p className="text-xs text-on-surface-variant mt-1">{analyses.length} analys{analyses.length === 1 ? 'is' : 'es'}</p>
          </div>
          <div className="p-2">
            {analyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                  <FileText size={48} className="text-on-surface-variant/30 mx-auto mb-4" />
                </motion.div>
                <p className="text-sm text-on-surface-variant">No analyses yet.</p>
                <button onClick={() => navigate('/upload')} className="mt-4 px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-medium">Start Analyzing</button>
              </div>
            ) : analyses.map((a, i) => (
              <HistoryItem key={a.id} analysis={a} isActive={currentAnalysis?.id === a.id} onClick={() => handleSelect(a.id)} onDelete={handleDelete} index={i} />
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {currentAnalysis ? (
              <motion.div key={currentAnalysis.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="max-w-lg mx-auto rounded-2xl border border-outline-variant/40 p-6" style={{ background: '#161d1a' }}>
                  <div className="flex flex-col items-center mb-6"><ScoreRing score={currentAnalysis.score} size={140} /></div>
                  <h2 className="font-syne font-bold text-xl text-on-surface text-center">{currentAnalysis.role}</h2>
                  <p className="text-on-surface-variant text-center mb-4">{currentAnalysis.company}</p>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[{ label: 'Matched', value: (currentAnalysis.matchedKeywords || []).length, color: 'text-primary' }, { label: 'Missing', value: (currentAnalysis.missingKeywords || []).length, color: 'text-error' }, { label: 'ATS', value: currentAnalysis.atsScore || 0, color: 'text-secondary' }].map(stat => (
                      <div key={stat.label} className="text-center p-3 rounded-xl border border-outline-variant/30" style={{ background: '#19211e' }}>
                        <p className={`font-mono font-bold text-xl ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-on-surface-variant/60 text-center mb-4">{formatRelativeTime(currentAnalysis.createdAt)} · {currentAnalysis.filename}</p>
                  <div className="flex gap-3">
                    <motion.button onClick={handleViewFull} className="flex-1 py-2.5 rounded-full bg-primary text-on-primary text-sm font-semibold"
                      whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(70,241,197,0.35)' }} whileTap={{ scale: 0.97 }}>View Full Results</motion.button>
                    <motion.button onClick={() => handleDelete(currentAnalysis.id)} className="px-4 py-2.5 rounded-full border border-error/30 text-error text-sm font-medium"
                      whileHover={{ backgroundColor: 'rgba(255,180,171,0.08)' }} whileTap={{ scale: 0.97 }}>Delete</motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center">
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                  <span className="material-symbols-outlined text-on-surface-variant/20" style={{ fontSize: 64, fontVariationSettings: "'FILL' 0" }}>history</span>
                </motion.div>
                <p className="text-on-surface-variant mt-4">Select an analysis to view details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
