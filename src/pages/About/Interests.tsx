import { motion } from 'motion/react';
import { Cpu, ShieldCheck, Code, Layers, Database, Globe, Terminal, Fingerprint, FlaskConical } from 'lucide-react';
import { RESEARCH_INTERESTS } from '../../constants';
import WordCloud from '../../components/WordCloud';
import { usePageMeta } from '../../seo/usePageMeta';

const INTEREST_ICONS: Record<string, any> = {
  'Wireless Communications': Cpu,
  'Blockchain': ShieldCheck,
  'Generative AI': Code,
  'IoT Systems': Layers,
  'Data Science': Database,
  'Network Security': Fingerprint,
  'Cloud Computing': Globe,
  'Machine Learning': Terminal,
  'Pervasive Networks': FlaskConical,
};

export default function Interests() {
  usePageMeta('/about/interests');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Research Interests</h1>
          <p className="text-gray-500 max-w-2xl">A deep dive into the areas of expertise and ongoing research efforts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RESEARCH_INTERESTS.map((interest, index) => {
            const Icon = INTEREST_ICONS[interest] || Cpu;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl space-y-6 hover:bg-zinc-900 hover:border-white/10 transition-all group"
              >
                <div className="p-3 bg-white/5 rounded-2xl w-fit group-hover:bg-white/10 transition-colors">
                  <Icon className="w-8 h-8 text-white/60 group-hover:text-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">{interest}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">Exploring advanced concepts and practical applications in {interest.toLowerCase()} to solve real-world problems.</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <WordCloud />
      </motion.div>
    </div>
  );
}
