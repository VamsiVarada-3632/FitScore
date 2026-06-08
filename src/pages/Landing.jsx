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

          {/* Right — floating mock card */}
          <motion.div className="hidden lg:flex justify-center" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <motion.div className="relative rounded-2xl p-6 w-80"
              style={{ background: '#0F1826', border: '1px solid rgba(59,74,68,0.5)', rotate: -3 }}
              animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ rotate: 0 }}>
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(70,241,197,0.6),transparent)', animation: 'scan 3s linear infinite' }} />
              </div>
              <p className="text-xs text-on-surface-variant mb-1">Senior Frontend Engineer</p>
              <p className="text-sm font-syne font-bold text-on-surface mb-4">at Acme Corp</p>
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="48" cy="48" r="38" fill="none" stroke="#242c28" strokeWidth="6" />
                    <circle cx="48" cy="48" r="38" fill="none" stroke="#46f1c5" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - 0.78)} style={{ filter: 'drop-shadow(0 0 6px #46f1c580)' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-primary text-xl">78</div>
                </div>
              </div>
              {[{ label: 'Matched', icon: 'check_circle', color: 'text-primary' }, { label: 'Missing 4', icon: 'cancel', color: 'text-error' }, { label: 'AI Ready', icon: 'auto_awesome', color: 'text-secondary' }].map(row => (
                <div key={row.label} className="flex items-center gap-2 text-sm mb-2">
                  <span className={`material-symbols-outlined ${row.color}`} style={{ fontVariationSettings: "'FILL' 1", fontSize: 18 }}>{row.icon}</span>
                  <span className="text-on-surface-variant">{row.label}</span>
                </div>
              ))}
              <button onClick={() => navigate('/upload')} className="mt-2 w-full py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
                Generate Full Report
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature cards */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'bolt', title: 'Instant Match Score', desc: 'Upload your resume and paste any JD. Get a 0–100 compatibility score in seconds.' },
              { icon: 'manage_search', title: 'Skill Gap Analysis', desc: 'See exactly which keywords are missing from your resume vs. the job description.' },
              { icon: 'edit_note', title: 'AI Rewrite Suggestions', desc: 'Receive line-by-line bullet improvements and a full summary rewrite tailored to the role.' },
            ].map((f, i) => (
              <motion.div key={f.title} className="p-6 rounded-2xl border border-outline-variant/40 cursor-default" style={{ background: '#161d1a' }}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ backgroundColor: '#19211e', borderColor: 'rgba(70,241,197,0.2)' }}>
                <motion.div className="w-12 h-12 rounded-xl border border-outline-variant/50 flex items-center justify-center mb-4" whileHover={{ borderColor: 'rgba(70,241,197,0.5)' }}>
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                </motion.div>
                <h3 className="font-syne font-bold text-on-surface mb-2">{f.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
          <motion.h2 className="font-syne font-bold text-2xl text-on-surface text-center mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            How it works
          </motion.h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
            {[{ icon: 'upload_file', label: 'Upload', sub: 'Your PDF resume' }, { icon: 'analytics', label: 'Analyze', sub: 'AI scans for keywords' }, { icon: 'grade', label: 'Score', sub: 'Get your fit report' }].map((step, i) => (
              <div key={step.label} className="flex items-center">
                <motion.div className="flex flex-col items-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                  <div className="w-16 h-16 rounded-2xl border border-primary/30 flex items-center justify-center mb-3" style={{ background: 'rgba(70,241,197,0.06)' }}>
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                  </div>
                  <p className="font-syne font-bold text-on-surface">{step.label}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{step.sub}</p>
                </motion.div>
                {i < 2 && <div className="hidden md:block w-24 h-px mx-4 mt-[-20px]" style={{ background: 'linear-gradient(90deg,#3b4a44,transparent)' }} />}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
