import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import AuroraBackground from '../components/AuroraBackground';
import UploadZone from '../components/UploadZone';
import useStore from '../store/useStore';

export default function Upload() {
  const { uploadedFile, jdText, setUploadedFile, setJdText } = useStore();
  const [charCount, setCharCount] = useState(jdText.length);

  const handleJdChange = useCallback((e) => {
    setJdText(e.target.value);
    setCharCount(e.target.value.length);
  }, [setJdText]);

  return (
    <div className="relative min-h-screen bg-background">
      <AuroraBackground />
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div className="lg:col-span-7 flex flex-col gap-8" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">1</div>
                  <h2 className="font-syne font-bold text-lg text-on-surface">Upload Resume</h2>
                </div>
                <UploadZone file={uploadedFile} onFileSelect={setUploadedFile} onRemove={() => setUploadedFile(null)} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">2</div>
                  <h2 className="font-syne font-bold text-lg text-on-surface">Paste Job Description</h2>
                </div>
                <div className="relative">
                  <textarea value={jdText} onChange={handleJdChange} placeholder="Paste the full job description here…"
                    className="w-full p-4 rounded-2xl text-sm text-on-surface placeholder-on-surface-variant/50 resize-none outline-none"
                    style={{ minHeight: 220, background: '#0F1826', border: '1.5px solid #1A2740' }}
                    onFocus={e => { e.target.style.borderColor = '#46f1c5'; e.target.style.boxShadow = '0 0 0 2px rgba(70,241,197,0.18)'; }}
                    onBlur={e => { e.target.style.borderColor = '#1A2740'; e.target.style.boxShadow = 'none'; }} />
                  <span className="absolute bottom-3 right-3 text-xs text-on-surface-variant/50 font-mono">{charCount} chars</span>
                </div>
              </div>
            </motion.div>
            <motion.div className="lg:col-span-5" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              <p className="text-on-surface-variant">Hints panel loading…</p>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
