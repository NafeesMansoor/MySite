import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Filter, X } from 'lucide-react';
import { PUBLICATIONS } from '../../constants';

export default function Journals() {
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedIndexed, setSelectedIndexed] = useState<string>('All');

  useEffect(() => {
    document.title = "Journal Publications | Nafees Mansoor";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Peer-reviewed research articles published in international journals by Dr. Nafees Mansoor.');
    }
  }, []);

  const journals = useMemo(() => PUBLICATIONS.filter(p => p.type === 'journal'), []);

  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(journals.map(p => p.year.toString()))).sort((a, b) => (b as string).localeCompare(a as string));
    return ['All', ...uniqueYears];
  }, [journals]);

  const indexedStatuses = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(journals.map(p => p.indexed).filter(Boolean) as string[]));
    return ['All', ...uniqueStatuses];
  }, [journals]);

  const filteredJournals = journals.filter(pub => {
    const yearMatch = selectedYear === 'All' || pub.year.toString() === selectedYear;
    const indexedMatch = selectedIndexed === 'All' || pub.indexed === selectedIndexed;
    return yearMatch && indexedMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Journal Publications</h1>
            <p className="text-gray-500 max-w-2xl">Peer-reviewed research articles published in international journals.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 bg-zinc-900/50 border border-white/5 rounded-full px-4 py-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer"
              >
                {years.map(year => (
                  <option key={year} value={year} className="bg-zinc-900">{year}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-zinc-900/50 border border-white/5 rounded-full px-4 py-2">
              <select 
                value={selectedIndexed}
                onChange={(e) => setSelectedIndexed(e.target.value)}
                className="bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-zinc-900">All Indexing</option>
                {indexedStatuses.filter(s => s !== 'All').map(status => (
                  <option key={status} value={status} className="bg-zinc-900">{status}</option>
                ))}
              </select>
            </div>

            {(selectedYear !== 'All' || selectedIndexed !== 'All') && (
              <button 
                onClick={() => { setSelectedYear('All'); setSelectedIndexed('All'); }}
                className="text-xs text-gray-500 hover:text-white flex items-center space-x-1 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {filteredJournals.map((pub, index) => (
              <motion.div
                key={pub.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group p-8 bg-zinc-900/50 border border-white/5 rounded-3xl hover:bg-zinc-900 hover:border-white/10 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-500 font-mono">{pub.year}</span>
                      {pub.indexed && (
                        <span className="text-[10px] text-white/40 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                          {pub.indexed}
                        </span>
                      )}
                      {pub.impactFactor && (
                        <span className="text-[10px] text-white/40 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                          IF: {pub.impactFactor}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors leading-tight">
                      {pub.title}
                    </h2>
                    <p className="text-sm text-gray-500 italic">{pub.authors}</p>
                  </div>
                  <div className="flex items-center space-x-6 shrink-0">
                    <div className="text-right hidden md:block">
                      <div className="text-xs text-gray-600 uppercase tracking-widest mb-1">Venue</div>
                      <div className="text-sm text-gray-400 max-w-[250px] truncate">{pub.venue}</div>
                    </div>
                    <a 
                      href="#" 
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 group flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                      <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">View</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredJournals.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              No publications found matching the selected filters.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
