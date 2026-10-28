import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Filter, Search, X } from 'lucide-react';
import { PUBLICATIONS } from '../constants';
import { Publication } from '../types';
import { SITE_URL, publicationJsonLd, publicationPath, setMeta, setPageJsonLd, typeLabel } from '../seo/site';
import { pageMeta, Route } from '../seo/usePageMeta';

type PublicationType = Publication['type'];
type SortOrder = 'newest' | 'oldest' | 'cited' | 'title';

interface PublicationListProps {
  heading: string;
  description: string;
  // Page title, description and keywords are read from src/seo/routes.json.
  route: Route;
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

const PAGE_SIZE = 10;

// Topics offered in the filter: author keywords used by at least this many listed publications.
const MIN_TOPIC_COUNT = 3;

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
const pageButtonClass =
  'min-w-10 h-10 px-3 inline-flex items-center justify-center rounded-full border text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed';

// Page numbers to show: first, last, and the pages around the current one.
const pageWindow = (current: number, total: number) => {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total));
  return [...pages].sort((a, b) => a - b);
};

export default function PublicationList({
  heading,
  description,
  route,
  types,
  venueLabel = 'Venue',
  emptyLabel = 'publications',
}: PublicationListProps) {
  // Search, filters, sort order and page live in the URL so that any view can be linked to.
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const selectedYear = searchParams.get('year') ?? 'All';
  const selectedType = searchParams.get('type') ?? 'All';
  const selectedIndexed = searchParams.get('indexed') ?? 'All';
  const selectedTopic = searchParams.get('topic') ?? 'All';
  const sortParam = searchParams.get('sort') as SortOrder | null;
  const sortOrder: SortOrder = sortParam && sortParam in SORT_LABELS ? sortParam : 'newest';
  const searchId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const setParam = (key: string, value: string, defaultValue: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === defaultValue) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setSearchParams(next, { replace: key !== 'page' });
  };

  // The search box keeps its own text and writes it to the URL shortly after typing stops, so
  // fast typing is never lost. It follows the URL again when the query changes from elsewhere
  // (links, Back, Clear filters).
  const [searchInput, setSearchInput] = useState(query);
  const pendingSearch = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (pendingSearch.current === null) setSearchInput(query);
  }, [query]);
  useEffect(() => () => {
    if (pendingSearch.current !== null) clearTimeout(pendingSearch.current);
  }, []);
  const latestSetParam = useRef(setParam);
  latestSetParam.current = setParam;
  const onSearchChange = (value: string) => {
    setSearchInput(value);
    if (pendingSearch.current !== null) clearTimeout(pendingSearch.current);
    pendingSearch.current = setTimeout(() => {
      pendingSearch.current = null;
      latestSetParam.current('q', value, '');
    }, 200);
  };

  const typeKey = types.join(',');
  const pubs = useMemo(() => PUBLICATIONS.filter((p) => types.includes(p.type)), [typeKey]);
  const haystacks = useMemo(() => new Map(pubs.map((pub) => [pub.id, searchText(pub)])), [pubs]);

  useEffect(() => {
    const page = pageMeta(route);
    document.title = page.title;
    setMeta('name', 'description', page.description);
    setMeta('name', 'keywords', page.keywords?.join(', ') ?? null);
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
  }, [route, heading, pubs]);

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

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(searchParams.get('page')) || 1), pageCount);
  const firstIndex = (page - 1) * PAGE_SIZE;
  const pageItems = results.slice(firstIndex, firstIndex + PAGE_SIZE);

  const isFiltered =
    query.trim() !== '' ||
    selectedYear !== 'All' ||
    selectedType !== 'All' ||
    selectedIndexed !== 'All' ||
    selectedTopic !== 'All';

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (sortOrder !== 'newest') next.set('sort', sortOrder);
    setSearchParams(next, { replace: true });
  };

  const goToPage = (target: number) => {
    setParam('page', String(target), '1');
    listRef.current?.scrollIntoView({ block: 'start' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">{heading}</h1>
            <p className="text-gray-400 max-w-2xl">{description}</p>
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
                value={searchInput}
                onChange={(event) => onSearchChange(event.target.value)}
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
                  onChange={(event) => setParam('year', event.target.value, 'All')}
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
                    onChange={(event) => setParam('type', event.target.value, 'All')}
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
                    onChange={(event) => setParam('indexed', event.target.value, 'All')}
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
                    onChange={(event) => setParam('topic', event.target.value, 'All')}
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
                  onChange={(event) => setParam('sort', event.target.value, 'newest')}
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
                  className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 transition-colors"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                  <span>Clear filters</span>
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400" role="status" aria-live="polite">
              {results.length === 0
                ? `No ${emptyLabel} match`
                : `Showing ${firstIndex + 1}–${firstIndex + pageItems.length} of ${results.length} ${emptyLabel}`}
              {isFiltered && results.length > 0 && ` (${pubs.length} in total)`}
            </p>
          </form>
        </div>

        <div ref={listRef} className="grid gap-4 scroll-mt-24">
          {pageItems.map((pub) => (
            <article
              key={pub.id}
              className="group p-6 md:p-8 bg-zinc-900/50 border border-white/5 border-l-2 border-l-indigo-500/40 rounded-3xl hover:bg-zinc-900 hover:border-white/10 hover:border-l-indigo-400 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center gap-x-3">
                    <span className={BADGE.neutral}>{typeLabel(pub.type)}</span>
                    <span className="text-xs text-indigo-400 font-mono font-medium">{pub.year}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white leading-tight">
                    <Link
                      to={publicationPath(pub)}
                      className="hover:text-indigo-300 focus-visible:text-indigo-300 focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors"
                    >
                      {pub.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-gray-400 italic">{pub.authors}</p>
                  <div>
                    <div className="text-xs text-violet-400/70 uppercase tracking-widest mb-1">{venueLabel}</div>
                    <div className="text-sm text-gray-400">{pub.venue}</div>
                  </div>
                </div>
                <Link
                  to={publicationPath(pub)}
                  aria-label={`Details: ${pub.title}`}
                  className="shrink-0 self-start md:self-center px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-full transition-all border border-indigo-500/30 flex items-center space-x-2 text-sm font-medium text-indigo-200 hover:text-white"
                >
                  <span>Details</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}

          {results.length === 0 && (
            <div className="text-center py-20 text-gray-400 space-y-4">
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

        {pageCount > 1 && (
          <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
              className={`${pageButtonClass} border-white/10 text-gray-300 hover:bg-white/10`}
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            {pageWindow(page, pageCount).map((number, index, all) => (
              <span key={number} className="flex items-center gap-2">
                {index > 0 && number - all[index - 1] > 1 && <span className="text-gray-600" aria-hidden="true">…</span>}
                <button
                  type="button"
                  onClick={() => goToPage(number)}
                  aria-label={`Page ${number}`}
                  aria-current={number === page ? 'page' : undefined}
                  className={`${pageButtonClass} ${
                    number === page
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-white'
                      : 'border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {number}
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page === pageCount}
              aria-label="Next page"
              className={`${pageButtonClass} border-white/10 text-gray-300 hover:bg-white/10`}
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </nav>
        )}
      </motion.div>
    </div>
  );
}
