import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Menu,
  X,
  FileText,
  MapPin,
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
import { 
  PUBLICATIONS, 
  EDUCATIONS, 
  EXPERIENCES, 
  AWARDS, 
  RESEARCH_INTERESTS, 
  GRANTS, 
  PROFESSIONAL_SERVICES,
  TECHNICAL_KNOWLEDGE
} from './constants';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pubFilter, setPubFilter] = useState<'all' | 'journal' | 'conference' | 'book-chapter' | 'patent' | 'edited-book'>('all');

  useEffect(() => {
    // Dynamic canonical tag
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = window.location.origin + window.location.pathname;
    
    // Remove existing canonical if any
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      document.head.removeChild(existingCanonical);
    }
    
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'research', label: 'Research' },
    { id: 'experience', label: 'Experience' },
    { id: 'publications', label: 'Publications' },
    { id: 'grants', label: 'Grants' },
    { id: 'awards', label: 'Awards' },
  ];

  const filteredPublications = PUBLICATIONS.filter(p => 
    pubFilter === 'all' || p.type === pubFilter
  );

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 120;

      sections.forEach(section => {
        if (section && scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card bg-brand-bg/80">
        <div className="container-max px-6 h-20 flex items-center justify-between">
          <div 
            className="text-2xl font-serif font-bold cursor-pointer tracking-tight"
            onClick={() => scrollTo('home')}
          >
            Nafees Mansoor<span className="text-brand-accent">.</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex space-x-8">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-20 left-0 right-0 bg-brand-bg border-b border-brand-primary/10 p-6 flex flex-col space-y-4 shadow-xl"
            >
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`text-left text-lg font-serif ${activeSection === item.id ? 'text-brand-accent font-bold' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section id="home" className="section-padding min-h-[85vh] flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(129,140,248,0.08),transparent_70%)]" />
          
          <div className="hidden lg:block absolute left-12 top-1/2 -translate-y-1/2 rail-text">
            Professor & Researcher • ULAB • Dhaka
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container-max relative z-10"
          >
            <div className="flex flex-col md:flex-row md:items-end gap-8 mb-12">
              <h1 className="text-5xl md:text-8xl font-serif font-light leading-[0.85] tracking-tighter">
                Nafees <br />
                <span className="italic text-brand-accent">Mansoor</span>
              </h1>
              <div className="flex flex-col gap-3 pb-2">
                <div className="px-4 py-1 rounded-full border border-brand-accent/30 text-brand-accent text-[10px] font-bold uppercase tracking-widest w-fit">
                  Professor & Researcher
                </div>
                <div className="px-4 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit">
                  <BookOpen size={12} /> 1,415 Citations
                </div>
              </div>
            </div>

            <p className="text-lg md:text-xl font-light text-brand-primary/60 mb-10 max-w-2xl leading-snug">
              Specializing in Wireless Communications, Blockchain, and Generative AI. Shaping the future of ubiquitous computing systems through advanced research and academic leadership.
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <button 
                onClick={() => scrollTo('publications')}
                className="bg-brand-accent text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-brand-accent/80 transition-all flex items-center gap-2 brand-bg-glow"
              >
                View Research <ChevronRight size={16} />
              </button>
              <div className="flex items-center space-x-4">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-white/10 hover:border-brand-accent hover:text-brand-accent transition-all" title="LinkedIn">
                  <Linkedin size={18} />
                </a>
                <a href="https://orcid.org/0000-0002-3408-237X" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-white/10 hover:border-brand-accent hover:text-brand-accent transition-all" title="ORCID">
                  <Fingerprint size={18} />
                </a>
                <a href="https://www.researchgate.net/profile/Nafees_Mansoor" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-white/10 hover:border-brand-accent hover:text-brand-accent transition-all" title="ResearchGate">
                  <FlaskConical size={18} />
                </a>
                <a href="https://scholar.google.com/citations?user=5dt40PYAAAAJ&hl=en&oi=ao" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-white/10 hover:border-brand-accent hover:text-brand-accent transition-all" title="Google Scholar">
                  <GraduationCap size={18} />
                </a>
                <a href="https://publons.com/researcher/1269311/nafees-mansoor-phd/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-white/10 hover:border-brand-accent hover:text-brand-accent transition-all" title="Publons / Web of Science">
                  <Award size={18} />
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="section-padding border-y border-white/5">
          <div className="container-max max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-serif italic">A Trailblazer in Academia and Technology</h2>
                <div className="w-12 h-px bg-brand-accent mx-auto opacity-50" />
              </div>
              
              <div className="space-y-4 text-sm md:text-base leading-snug text-brand-primary/70 text-center max-w-2xl mx-auto">
                <p>
                  Dr. Nafees Mansoor is a Professor of Computer Science & Engineering at ULAB, where he also coordinates the Faculty Research Office. Holding a Ph.D. from Universiti Teknologi Malaysia (UTM), his expertise encompasses cognitive radio networks, wireless communication, and pervasive systems.
                </p>
                <p>
                  As a prolific researcher and Associate Editor for IEEE Access, Dr. Mansoor has built a formidable portfolio of publications and funded projects. He actively shapes the academic field as a TPC and track chair for numerous international conferences.
                </p>
                <p className="italic font-medium text-brand-accent">
                  His dedication to pushing technological boundaries establishes him as a true vanguard in academia and engineering, consistently inspiring the next generation of researchers.
                </p>
              </div>

              <div className="flex flex-col items-center pt-8">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-brand-accent/30 brand-bg-glow mb-3">
                  <img 
                    src="https://ulab.edu.bd/sites/default/files/styles/faculty_avatar/public/images/faculty/Dr_Nafees_Mansoor.png?itok=004jfjQx" 
                    alt="Dr. Nafees Mansoor Signature" 
                    className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center">
                  <p className="font-serif italic text-lg">Dr. Nafees Mansoor</p>
                  <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Professor & Researcher</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 pt-12 border-t border-white/5">
                <div className="text-center">
                  <h4 className="text-2xl md:text-3xl font-serif text-brand-accent">15+</h4>
                  <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Years Experience</p>
                </div>
                <div className="text-center">
                  <h4 className="text-2xl md:text-3xl font-serif text-brand-accent">100+</h4>
                  <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Publications</p>
                </div>
                <div className="text-center">
                  <h4 className="text-2xl md:text-3xl font-serif text-brand-accent">1400+</h4>
                  <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">citations</p>
                </div>
                <div className="text-center">
                  <h4 className="text-2xl md:text-3xl font-serif text-brand-accent">21</h4>
                  <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">h index</p>
                </div>
              </div>

              <div className="pt-12">
                <h3 className="text-xl font-serif mb-8 italic text-center opacity-80">Professional Service</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {PROFESSIONAL_SERVICES.map((service, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl glass-card hover:border-brand-accent/50 hover:brand-bg-glow transition-all group">
                      <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-4 group-hover:bg-brand-accent group-hover:text-white transition-all">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="font-serif italic text-base leading-tight mb-2">{service.role}</p>
                        <p className="text-[9px] opacity-40 uppercase tracking-widest font-bold mb-1">{service.organization}</p>
                        <p className="text-[9px] opacity-30 uppercase tracking-widest">{service.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Research Interests */}
        <section id="research" className="section-padding border-b border-white/5">
          <div className="container-max">
            <h2 className="text-2xl md:text-3xl font-serif italic mb-12 text-center">Research Focus</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {RESEARCH_INTERESTS.map((interest, index) => (
                <motion.div
                  key={interest}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-5 rounded-2xl hover:bg-brand-accent hover:text-white hover:brand-bg-glow transition-all group border-none"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-accent/10 group-hover:bg-brand-bg/20 flex items-center justify-center mb-4">
                    <span className="text-xl font-serif italic text-brand-accent group-hover:text-white">
                      {interest.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif leading-tight">{interest}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience & Education */}
        <section id="experience" className="section-padding bg-white/[0.02]">
          <div className="container-max grid lg:grid-cols-2 gap-16">
            {/* Experience */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <Briefcase className="text-brand-accent" size={24} />
                <h2 className="text-2xl font-serif italic">Work History</h2>
              </div>
              <div className="space-y-10 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-white/10">
                {EXPERIENCES.map((exp, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="pl-8 relative group"
                  >
                    <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-brand-accent group-hover:brand-bg-glow transition-all" />
                    <span className="text-[10px] font-mono text-brand-accent mb-1 block uppercase tracking-widest">{exp.period}</span>
                    <h3 className="text-xl font-serif mb-1 text-white group-hover:text-brand-accent transition-colors">{exp.role}</h3>
                    <p className="text-sm text-white/60 font-medium mb-2">{exp.institution}</p>
                    <p className="text-[10px] opacity-30 flex items-center gap-1 text-white/50 uppercase tracking-widest font-bold">
                      <MapPin size={12} /> {exp.location}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <GraduationCap className="text-brand-accent" size={24} />
                <h2 className="text-2xl font-serif italic">Education</h2>
              </div>
              <div className="space-y-10 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-white/10">
                {EDUCATIONS.map((edu, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="pl-8 relative group"
                  >
                    <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-brand-accent group-hover:brand-bg-glow transition-all" />
                    <span className="text-[10px] font-mono text-brand-accent mb-1 block uppercase tracking-widest">{edu.year}</span>
                    <h3 className="text-xl font-serif mb-1 text-white group-hover:text-brand-accent transition-colors">{edu.degree}</h3>
                    <p className="text-sm text-white/60 font-medium mb-2">{edu.institution}</p>
                    {edu.thesis && (
                      <p className="text-xs italic opacity-30 leading-snug border-l-2 border-brand-accent/30 pl-4 text-white/60">
                        Dissertation: {edu.thesis}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technical Knowledge */}
        <section className="section-padding border-b border-white/5">
          <div className="container-max">
            <h2 className="text-2xl md:text-3xl font-serif italic mb-12 text-center">Technical Knowledge</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <Terminal className="text-brand-accent" size={18} />, title: "Languages & Scripting", content: TECHNICAL_KNOWLEDGE.programming },
                { icon: <Database className="text-brand-accent" size={18} />, title: "DBMS & Optimization", content: TECHNICAL_KNOWLEDGE.dbms },
                { icon: <Globe className="text-brand-accent" size={18} />, title: "Web & CMS", content: TECHNICAL_KNOWLEDGE.webTechs },
                { icon: <Layers className="text-brand-accent" size={18} />, title: "Operating Systems", content: TECHNICAL_KNOWLEDGE.os },
                { icon: <Globe className="text-brand-accent" size={18} />, title: "Networking", content: TECHNICAL_KNOWLEDGE.networking },
                { icon: <Cpu className="text-brand-accent" size={18} />, title: "Cloud & DevOps", content: TECHNICAL_KNOWLEDGE.cloud },
              ].map((tech, idx) => (
                <div key={idx} className="glass-card p-6 rounded-2xl hover:border-brand-accent/50 hover:brand-bg-glow transition-all group">
                  <div className="flex items-center gap-3 mb-4">
                    {tech.icon}
                    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-60">{tech.title}</h3>
                  </div>
                  <p className="text-brand-primary/60 leading-snug text-xs">{tech.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Publications */}
        <section id="publications" className="section-padding">
          <div className="container-max">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif italic mb-3">Publications & Patents</h2>
                <p className="text-brand-primary/50 max-w-xl text-sm leading-snug">
                  A selection of research contributions including patents, edited books, and peer-reviewed journals.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(['all', 'journal', 'conference', 'book-chapter', 'patent', 'edited-book'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setPubFilter(filter)}
                    className={`px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                      pubFilter === filter 
                        ? 'bg-brand-accent text-white brand-bg-glow' 
                        : 'border border-white/10 hover:bg-white/5 text-white/40'
                    }`}
                  >
                    {filter.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredPublications.map((pub) => (
                  <motion.div
                    key={pub.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="publication-card flex flex-col md:flex-row gap-6 items-start group border-white/5 py-6"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase tracking-widest font-bold ${
                          pub.type === 'journal' ? 'bg-blue-500/10 text-blue-400' : 
                          pub.type === 'conference' ? 'bg-green-500/10 text-green-400' : 
                          pub.type === 'patent' ? 'bg-red-500/10 text-red-400' :
                          pub.type === 'edited-book' ? 'bg-orange-500/10 text-orange-400' :
                          'bg-purple-500/10 text-purple-400'
                        }`}>
                          {pub.type.replace('-', ' ')}
                        </span>
                        <span className="text-xs font-mono opacity-30">{pub.year}</span>
                        {(pub.year === 2025 || pub.year === 2026) && (
                          <span className="px-1.5 py-0.5 rounded bg-brand-accent text-white text-[7px] font-bold uppercase tracking-widest animate-pulse">
                            New
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg md:text-xl font-serif mb-2 group-hover:text-brand-accent transition-colors leading-tight">
                        {pub.title}
                      </h3>
                      <p className="text-xs text-brand-primary/50 mb-1 leading-snug">{pub.authors}</p>
                      <p className="text-xs italic font-serif text-brand-accent/70">{pub.venue}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-4 text-[9px] uppercase tracking-widest font-bold opacity-30">
                        {pub.indexed && <span>• {pub.indexed}</span>}
                        {pub.impactFactor && <span>• Impact Factor: {pub.impactFactor}</span>}
                      </div>
                    </div>
                    <a 
                      href={pub.link || "#"} 
                      className="p-3 rounded-full border border-white/10 hover:bg-brand-accent hover:text-white transition-all self-center md:self-start group-hover:brand-bg-glow"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Grants Section */}
        <section id="grants" className="section-padding bg-white/[0.02]">
          <div className="container-max">
            <h2 className="text-2xl md:text-3xl font-serif italic mb-12 text-center">Research Grants</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {GRANTS.map((grant, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl border border-white/5 glass-card hover:border-brand-accent hover:brand-bg-glow transition-all group"
                >
                  <span className="text-brand-accent text-[10px] font-bold uppercase tracking-widest mb-3 block">{grant.period}</span>
                  <h3 className="text-xl font-serif mb-3 leading-tight text-white group-hover:text-brand-accent transition-colors">{grant.title}</h3>
                  <p className="text-xs opacity-40 mb-5 text-white/60 leading-snug">{grant.body}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[9px] uppercase tracking-widest opacity-30 text-white/50 font-bold">{grant.role}</span>
                    <span className="font-mono text-brand-accent text-xs">{grant.amount}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Awards */}
        <section id="awards" className="section-padding">
          <div className="container-max">
            <div className="flex flex-col items-center gap-3 mb-12 text-center">
              <Award className="text-brand-accent" size={32} strokeWidth={1} />
              <h2 className="text-2xl md:text-3xl font-serif italic">Honours & Awards</h2>
              <p className="text-xs opacity-30 max-w-xl leading-snug">A collection of academic recognitions, paper awards, and professional honors received throughout my career.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {AWARDS.map((award, index) => {
                const getIcon = (cat?: string) => {
                  switch (cat) {
                    case 'IEEE AWARD': return <Trophy size={18} />;
                    case 'Excellence Award': return <Star size={18} />;
                    case 'BEST PAPER': return <ScrollText size={18} />;
                    case 'ETHICS CHAMPION': return <ShieldCheck size={18} />;
                    case 'EDUCATOR OF THE TERM': return <GraduationCap size={18} />;
                    case 'BEST PROPOSAL': return <Lightbulb size={18} />;
                    case 'FELLOWSHIP': return <Users size={18} />;
                    case 'CUM LAUDE': return <Medal size={18} />;
                    default: return <Award size={18} />;
                  }
                };

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-5 rounded-2xl hover:border-brand-accent/50 hover:brand-bg-glow transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-9 h-9 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors">
                        {getIcon(award.category)}
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-widest opacity-30 bg-white/5 px-2 py-1 rounded">{award.category}</span>
                    </div>
                    <h3 className="text-base font-serif mb-2 leading-tight group-hover:text-brand-accent transition-colors">{award.title}</h3>
                    <div className="space-y-1">
                      <p className="text-[10px] opacity-30 uppercase tracking-widest font-bold">{award.date}</p>
                      <p className="text-[10px] italic font-serif leading-snug text-brand-accent/60">{award.venue}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-white/[0.01] text-white">
        <div className="container-max">
          <div className="mb-12">
            <div>
              <h2 className="text-3xl font-serif italic mb-3">Nafees Mansoor<span className="text-brand-accent">.</span></h2>
              <p className="text-base opacity-40 max-w-md leading-snug">
                Professor & Researcher specializing in Wireless Communications, Blockchain, and Generative AI.
              </p>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] opacity-30 uppercase tracking-[0.2em] font-bold">
              &copy; {new Date().getFullYear()} Nafees Mansoor, Ph.D.
            </p>
            <div className="flex space-x-8 opacity-40 text-[10px] uppercase tracking-widest font-bold">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent transition-colors">LinkedIn</a>
              <a href="https://orcid.org/0000-0002-3408-237X" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent transition-colors">ORCID</a>
              <a href="https://www.researchgate.net/profile/Nafees_Mansoor" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent transition-colors">ResearchGate</a>
              <a href="https://scholar.google.com/citations?user=5dt40PYAAAAJ&hl=en&oi=ao" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent transition-colors">Google Scholar</a>
              <a href="https://publons.com/researcher/1269311/nafees-mansoor-phd/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent transition-colors">Publons</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
