import { lazy, Suspense, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
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
  ArrowRight,
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
import ProfileWall from '../components/ProfileWall';
import InteractiveBackground from '../components/InteractiveBackground';
import { publicationPath, typeLabel } from '../seo/site';
import { usePageMeta } from '../seo/usePageMeta';

const AnalyticsDashboard = lazy(() => import('../components/AnalyticsDashboard'));

const STATS = [
  { label: 'Publications', value: '100+' },
  { label: 'Citations', value: '1550+' },
  { label: 'h index', value: '21' },
  { label: 'Best Paper Awards', value: '7' },
];

export default function Home() {
  const textX = useSpring(useMotionValue(0), { stiffness: 100, damping: 30 });
  const textY = useSpring(useMotionValue(0), { stiffness: 100, damping: 30 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Parallax effect for text
      const x = (clientX - innerWidth / 2) / 50;
      const y = (clientY - innerHeight / 2) / 50;
      textX.set(x);
      textY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [textX, textY, reducedMotion]);

  usePageMeta('/');

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
              {["Academic", "-", "Researcher", "-", "Learner", "-", "Father"].map((word, i) => {
                const colors = ["text-indigo-400", "text-gray-600", "text-violet-400", "text-gray-600", "text-purple-400", "text-gray-600", "text-sky-400"];
                return (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ 
                      delay: 0.4 + (i * 0.08),
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className={colors[i]}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ProfileWall />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-3xl text-lg text-gray-400 leading-relaxed font-light"
          >
            Dr. Nafees Mansoor is Professor and Head of the Department of Computer Science & Engineering at the University of Liberal Arts Bangladesh (ULAB), Dhaka, and Director of its Office of Faculty Research, with over 15 years of experience in academia and industry. His research spans wireless communication protocols and cognitive radio networks, blockchain and decentralized systems, generative AI and machine learning, and the Internet of Things, aiming to build more resilient and efficient digital infrastructures.
          </motion.div>
        </motion.div>
      </section>

      {/* Analytics Dashboard Section */}
      <Suspense fallback={<div className="h-[400px]" />}>
        <AnalyticsDashboard />
      </Suspense>

      {/* Stats Section (layout adapted from the 21st.dev "Stats" component by meschacirung) */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ul
          aria-label="Research in numbers"
          className="grid grid-cols-2 md:grid-cols-4 bg-zinc-950/60 border border-white/10 rounded-3xl divide-white/10 max-md:[&>li:nth-child(n+3)]:border-t md:divide-x [&>li:nth-child(even)]:max-md:border-l"
        >
          {STATS.map((stat, index) => {
            const colors = ["text-indigo-400", "text-violet-400", "text-purple-400", "text-sky-400"];
            return (
              <motion.li
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center justify-center gap-2 px-3 py-8 md:py-10 text-center border-white/10"
              >
                <div className={`text-[clamp(2rem,6vw,3rem)] leading-none font-bold tracking-tighter tabular-nums ${colors[index]}`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm uppercase tracking-widest text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.li>
            );
          })}
        </ul>
      </section>

      {/* Recent Publications Preview */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-12">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter text-white">Recent Publications</h2>
              <p className="text-gray-500">A selection of the most recent research contributions.</p>
            </div>
            <Link
              to="/publications"
              className="group/all shrink-0 inline-flex items-center gap-2 min-h-11 px-4 rounded-full text-sm font-medium text-white hover:bg-white/5 transition-colors"
            >
              <span>View all publications</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover/all:translate-x-1" aria-hidden="true" />
            </Link>
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
                        {typeLabel(pub.type)}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">{pub.year}</span>
                    </div>
                    <h3 className="text-lg font-medium text-white leading-snug">
                      <Link to={publicationPath(pub)} className="hover:text-indigo-300 focus-visible:text-indigo-300 focus-visible:outline-none transition-colors">
                        {pub.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500 italic">{pub.authors}</p>
                  </div>
                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right hidden md:block">
                      <div className="text-xs text-gray-500 uppercase tracking-widest">Venue</div>
                      <div className="text-sm text-gray-400 max-w-[200px] truncate">{pub.venue}</div>
                    </div>
                    <Link
                      to={publicationPath(pub)}
                      aria-label={`Details: ${pub.title}`}
                      className="w-11 h-11 inline-flex items-center justify-center bg-white/5 rounded-full hover:bg-indigo-500/20 focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:outline-none transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" aria-hidden="true" />
                    </Link>
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
