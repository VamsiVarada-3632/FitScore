export default function SkeletonLoader({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg overflow-hidden"
          style={{
            height: 16,
            width: `${85 - i * 10}%`,
            background: 'linear-gradient(90deg, #19211e 0%, #242c28 50%, #19211e 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
