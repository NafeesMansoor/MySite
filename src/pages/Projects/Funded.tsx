import { motion } from 'motion/react';
import { Database, ExternalLink } from 'lucide-react';
import { GRANTS } from '../../constants';
import { usePageMeta } from '../../seo/usePageMeta';

export default function Funded() {
  usePageMeta('/projects/funded');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Funded Projects</h1>
          <p className="text-gray-500 max-w-2xl">A collection of research projects supported by various funding bodies.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {GRANTS.map((grant, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl space-y-8 hover:bg-zinc-900 hover:border-white/10 transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                  <Database className="w-8 h-8 text-white/60 group-hover:text-white transition-colors" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white tracking-tighter">{grant.amount}</div>
                  <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">{grant.period}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/40">{grant.role}</div>
                  <h2 className="text-2xl font-bold text-white leading-tight group-hover:text-white/90 transition-colors">
                    {grant.title}
                  </h2>
                </div>
                <p className="text-gray-400 leading-relaxed font-light">
                  {grant.body}
                </p>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
