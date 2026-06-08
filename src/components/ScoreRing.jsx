import { useEffect, useState } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import { getScoreLabel, getScoreColor } from '../utils/scoring';

export default function ScoreRing({ score = 0, size = 176, strokeWidth = 7 }) {
  const r = (size / 2) - strokeWidth - 4;
  const circumference = 2 * Math.PI * r;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const [offset, setOffset] = useState(circumference);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const controls = animate(count, score, { duration: 1.8, ease: [0.16, 1, 0.3, 1] });
    const unsub = rounded.on('change', setDisplayScore);
    const timer = setTimeout(() => setOffset((1 - score / 100) * circumference), 50);
    return () => { controls.stop(); unsub(); clearTimeout(timer); };
  }, [score]);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`, filter: 'blur(16px)' }} />
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#242c28" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 8px ${color}80)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold leading-none" style={{ fontSize: size * 0.18, color }}>{displayScore}</span>
          <span className="text-xs text-on-surface-variant mt-1">/ 100</span>
        </div>
      </div>
      <div className="mt-3 px-3 py-1 rounded-full text-xs font-semibold border"
        style={{ borderColor: color + '40', backgroundColor: color + '15', color }}>
        {label}
      </div>
    </div>
  );
}
