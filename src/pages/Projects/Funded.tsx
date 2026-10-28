import { motion } from 'motion/react';
import { Globe, Landmark } from 'lucide-react';
import { GRANTS } from '../../constants';
import { usePageMeta } from '../../seo/usePageMeta';

const SCOPE_STYLE = {
  International: { icon: Globe, className: 'text-sky-300 bg-sky-500/10 border-sky-500/20' },
  National: { icon: Landmark, className: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' },
};

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
          <p className="text-gray-400 max-w-2xl">
            Research and capacity-building projects funded by the European Union and the Government of Bangladesh.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {GRANTS.map((grant, index) => {
            const scope = SCOPE_STYLE[grant.scope];
            const ScopeIcon = scope.icon;
            return (
              <motion.article
                key={grant.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 sm:p-8 bg-zinc-900/50 border border-white/5 border-l-2 border-l-indigo-500/40 rounded-3xl flex flex-col gap-6 hover:bg-zinc-900 hover:border-white/10 transition-colors"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${scope.className}`}>
                    <ScopeIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    {grant.scope}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white tracking-tighter tabular-nums">{grant.amount}</div>
                    <div className="text-xs text-gray-400 font-mono tracking-widest">{grant.period}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-indigo-300/80">{grant.role}</div>
                  <h2 className="text-2xl font-bold text-white leading-tight">{grant.title}</h2>
                </div>
                <p className="text-gray-400 leading-relaxed mt-auto">
                  <span className="sr-only">Funded by </span>
                  {grant.body}
                </p>
              </motion.article>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
