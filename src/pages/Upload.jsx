import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import AuroraBackground from '../components/AuroraBackground';
import UploadZone from '../components/UploadZone';
import useStore from '../store/useStore';

export default function Upload() {
  const { uploadedFile, setUploadedFile } = useStore();

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
