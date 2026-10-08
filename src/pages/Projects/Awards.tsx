import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Star } from 'lucide-react';
import { AWARDS } from '../../constants';
import { Award } from '../../types';

type Scope = 'all' | 'research';
type Layout = 'timeline' | 'cards';

const SCOPES: { value: Scope; label: string }[] = [
  { value: 'all', label: 'All Awards' },
  { value: 'research', label: 'Research Awards' },
];

const LAYOUTS: { value: Layout; label: string }[] = [
  { value: 'timeline', label: 'Timeline' },
  { value: 'cards', label: 'Cards' },
];

const COUNTRY_SUFFIX = /, Bangladesh|, Malaysia|, Japan/g;

const isResearchAward = (award: Award) => {
  const title = award.title.toLowerCase();
  return title.includes('research') || title.includes('publication') || title.includes('paper');
};

const getFlagCode = (title: string, venue: string) => {
  const t = title.toLowerCase();
  const v = venue.toLowerCase();
  if (v.includes('bangladesh') || v.includes('ulab') || t.includes('cum laude')) return 'bd';
  if (t.includes('ethics champion') || t.includes('ieee best student')) return 'us';
  if (t.includes('proposal') || t.includes('fellowship') || v.includes('malaysia')) return 'my';
  if (v.includes('japan') || v.includes('mjjis')) return 'jp';
  return null;
};

function Toggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center bg-zinc-900/50 border border-white/5 rounded-full p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
            value === option.value ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function Awards() {
  const [searchParams, setSearchParams] = useSearchParams();
  const scope: Scope = searchParams.get('show') === 'research' ? 'research' : 'all';
  const layout: Layout = searchParams.get('view') === 'cards' ? 'cards' : 'timeline';

  const setParam = (key: string, value: string, defaultValue: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === defaultValue) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    document.title = "Awards & Recognition | Nafees Mansoor";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Awards, honors, and research recognitions received by Dr. Nafees Mansoor.');
    }
  }, []);

  const awards = scope === 'research' ? AWARDS.filter(isResearchAward) : AWARDS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Awards & Recognition</h1>
            <p className="text-gray-500 max-w-2xl">
              {scope === 'research'
                ? 'Recognition for outstanding research contributions and academic excellence.'
                : 'A comprehensive list of honors, awards, and professional recognitions.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Toggle label="Awards shown" options={SCOPES} value={scope} onChange={(value) => setParam('show', value, 'all')} />
            <Toggle label="Layout" options={LAYOUTS} value={layout} onChange={(value) => setParam('view', value, 'timeline')} />
          </div>
        </div>

        <p className="text-xs text-gray-500" role="status" aria-live="polite">
          {awards.length} {scope === 'research' ? 'research awards' : 'awards'}
        </p>

        {layout === 'timeline' ? (
          <div
            key={`timeline-${scope}`}
            className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent"
          >
            {awards.map((award, index) => {
              const flagCode = getFlagCode(award.title, award.venue);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index, 5) * 0.1 }}
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
                          {award.venue.replace(COUNTRY_SUFFIX, '')}
                        </p>
                      </div>
                      
                      <div className="flex flex-col md:items-end gap-3 shrink-0">
                        <div className="text-xs font-bold uppercase tracking-widest text-indigo-400/80">
                          {award.date.replace(COUNTRY_SUFFIX, '')}
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
        ) : (
          <div key={`cards-${scope}`} className="grid md:grid-cols-2 gap-8">
            {awards.map((award, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 5) * 0.1 }}
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
        )}
      </motion.div>
    </div>
  );
}
