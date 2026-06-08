import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function UploadZone({ file, onFileSelect, onRemove, shake = false }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnter = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') onFileSelect(dropped);
  }, [onFileSelect]);
  const handleChange = (e) => { const picked = e.target.files[0]; if (picked) onFileSelect(picked); e.target.value = ''; };
  const formatSize = (bytes) => bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(1) + ' MB';

  return (
    <motion.div animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
      <input ref={inputRef} type="file" accept=".pdf" onChange={handleChange} className="hidden" aria-label="Upload resume PDF" />
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => inputRef.current?.click()}
            onDragEnter={handleDragEnter} onDragOver={(e) => e.preventDefault()} onDragLeave={handleDragLeave} onDrop={handleDrop}
            className="flex flex-col items-center justify-center gap-4 p-10 rounded-2xl cursor-pointer"
            style={{ background: dragOver ? 'rgba(70,241,197,0.05)' : '#0F1826', border: dragOver ? '2px solid #46f1c5' : '2px dashed rgba(26,39,64,1)', boxShadow: dragOver ? '0 0 20px rgba(70,241,197,0.15)' : 'none', animation: dragOver ? 'none' : 'breathe 4s ease-in-out infinite' }}>
            <motion.span className="material-symbols-outlined text-5xl text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0" }} animate={dragOver ? { scale: 1.1 } : { scale: 1 }}>description</motion.span>
            <div className="text-center">
              <p className="font-semibold text-on-surface">{dragOver ? 'Drop your resume here' : 'Drag & drop your resume'}</p>
              <p className="text-sm text-on-surface-variant mt-1">or <span className="text-primary underline">click to browse</span> · PDF only</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="selected" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            className="flex items-center gap-4 p-5 rounded-2xl" style={{ background: '#0F1826', border: '2px solid #46f1c5' }}>
            <span className="material-symbols-outlined text-4xl text-primary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>task</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-on-surface truncate">{file.name}</p>
              <p className="text-sm text-on-surface-variant mt-0.5">{formatSize(file.size)}</p>
            </div>
            <CheckCircle2 className="text-primary flex-shrink-0" size={22} />
            <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-on-surface-variant hover:text-error text-sm underline flex-shrink-0" aria-label="Remove file">Remove</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
