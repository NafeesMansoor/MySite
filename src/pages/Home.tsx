import { lazy, Suspense, useEffect } from 'react';
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
import ProfileWall from '../components/ProfileWall';
import InteractiveBackground from '../components/InteractiveBackground';
import { publicationPath } from '../seo/site';
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

  useEffect(() => {
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
  }, [textX, textY]);

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

      {/* Stats Section */}
      <section className="bg-zinc-950/50 border-y border-white/10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            {STATS.map((stat, index) => {
              const colors = ["text-indigo-400", "text-violet-400", "text-purple-400", "text-sky-400"];
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center space-y-2"
                >
                  <div className={`text-4xl md:text-5xl font-bold tracking-tighter ${colors[index]}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm uppercase tracking-widest text-gray-500 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
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
                    <a
                      href={publicationPath(pub)}
                      aria-label={`Open: ${pub.title}`}
                      className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white" aria-hidden="true" />
                    </a>
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
