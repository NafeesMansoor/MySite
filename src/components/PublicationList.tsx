import { useEffect, useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ExternalLink, Filter, Search, X } from 'lucide-react';
import { PUBLICATIONS, SCOPUS_EXPORT_LABEL, WEB_OF_SCIENCE } from '../constants';
import { Publication } from '../types';
import ShareButtons from './ShareButtons';
import { SITE_URL, doiUrl, publicationJsonLd, publicationPath, setMeta, setPageJsonLd, typeLabel } from '../seo/site';

type PublicationType = Publication['type'];
type SortOrder = 'newest' | 'oldest' | 'cited' | 'title';

interface PublicationListProps {
  heading: string;
  description: string;
  pageTitle: string;
  metaDescription: string;
  types: PublicationType[];
  venueLabel?: string;
  emptyLabel?: string;
}

const SORT_LABELS: Record<SortOrder, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  cited: 'Most cited',
  title: 'Title A–Z',
};

// Topics offered in the filter: author keywords used by at least this many listed publications.
const MIN_TOPIC_COUNT = 3;

const wosUrl = (accession: string) => `https://www.webofscience.com/wos/woscc/full-record/${accession}`;

const searchText = (pub: Publication) =>
  [
    pub.title,
    pub.authors,
    pub.authorNames?.join(' '),
    pub.venue,
    pub.sourceTitle,
    pub.conferenceName,
    pub.abstract,
    pub.authorKeywords?.join(' '),
    pub.indexKeywords?.join(' '),
    pub.doi,
    pub.wosAccession,
    pub.year,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

// Badge colours follow the accent palette of the home page.
const BADGE_BASE = 'text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border';
export const BADGE = {
  neutral: `${BADGE_BASE} text-white/50 bg-white/5 border-white/5`,
  isi: `${BADGE_BASE} text-indigo-300 bg-indigo-500/10 border-indigo-500/20`,
  scopus: `${BADGE_BASE} text-sky-300 bg-sky-500/10 border-sky-500/20`,
  impact: `${BADGE_BASE} text-violet-300 bg-violet-500/10 border-violet-500/20`,
  wos: `${BADGE_BASE} text-purple-300 bg-purple-500/10 border-purple-500/20`,
  openAccess: `${BADGE_BASE} text-emerald-300 bg-emerald-500/10 border-emerald-500/20`,
  cited: `${BADGE_BASE} text-amber-300 bg-amber-500/10 border-amber-500/20`,
};
export const indexedBadge = (indexed: string) => (indexed.startsWith('ISI') ? BADGE.isi : BADGE.scopus);

const selectClass = 'bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer max-w-[14rem]';
const pillClass =
  'flex items-center space-x-2 bg-zinc-900/50 border border-white/5 rounded-full px-4 py-2 focus-within:border-indigo-400/60';
const linkClass =
  'inline-flex items-center space-x-1.5 text-xs text-sky-400/80 hover:text-sky-300 underline-offset-4 hover:underline transition-colors';

export default function PublicationList({
  heading,
  description,
  pageTitle,
  metaDescription,
  types,
  venueLabel = 'Venue',
  emptyLabel = 'publications',
}: PublicationListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedIndexed, setSelectedIndexed] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const searchId = useId();

  const typeKey = types.join(',');
  const pubs = useMemo(() => PUBLICATIONS.filter((p) => types.includes(p.type)), [typeKey]);
  const haystacks = useMemo(() => new Map(pubs.map((pub) => [pub.id, searchText(pub)])), [pubs]);

  useEffect(() => {
    document.title = pageTitle;
    setMeta('name', 'description', metaDescription);
    setPageJsonLd({
      '@type': 'ItemList',
      name: heading,
      numberOfItems: pubs.length,
      itemListElement: pubs.map((pub, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}${publicationPath(pub)}`,
        item: publicationJsonLd({ ...pub, abstract: undefined }),
      })),
    });
    return () => setPageJsonLd(null);
  }, [pageTitle, metaDescription, heading, pubs]);

  // Keep the search term in the URL so that a search can be shared or bookmarked.
  useEffect(() => {
    const trimmed = query.trim();
    if ((searchParams.get('q') ?? '') === trimmed) return;
    const next = new URLSearchParams(searchParams);
    if (trimmed) next.set('q', trimmed);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  }, [query]);

  const years = useMemo(
    () => Array.from(new Set<string>(pubs.map((p) => p.year.toString()))).sort((a, b) => b.localeCompare(a)),
    [pubs],
  );
  const availableTypes = useMemo(() => types.filter((type) => pubs.some((p) => p.type === type)), [pubs]);
  const indexedStatuses = useMemo(
    () => Array.from(new Set(pubs.map((p) => p.indexed).filter(Boolean) as string[])).sort(),
    [pubs],
  );
  const topics = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    pubs.forEach((pub) =>
      pub.authorKeywords?.forEach((keyword) => {
        const key = keyword.toLowerCase();
        const entry = counts.get(key) ?? { label: keyword, count: 0 };
        entry.count += 1;
        counts.set(key, entry);
      }),
    );
    return Array.from(counts.entries())
      .filter(([, entry]) => entry.count >= MIN_TOPIC_COUNT)
      .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
      .map(([key, entry]) => ({ key, ...entry }));
  }, [pubs]);
  const hasCitations = useMemo(() => pubs.some((p) => p.citedBy !== undefined), [pubs]);
  const hasMetadata = useMemo(() => pubs.some((p) => p.scopusEid), [pubs]);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const filtered = pubs.filter((pub) => {
      if (selectedYear !== 'All' && pub.year.toString() !== selectedYear) return false;
      if (selectedType !== 'All' && pub.type !== selectedType) return false;
      if (selectedIndexed !== 'All' && pub.indexed !== selectedIndexed) return false;
      if (selectedTopic !== 'All' && !pub.authorKeywords?.some((k) => k.toLowerCase() === selectedTopic)) return false;
      const haystack = haystacks.get(pub.id) ?? '';
      return terms.every((term) => haystack.includes(term));
    });
    // Array.prototype.sort is stable, so ties keep the curated order of the list.
    switch (sortOrder) {
      case 'newest':
        return [...filtered].sort((a, b) => b.year - a.year);
      case 'oldest':
        return [...filtered].sort((a, b) => a.year - b.year);
      case 'cited':
        return [...filtered].sort((a, b) => (b.citedBy ?? -1) - (a.citedBy ?? -1));
      case 'title':
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }
  }, [pubs, haystacks, query, selectedYear, selectedType, selectedIndexed, selectedTopic, sortOrder]);

  const isFiltered =
    query.trim() !== '' ||
    selectedYear !== 'All' ||
    selectedType !== 'All' ||
    selectedIndexed !== 'All' ||
    selectedTopic !== 'All';

  const clearFilters = () => {
    setQuery('');
    setSelectedYear('All');
    setSelectedType('All');
    setSelectedIndexed('All');
    setSelectedTopic('All');
  };

  const toggleAbstract = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">{heading}</h1>
            <p className="text-gray-500 max-w-2xl">{description}</p>
          </div>

          <form role="search" onSubmit={(event) => event.preventDefault()} className="space-y-4">
            <div className={`${pillClass} px-5 py-3`}>
              <Search className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
              <label htmlFor={searchId} className="sr-only">
                Search {heading.toLowerCase()}
              </label>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, author, keyword, abstract, or DOI"
                className="w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className={pillClass}>
                <Filter className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                <select
                  aria-label="Filter by year"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  className={selectClass}
                >
                  <option value="All" className="bg-zinc-900">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year} className="bg-zinc-900">{year}</option>
                  ))}
                </select>
              </div>

              {availableTypes.length > 1 && (
                <div className={pillClass}>
                  <select
                    aria-label="Filter by publication type"
                    value={selectedType}
                    onChange={(event) => setSelectedType(event.target.value)}
                    className={selectClass}
                  >
                    <option value="All" className="bg-zinc-900">All Types</option>
                    {availableTypes.map((type) => (
                      <option key={type} value={type} className="bg-zinc-900">{typeLabel(type)}</option>
                    ))}
                  </select>
                </div>
              )}

              {indexedStatuses.length > 1 && (
                <div className={pillClass}>
                  <select
                    aria-label="Filter by indexing"
                    value={selectedIndexed}
                    onChange={(event) => setSelectedIndexed(event.target.value)}
                    className={selectClass}
                  >
                    <option value="All" className="bg-zinc-900">All Indexing</option>
                    {indexedStatuses.map((status) => (
                      <option key={status} value={status} className="bg-zinc-900">{status}</option>
                    ))}
                  </select>
                </div>
              )}

              {topics.length > 0 && (
                <div className={pillClass}>
                  <select
                    aria-label="Filter by topic"
                    value={selectedTopic}
                    onChange={(event) => setSelectedTopic(event.target.value)}
                    className={selectClass}
                  >
                    <option value="All" className="bg-zinc-900">All Topics</option>
                    {topics.map((topic) => (
                      <option key={topic.key} value={topic.key} className="bg-zinc-900">
                        {topic.label} ({topic.count})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={pillClass}>
                <select
                  aria-label="Sort publications"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                  className={selectClass}
                >
                  {(Object.keys(SORT_LABELS) as SortOrder[])
                    .filter((order) => order !== 'cited' || hasCitations)
                    .map((order) => (
                      <option key={order} value={order} className="bg-zinc-900">{SORT_LABELS[order]}</option>
                    ))}
                </select>
              </div>

              {isFiltered && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-white flex items-center space-x-1 transition-colors"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                  <span>Clear filters</span>
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500" role="status" aria-live="polite">
              {isFiltered
                ? `Showing ${results.length} of ${pubs.length} ${emptyLabel}`
                : `${pubs.length} ${emptyLabel}`}
            </p>
          </form>
        </div>

        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {results.map((pub) => {
              const isOpen = expanded.has(pub.id);
              const abstractId = `abstract-${pub.id}`;
              const articleUrl = pub.doi ? doiUrl(pub.doi) : pub.link;
              return (
                <motion.article
                  key={pub.id}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group p-8 bg-zinc-900/50 border border-white/5 border-l-2 border-l-indigo-500/40 rounded-3xl hover:bg-zinc-900 hover:border-white/10 hover:border-l-indigo-400 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="text-xs text-indigo-400 font-mono font-medium">{pub.year}</span>
                        {types.length > 1 && <span className={BADGE.neutral}>{typeLabel(pub.type)}</span>}
                        {pub.indexed && <span className={indexedBadge(pub.indexed)}>{pub.indexed}</span>}
                        {pub.impactFactor && <span className={BADGE.impact}>IF: {pub.impactFactor}</span>}
                        {pub.wosCoreCollection && (
                          <span
                            className={BADGE.wos}
                            title={
                              pub.wosTimesCited !== undefined
                                ? `Web of Science Core Collection — cited ${pub.wosTimesCited} times (${WEB_OF_SCIENCE.preparedLabel})`
                                : 'Web of Science Core Collection'
                            }
                          >
                            Web of Science
                          </span>
                        )}
                        {pub.openAccess && <span className={BADGE.openAccess}>Open Access</span>}
                        {pub.citedBy !== undefined && pub.citedBy > 0 && (
                          <span className={BADGE.cited} title={`Scopus citation count, ${SCOPUS_EXPORT_LABEL}`}>
                            Cited by {pub.citedBy}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-white leading-tight">
                        <Link
                          to={publicationPath(pub)}
                          className="hover:text-indigo-300 focus-visible:text-indigo-300 focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors"
                        >
                          {pub.title}
                        </Link>
                      </h2>
                      <p className="text-sm text-gray-500 italic">{pub.authors}</p>
                      <p className="text-sm text-gray-400 md:hidden">{pub.venue}</p>
                    </div>
                    <div className="flex items-center space-x-6 shrink-0">
                      <div className="text-right hidden md:block">
                        <div className="text-xs text-violet-400/70 uppercase tracking-widest mb-1">{venueLabel}</div>
                        <div className="text-sm text-gray-400 max-w-[250px] line-clamp-3" title={pub.venue}>
                          {pub.venue}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-3">
                        {articleUrl && (
                          <a
                            href={articleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View article: ${pub.title} (opens the publisher page in a new tab)`}
                            className="px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-full transition-all border border-indigo-500/30 group/link flex items-center space-x-2"
                          >
                            <ExternalLink className="w-4 h-4 text-indigo-300 group-hover/link:text-white transition-colors" aria-hidden="true" />
                            <span className="text-sm font-medium text-indigo-200 group-hover/link:text-white transition-colors whitespace-nowrap">
                              View article
                            </span>
                          </a>
                        )}
                        <ShareButtons title={pub.title} url={articleUrl || window.location.href} />
                      </div>
                    </div>
                  </div>

                  {(pub.abstract || pub.doi || pub.scopusUrl || pub.authorKeywords || pub.wosCoreCollection) && (
                    <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                      {pub.authorKeywords && (
                        <ul className="flex flex-wrap gap-2" aria-label="Author keywords">
                          {pub.authorKeywords.map((keyword) => (
                            <li key={keyword}>
                              <button
                                type="button"
                                onClick={() => setQuery(keyword)}
                                title={`Search for "${keyword}"`}
                                className="text-xs text-gray-400 hover:text-indigo-200 bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 rounded-full px-3 py-1 transition-colors"
                              >
                                {keyword}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        {pub.abstract && (
                          <button
                            type="button"
                            onClick={() => toggleAbstract(pub.id)}
                            aria-expanded={isOpen}
                            aria-controls={abstractId}
                            className="inline-flex items-center space-x-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                              aria-hidden="true"
                            />
                            <span>{isOpen ? 'Hide abstract' : 'Show abstract'}</span>
                          </button>
                        )}
                        {pub.doi && (
                          <a href={doiUrl(pub.doi)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                            <span>DOI: {pub.doi}</span>
                          </a>
                        )}
                        {pub.scopusUrl && (
                          <a href={pub.scopusUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                            <span>Scopus record</span>
                          </a>
                        )}
                        {pub.wosCoreCollection && pub.wosAccession && (
                          <a href={wosUrl(pub.wosAccession)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                            <span>Web of Science record</span>
                          </a>
                        )}
                      </div>

                      {pub.abstract && (
                        <div id={abstractId} hidden={!isOpen}>
                          <h3 className="sr-only">Abstract</h3>
                          <p className="text-sm text-gray-400 leading-relaxed max-w-4xl">{pub.abstract}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.article>
              );
            })}
          </AnimatePresence>

          {results.length === 0 && (
            <div className="text-center py-20 text-gray-500 space-y-4">
              <p>No {emptyLabel} found matching your search and filters.</p>
              {isFiltered && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-5 py-2 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {hasMetadata && (
          <p className="text-xs text-gray-600">
            Abstracts, keywords, DOIs, and citation counts are taken from Scopus ({SCOPUS_EXPORT_LABEL}). Article links
            lead to the publisher’s page, where access may require a subscription unless marked Open Access. Web of
            Science status is taken from the{' '}
            <a
              href={WEB_OF_SCIENCE.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-gray-400 transition-colors"
            >
              Web of Science researcher profile
            </a>{' '}
            ({WEB_OF_SCIENCE.preparedLabel}; h-index {WEB_OF_SCIENCE.allTime.hIndex},{' '}
            {WEB_OF_SCIENCE.allTime.timesCited} citations, {WEB_OF_SCIENCE.allTime.coreCollectionPublications} Core
            Collection publications).
          </p>
        )}
      </motion.div>
    </div>
  );
}
