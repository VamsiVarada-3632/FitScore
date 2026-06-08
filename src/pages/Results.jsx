import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import AuroraBackground from '../components/AuroraBackground';
import ScoreRing from '../components/ScoreRing';
import useStore from '../store/useStore';

export default function Results() {
  const navigate = useNavigate();
  const { currentAnalysis } = useStore();

  if (!currentAnalysis) { navigate('/upload'); return null; }

  return (
    <div className="relative min-h-screen bg-background">
      <AuroraBackground />
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <motion.div className="rounded-2xl border border-outline-variant/40 p-6 mb-8" style={{ background: '#161d1a' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <ScoreRing score={currentAnalysis.score} />
              <div className="flex-1">
                <h1 className="font-syne font-extrabold text-2xl text-on-surface">{currentAnalysis.role}</h1>
                <p className="text-on-surface-variant mb-4">{currentAnalysis.company}</p>
              </div>
            </div>
          </motion.div>
          <p className="text-on-surface-variant text-center">Tabs loading…</p>
        </main>
      </div>
    </div>
  );
}
