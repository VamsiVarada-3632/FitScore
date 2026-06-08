import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import AuroraBackground from '../components/AuroraBackground';

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <AuroraBackground />
      <div className="relative z-10">
        <Navbar activeLink="Features" />
        <div className="flex items-center justify-center h-96">
          <p className="text-on-surface-variant">Landing page coming soon…</p>
        </div>
      </div>
    </div>
  );
}
