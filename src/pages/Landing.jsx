import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import AuroraBackground from '../components/AuroraBackground';
import useStore from '../store/useStore';

const WORDS = ['Know', 'exactly', 'how', 'your', 'resume', 'fits.'];
const AVATARS = ['AK', 'JS', 'MR', 'TL'];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const wordVariant = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } };

export default function Landing() {
  const navigate = useNavigate();
  const { loadDemoAnalysis } = useStore();

  const handleDemo = () => { loadDemoAnalysis(); navigate('/results'); };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <AuroraBackground />
      <div className="relative z-10">
        <Navbar activeLink="Features" />
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-sm text-on-surface-variant" style={{ background: '#161d1a' }}>
              ✨ AI-Powered Resume Intelligence
            </motion.div>
            <motion.h1 className="font-syne font-extrabold leading-tight text-on-surface" style={{ fontSize: 'clamp(36px,5vw,64px)' }}
              variants={containerVariants} initial="hidden" animate="show">
              {WORDS.map((word, i) => (
                <motion.span key={i} variants={wordVariant} className="inline-block mr-3">{word}</motion.span>
              ))}
            </motion.h1>
            <motion.p className="text-lg text-on-surface-variant max-w-lg leading-relaxed" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              Upload your resume, paste any job description. Get a match score, skill gap analysis, and AI rewrite suggestions in seconds.
            </motion.p>
            <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
              <motion.button onClick={() => navigate('/upload')} className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-semibold"
                whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(70,241,197,0.4)' }} whileTap={{ scale: 0.97 }}>
                Analyze My Resume <ArrowRight size={18} />
              </motion.button>
              <motion.button onClick={handleDemo} className="px-6 py-3 rounded-full border border-outline-variant text-primary font-semibold"
                whileHover={{ backgroundColor: '#161d1a' }} whileTap={{ scale: 0.97 }}>
                See Demo Results
              </motion.button>
            </motion.div>
            <motion.div className="flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              <div className="flex -space-x-2">
                {AVATARS.map((initials, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-on-primary"
                    style={{ background: `hsl(${i * 60 + 160},50%,35%)` }}>{initials}</div>
                ))}
              </div>
              <span className="text-sm text-on-surface-variant">Used by 2,400+ job seekers</span>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
