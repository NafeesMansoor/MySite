import { motion } from 'motion/react';
import { ExternalLink, ScrollText } from 'lucide-react';
import { NEWSPAPER_MENTIONS } from '../../constants';
import { usePageMeta } from '../../seo/usePageMeta';

export default function Mentions() {
  usePageMeta('/about/mentions');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Newspaper Mentions</h1>
          <p className="text-gray-500 max-w-2xl">Recognition and features in national and international media.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {NEWSPAPER_MENTIONS.map((mention, index) => (
            <motion.div
              key={mention.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:bg-zinc-900 hover:border-white/10 transition-all"
            >
              <div className="aspect-video overflow-hidden relative">
                <img 
                  src={mention.image} 
                  alt={mention.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-widest text-white/60">
                      {mention.source || (mention.links && mention.links.map(l => l.name).join(', '))}
                    </div>
                    <div className="text-sm text-white/40 font-mono">{mention.date}</div>
                  </div>
                  <div className="flex gap-2">
                    {mention.link && (
                      <a 
                        href={mention.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 rounded-full hover:bg-white text-white hover:text-black transition-all"
                        title="View Source"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {mention.links && mention.links.map((link, i) => (
                      <a 
                        key={i}
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 rounded-full hover:bg-white text-white hover:text-black transition-all flex items-center space-x-2 px-3"
                        title={`View on ${link.name}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{link.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center space-x-3 text-white/40">
                  <ScrollText className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Media Feature</span>
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight group-hover:text-white/90 transition-colors">
                  {mention.title}
                </h2>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
