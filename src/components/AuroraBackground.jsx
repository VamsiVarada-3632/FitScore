import { motion } from 'framer-motion';

export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 384,
          height: 384,
          background: '#46f1c5',
          filter: 'blur(80px)',
          opacity: 0.06,
          top: '10%',
          left: '15%',
        }}
        animate={{ x: [0, 60, -40, 80, 0], y: [0, -50, 70, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 320,
          height: 320,
          background: '#00d4aa',
          filter: 'blur(80px)',
          opacity: 0.06,
          top: '50%',
          right: '10%',
        }}
        animate={{ x: [0, -70, 50, -60, 0], y: [0, 60, -40, 80, 0] }}
        transition={{ duration: 25, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 256,
          height: 256,
          background: '#ffb955',
          filter: 'blur(80px)',
          opacity: 0.06,
          bottom: '15%',
          left: '40%',
        }}
        animate={{ x: [0, 50, -60, 30, 0], y: [0, -70, 40, -50, 0] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
    </div>
  );
}
