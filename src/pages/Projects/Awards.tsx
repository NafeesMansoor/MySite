import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Medal } from 'lucide-react';
import { AWARDS } from '../../constants';

export default function ResearchAwards() {
  useEffect(() => {
    document.title = "Research Awards | Nafees Mansoor";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Research awards and recognitions received by Dr. Nafees Mansoor for his contributions to the field.');
    }
  }, []);

  const researchAwards = AWARDS.filter(award => 
    award.title.toLowerCase().includes('research') || 
    award.title.toLowerCase().includes('publication') ||
    award.title.toLowerCase().includes('paper')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Research Awards</h1>
          <p className="text-gray-500 max-w-2xl">Recognition for outstanding research contributions and academic excellence.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {researchAwards.map((award, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-6 p-8 bg-zinc-900/50 border border-white/5 rounded-3xl group hover:bg-zinc-900 hover:border-white/10 transition-all"
            >
              <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                <Trophy className="w-8 h-8 text-white/60 group-hover:text-white transition-colors" />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-white/40">{award.date}</div>
                <h2 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors leading-tight">
                  {award.title}
                </h2>
                <p className="text-sm text-gray-500 font-medium">{award.venue}</p>
                {award.category && (
                  <div className="flex items-center space-x-2 text-xs text-gray-600 font-mono uppercase tracking-widest pt-2">
                    <Star className="w-3 h-3" />
                    <span>{award.category}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
