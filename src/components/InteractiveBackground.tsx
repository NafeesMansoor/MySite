// Decorative home-page background. Animated with CSS only (see .bg-aura and .bg-particle in
// index.css), so it runs on the compositor and costs no main-thread work after the first render.

// Fixed pseudo-random layout so the particles do not move between renders.
const PARTICLES = Array.from({ length: 30 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 9301 + n * 49297) + 1) / 2) % 1;
  return {
    left: `${r(1) * 100}%`,
    top: `${20 + r(2) * 80}%`,
    duration: `${15 + r(3) * 15}s`,
    delay: `-${r(4) * 30}s`,
  };
});

export default function InteractiveBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#020205]">
      {/* Aura gradients */}
      <div
        className="bg-aura absolute -top-[300px] -left-[200px] w-[1000px] h-[1000px] rounded-full bg-indigo-500/15 blur-[160px] opacity-70"
        style={{ animationDuration: '18s' }}
      />
      <div
        className="bg-aura absolute top-[100px] right-[-300px] w-[800px] h-[800px] rounded-full bg-violet-600/15 blur-[140px] opacity-50"
        style={{ animationDuration: '24s', animationDelay: '-8s' }}
      />
      <div
        className="bg-aura absolute top-[600px] left-[10%] w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[120px] opacity-40"
        style={{ animationDuration: '30s', animationDelay: '-15s' }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99,102,241,0.15) 1px, transparent 0)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="bg-particle absolute w-1 h-1 bg-indigo-300/30 rounded-full"
          style={{ left: p.left, top: p.top, animationDuration: p.duration, animationDelay: p.delay }}
        />
      ))}

      {/* Mesh lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
            <stop offset="50%" stopColor="rgba(167, 139, 250, 0.3)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
          </linearGradient>
        </defs>
        <path d="M-200,300 Q400,150 800,500 T1400,300" stroke="url(#line-grad)" strokeWidth="0.5" fill="none" />
        <path d="M1400,900 Q900,1000 500,700 T-200,900" stroke="url(#line-grad)" strokeWidth="0.5" fill="none" />
      </svg>
    </div>
  );
}
