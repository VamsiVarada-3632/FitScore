export default function ScoreRing({ score = 0, size = 176, strokeWidth = 7 }) {
  const r = (size / 2) - strokeWidth - 4;
  const circumference = 2 * Math.PI * r;
  const offset = (1 - score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <div style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#242c28" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#46f1c5"
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-primary" style={{ fontSize: size * 0.18 }}>{score}</span>
          <span className="text-xs text-on-surface-variant mt-1">/ 100</span>
        </div>
      </div>
    </div>
  );
}
