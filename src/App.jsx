import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import Upload from './pages/Upload';
import Loading from './pages/Loading';
import Results from './pages/Results';
import History from './pages/History';
import useStore from './store/useStore';

function RequireUpload({ children }) {
  const { uploadedFile, jdText } = useStore();
  if (!uploadedFile && !jdText) return <Navigate to="/upload" replace />;
  return children;
}

function RequireAnalysis({ children }) {
  const { currentAnalysis } = useStore();
  if (!currentAnalysis) return <Navigate to="/upload" replace />;
  return children;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/loading" element={<RequireUpload><Loading /></RequireUpload>} />
        <Route path="/results" element={<RequireAnalysis><Results /></RequireAnalysis>} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
