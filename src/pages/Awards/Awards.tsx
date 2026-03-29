import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Medal, Award as AwardIcon } from 'lucide-react';
import { AWARDS } from '../../constants';

export default function Awards() {
  useEffect(() => {
    document.title = "Awards & Recognition | Nafees Mansoor";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'A comprehensive list of awards, honors, and recognitions received by Dr. Nafees Mansoor.');
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Awards & Recognition</h1>
          <p className="text-gray-500 max-w-2xl">A comprehensive list of honors, awards, and professional recognitions.</p>
        </div>

        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {AWARDS.map((award, index) => {
            const getFlagCode = (title: string, venue: string) => {
              const t = title.toLowerCase();
              const v = venue.toLowerCase();
              if (v.includes('bangladesh') || v.includes('ulab') || t.includes('cum laude')) return 'bd';
              if (t.includes('ethics champion') || t.includes('ieee best student')) return 'us';
              if (t.includes('proposal') || t.includes('fellowship') || v.includes('malaysia')) return 'my';
              if (v.includes('japan') || v.includes('mjjis')) return 'jp';
              return null;
            };
            const flagCode = getFlagCode(award.title, award.venue);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-950 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2 z-10">
                  <Trophy className="w-4 h-4 text-indigo-400" />
                </div>

                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 bg-zinc-900/50 border border-white/5 rounded-3xl group hover:bg-zinc-900 hover:border-white/10 transition-all">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors leading-tight">
                          {award.title}
                        </h2>
                        {flagCode && (
                          <img 
                            src={`https://flagcdn.com/w40/${flagCode}.png`} 
                            alt={`${flagCode} flag`}
                            className="w-6 h-auto rounded-sm shadow-sm opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {award.venue.replace(/, Bangladesh|, Malaysia|, Japan/g, '')}
                      </p>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-3 shrink-0">
                      <div className="text-xs font-bold uppercase tracking-widest text-indigo-400/80">
                        {award.date.replace(/, Bangladesh|, Malaysia|, Japan/g, '')}
                      </div>
                      {award.category && (
                        <span className="text-[10px] text-white/40 uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/5">
                          {award.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
