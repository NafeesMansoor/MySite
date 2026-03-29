import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { 
  Trophy, 
  Star, 
  Medal, 
  Lightbulb, 
  Users, 
  ScrollText, 
  Mail, 
  Linkedin, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Briefcase, 
  ChevronRight, 
  ExternalLink,
  Search,
  Database,
  Globe,
  Cpu,
  ShieldCheck,
  Code,
  Layers,
  Terminal,
  Fingerprint,
  FlaskConical
} from 'lucide-react';
import { PUBLICATIONS } from '../constants';

const STATS = [
  { label: 'Years Experience', value: '15+' },
  { label: 'Publications', value: '100+' },
  { label: 'Citations', value: '1400+' },
  { label: 'h index', value: '21' },
];

const InteractiveBackground = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#050505]">
      {/* Animated Gradients */}
      <motion.div
        animate={{
          x: mouse.x - 400,
          y: mouse.y - 400,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 50 }}
        className="absolute w-[800px] h-[800px] rounded-full bg-indigo-500/10 blur-[120px] opacity-60 mix-blend-screen"
      />
      <motion.div
        animate={{
          x: mouse.x - 300,
          y: mouse.y - 300,
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 40 }}
        className="absolute w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[100px] opacity-40 mix-blend-screen"
      />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
              opacity: [null, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
          />
        ))}
      </div>

      {/* Mesh Lines (SVG for better control) */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.2)" />
            <stop offset="100%" stopColor="rgba(167, 139, 250, 0.2)" />
          </linearGradient>
        </defs>
        <motion.path
          animate={{
            d: [
              "M-100,200 Q200,100 500,400 T1200,200",
              "M-100,300 Q300,200 600,500 T1200,300",
              "M-100,200 Q200,100 500,400 T1200,200"
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          stroke="url(#line-grad)"
          strokeWidth="1"
          fill="none"
        />
        <motion.path
          animate={{
            d: [
              "M1200,800 Q800,900 400,600 T-100,800",
              "M1200,700 Q700,800 300,500 T-100,700",
              "M1200,800 Q800,900 400,600 T-100,800"
            ]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          stroke="url(#line-grad)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default function Home() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const textX = useSpring(useMotionValue(0), { stiffness: 100, damping: 30 });
  const textY = useSpring(useMotionValue(0), { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      mouseX.set(clientX);
      mouseY.set(clientY);
      
      // Parallax effect for text
      const x = (clientX - innerWidth / 2) / 50;
      const y = (clientY - innerHeight / 2) / 50;
      textX.set(x);
      textY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, textX, textY]);

  useEffect(() => {
    document.title = "Nafees Mansoor | Professor & Researcher";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Official website of Dr. Nafees Mansoor, Professor and Researcher specializing in Wireless Communications, Distributed Systems, and Security.');
    }
  }, []);

  const recentPublications = [...PUBLICATIONS]
    .sort((a, b) => b.year - a.year)
    .slice(0, 5);

  return (
    <div className="relative">
      <InteractiveBackground />
      
      {/* Hero Section */}
      <section className="min-h-[80vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20">
        <motion.div
          style={{ x: textX, y: textY }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40"
            >
              Nafees Mansoor
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-medium tracking-tight flex flex-wrap gap-x-3"
            >
              {"Academic - Researcher - Learner - Father".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ 
                    delay: 0.4 + (i * 0.08),
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className={i % 2 === 0 ? "text-indigo-400" : "text-gray-400"}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
          </div>

          <div className="flex flex-wrap gap-4">
            <motion.a 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              href="https://orcid.org/0000-0002-3408-237X" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 group flex items-center space-x-3"
            >
              <img src="https://orcid.org/sites/default/files/images/orcid_16x16.png" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="ORCID" />
              <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">ORCID</span>
            </motion.a>
            <motion.a 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              href="https://www.researchgate.net/profile/Nafees_Mansoor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 group flex items-center space-x-3"
            >
              <img src="https://www.researchgate.net/favicon.ico" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="ResearchGate" />
              <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">ResearchGate</span>
            </motion.a>
            <motion.a 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              href="https://scholar.google.com/citations?user=5dt40PYAAAAJ&hl=en&oi=ao" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 group flex items-center space-x-3"
            >
              <Search className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Google Scholar</span>
            </motion.a>
            <motion.a 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              href="https://www.linkedin.com/in/nafeesmansoor/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 group flex items-center space-x-3"
            >
              <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">LinkedIn</span>
            </motion.a>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-3xl text-lg text-gray-400 leading-relaxed font-light"
          >
            Dr. Nafees Mansoor is a distinguished Professor and Researcher with over 15 years of experience in academia and industry. His research focuses on the intersection of wireless communication protocols, decentralized systems, and artificial intelligence, aiming to build more resilient and efficient digital infrastructures.
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-zinc-950/50 border-y border-white/10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            {STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center space-y-2"
              >
                <div className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                  {stat.value}
                </div>
                <div className="text-sm uppercase tracking-widest text-gray-500 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Publications Preview */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-12">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter text-white">Recent Publications</h2>
              <p className="text-gray-500">A selection of the most recent research contributions.</p>
            </div>
            <motion.a 
              href="/publications/journals"
              whileHover={{ x: 5 }}
              className="flex items-center space-x-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </motion.a>
          </div>

          <div className="grid gap-6">
            {recentPublications.map((pub, index) => (
              <motion.div
                key={pub.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-zinc-900 hover:border-white/10 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white rounded">
                        {pub.type}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">{pub.year}</span>
                    </div>
                    <h3 className="text-lg font-medium text-white group-hover:text-white/90 transition-colors">
                      {pub.title}
                    </h3>
                    <p className="text-sm text-gray-500 italic">{pub.authors}</p>
                  </div>
                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right hidden md:block">
                      <div className="text-xs text-gray-500 uppercase tracking-widest">Venue</div>
                      <div className="text-sm text-gray-400 max-w-[200px] truncate">{pub.venue}</div>
                    </div>
                    <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
