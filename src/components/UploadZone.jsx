import { useRef } from 'react';

export default function UploadZone({ file, onFileSelect, onRemove }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const picked = e.target.files[0];
    if (picked) onFileSelect(picked);
    e.target.value = '';
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept=".pdf" onChange={handleChange} className="hidden" aria-label="Upload resume PDF" />
      <div
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-4 p-10 rounded-2xl cursor-pointer"
        style={{ background: '#0F1826', border: '2px dashed rgba(26,39,64,1)' }}
      >
        <span className="material-symbols-outlined text-5xl text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0" }}>description</span>
        <div className="text-center">
          <p className="font-semibold text-on-surface">Drag & drop your resume</p>
          <p className="text-sm text-on-surface-variant mt-1">or <span className="text-primary underline">click to browse</span> · PDF only</p>
        </div>
      </div>
    </div>
  );
}
