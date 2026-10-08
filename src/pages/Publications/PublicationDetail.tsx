import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Copy, ExternalLink, Search } from 'lucide-react';
import { PUBLICATIONS, SCOPUS_EXPORT_LABEL, WEB_OF_SCIENCE } from '../../constants';
import { Publication } from '../../types';
import { BADGE, indexedBadge } from '../../components/PublicationList';
import ShareButtons from '../../components/ShareButtons';
import { SITE_URL, doiUrl, publicationJsonLd, publicationPath, setMeta, setPageJsonLd, typeLabel } from '../../seo/site';
import NotFound from '../NotFound';

const LIST_PATHS: Record<Publication['type'], { path: string; label: string }> = {
  journal: { path: '/publications/journals', label: 'Journal Publications' },
  conference: { path: '/publications/proceedings', label: 'Conference Proceedings' },
  'book-chapter': { path: '/publications/book-chapters', label: 'Book Chapters' },
  patent: { path: '/publications/patent', label: 'Patents' },
  'edited-book': { path: '/publications', label: 'Publications' },
};

// Tags read by Google Scholar and reference managers.
const CITATION_META = [
  'citation_title',
  'citation_author',
  'citation_publication_date',
  'citation_journal_title',
  'citation_conference_title',
  'citation_doi',
  'citation_abstract_html_url',
];

const describe = (pub: Publication) => {
  const summary = pub.abstract ?? `${typeLabel(pub.type)} by ${pub.authors}. ${pub.venue}.`;
  return summary.length > 300 ? `${summary.slice(0, 297).trimEnd()}…` : summary;
};

const labelClass = 'text-xs uppercase tracking-widest text-violet-400/70';
const linkClass = 'text-sky-400/90 hover:text-sky-300 hover:underline underline-offset-4';
const chipClass =
  'inline-block text-xs text-gray-400 hover:text-indigo-200 bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 rounded-full px-3 py-1 transition-colors';

const BIBTEX_TYPES: Record<Publication['type'], string> = {
  journal: 'article',
  conference: 'inproceedings',
  'book-chapter': 'incollection',
  'edited-book': 'book',
  patent: 'misc',
};

const toBibtex = (pub: Publication, authors: string[]) => {
  const key = `${authors[0].split(' ').pop()?.toLowerCase().replace(/[^a-z]/g, '')}${pub.year}${pub.title.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '')}`;
  const fields: [string, string | undefined][] = [
    ['title', pub.title],
    ['author', authors.join(' and ')],
    [pub.type === 'journal' ? 'journal' : 'booktitle', pub.sourceTitle ?? pub.venue],
    ['year', String(pub.year)],
    ['volume', pub.volume],
    ['number', pub.issue],
    ['pages', pub.pages?.replace('–', '--')],
    ['publisher', pub.publisher],
    ['doi', pub.doi],
  ];
  return `@${BIBTEX_TYPES[pub.type]}{${key},\n${fields
    .filter(([, value]) => value)
    .map(([name, value]) => `  ${name} = {${value}}`)
    .join(',\n')}\n}`;
};

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="p-6 md:p-8 bg-zinc-900/50 border border-white/5 rounded-3xl space-y-5">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className={labelClass}>{label}</dt>
      <dd className="text-sm text-gray-300">{children}</dd>
    </div>
  );
}

function CopyButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
    >
      {active ? <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
      <span aria-live="polite">{active ? 'Copied' : label}</span>
    </button>
  );
}

export default function PublicationDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const pub = PUBLICATIONS.find((candidate) => candidate.slug === slug);

  useEffect(() => {
    if (!pub) return;
    document.title = `${pub.title} | Nafees Mansoor`;
    setMeta('name', 'description', describe(pub));
    setPageJsonLd(publicationJsonLd(pub));

    document.head.querySelectorAll(CITATION_META.map((name) => `meta[name="${name}"]`).join(',')).forEach((el) => el.remove());
    const add = (name: string, content?: string) => {
      if (!content) return;
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    };
    add('citation_title', pub.title);
    (pub.authorNames ?? []).forEach((author) => add('citation_author', author));
    add('citation_publication_date', String(pub.year));
    add(pub.type === 'journal' ? 'citation_journal_title' : 'citation_conference_title', pub.sourceTitle ?? pub.venue);
    add('citation_doi', pub.doi);
    add('citation_abstract_html_url', `${SITE_URL}${publicationPath(pub)}`);

    return () => {
      setPageJsonLd(null);
      document.head.querySelectorAll(CITATION_META.map((name) => `meta[name="${name}"]`).join(',')).forEach((el) => el.remove());
    };
  }, [pub]);

  if (!pub) return <NotFound />;

  const list = LIST_PATHS[pub.type];
  const articleUrl = pub.doi ? doiUrl(pub.doi) : pub.link;
  const pageUrl = `${SITE_URL}${publicationPath(pub)}`;
  const authors = pub.authorNames ?? [];
  const related = pub.authorKeywords
    ? PUBLICATIONS.filter(
        (other) =>
          other.id !== pub.id &&
          other.authorKeywords?.some((keyword) =>
            pub.authorKeywords!.some((own) => own.toLowerCase() === keyword.toLowerCase()),
          ),
      ).slice(0, 5)
    : [];
  const citation = `${pub.authors.replace(/\.$/, '')}. (${pub.year}). ${pub.title}. ${pub.venue.replace(/\.$/, '')}.${pub.doi ? ` ${doiUrl(pub.doi)}` : ''}`;
  const bibtex = authors.length ? toBibtex(pub, authors) : null;
  const volumeLine = [
    pub.volume && `Volume ${pub.volume}`,
    pub.issue && `Issue ${pub.issue}`,
    pub.pages ? `pp. ${pub.pages}` : pub.articleNumber && `Article ${pub.articleNumber}`,
  ].filter(Boolean).join(' · ');

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (search.trim()) navigate(`/publications?q=${encodeURIComponent(search.trim())}`);
  };

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <nav aria-label="Breadcrumb">
            <Link to={list.path} className="inline-flex items-center space-x-2 text-sm text-indigo-300 hover:text-indigo-200 transition-colors">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>{list.label}</span>
            </Link>
          </nav>
          <form role="search" onSubmit={submitSearch} className="flex items-center space-x-2 bg-zinc-900/50 border border-white/5 rounded-full px-5 py-2.5 focus-within:border-indigo-400/60 lg:w-96">
            <Search className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
            <label htmlFor="publication-search" className="sr-only">Search all publications</label>
            <input
              id="publication-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search all publications"
              className="w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none"
            />
          </form>
        </div>

        <header className="space-y-5 p-6 md:p-10 bg-zinc-900/50 border border-white/5 border-l-2 border-l-indigo-500/40 rounded-3xl">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className={BADGE.neutral}>{typeLabel(pub.type)}</span>
            <span className="text-xs text-indigo-400 font-mono font-medium">{pub.year}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">{pub.title}</h1>
          <p className="text-gray-400 italic">{authors.length ? authors.join(', ') : pub.authors}</p>
          <p className="text-sm text-gray-400">{pub.venue}</p>
          <div className="group flex flex-wrap items-center gap-4 pt-2">
            {articleUrl && (
              <a
                href={articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-full transition-all border border-indigo-500/30 flex items-center space-x-2 text-sm font-medium text-indigo-200 hover:text-white"
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
                <span>View article on the publisher’s site</span>
              </a>
            )}
            <ShareButtons title={pub.title} url={pageUrl} />
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {pub.abstract && (
              <Card title="Abstract">
                <p className="text-gray-300 leading-relaxed">{pub.abstract}</p>
              </Card>
            )}

            {(pub.authorKeywords || pub.indexKeywords) && (
              <Card title="Keywords">
                {pub.authorKeywords && (
                  <div className="space-y-2">
                    <h3 className={labelClass}>Author keywords</h3>
                    <ul className="flex flex-wrap gap-2">
                      {pub.authorKeywords.map((keyword) => (
                        <li key={keyword}>
                          <Link to={`/publications?q=${encodeURIComponent(keyword)}`} className={chipClass}>
                            {keyword}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {pub.indexKeywords && (
                  <div className="space-y-2">
                    <h3 className={labelClass}>Index keywords (assigned by Scopus)</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{pub.indexKeywords.join(' · ')}</p>
                  </div>
                )}
              </Card>
            )}

            <Card title="Cite this publication">
              <p className="text-sm text-gray-300 leading-relaxed">{citation}</p>
              <div className="flex flex-wrap gap-3">
                <CopyButton label="Copy citation" active={copied === 'citation'} onClick={() => copy('citation', citation)} />
                {bibtex && <CopyButton label="Copy BibTeX" active={copied === 'bibtex'} onClick={() => copy('bibtex', bibtex)} />}
              </div>
              {bibtex && (
                <pre className="text-xs text-gray-400 bg-black/40 border border-white/5 rounded-2xl p-4 overflow-x-auto font-mono">{bibtex}</pre>
              )}
            </Card>

            {related.length > 0 && (
              <Card title="Related publications">
                <ul className="space-y-3">
                  {related.map((other) => (
                    <li key={other.id}>
                      <Link to={publicationPath(other)} className="text-sm text-gray-300 hover:text-indigo-300 transition-colors">
                        {other.title} <span className="text-gray-600">({other.year})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card title="Publication details">
              <dl className="space-y-4">
                <Detail label={pub.type === 'journal' ? 'Journal' : 'Published in'}>{pub.sourceTitle ?? pub.venue}</Detail>
                {volumeLine && <Detail label="Volume and pages">{volumeLine}</Detail>}
                {pub.conferenceName && (
                  <Detail label="Conference">
                    {[pub.conferenceName, pub.conferenceLocation, pub.conferenceDate].filter(Boolean).join(' · ')}
                  </Detail>
                )}
                {pub.publisher && <Detail label="Publisher">{pub.publisher}</Detail>}
                <Detail label="Year">{pub.year}</Detail>
                <Detail label="Type">{pub.documentType ?? typeLabel(pub.type)}</Detail>
                {pub.issn && <Detail label="ISSN">{pub.issn}</Detail>}
                {pub.isbn && <Detail label="ISBN">{pub.isbn.join(', ')}</Detail>}
              </dl>
            </Card>

            {(pub.indexed || pub.impactFactor || pub.citedBy !== undefined || pub.wosCoreCollection || pub.openAccess) && (
              <Card title="Indexing and metrics">
                <div className="flex flex-wrap gap-2">
                  {pub.indexed && <span className={indexedBadge(pub.indexed)}>{pub.indexed}</span>}
                  {pub.wosCoreCollection && <span className={BADGE.wos}>Web of Science</span>}
                  {pub.impactFactor && <span className={BADGE.impact}>IF: {pub.impactFactor}</span>}
                  {pub.openAccess && <span className={BADGE.openAccess}>Open Access</span>}
                </div>
                {(pub.citedBy !== undefined || pub.wosTimesCited !== undefined) && (
                  <dl className="grid grid-cols-2 gap-4">
                    {pub.citedBy !== undefined && (
                      <div>
                        <dd className="text-3xl font-bold tracking-tighter text-amber-400">{pub.citedBy}</dd>
                        <dt className="text-xs text-gray-500">Scopus citations ({SCOPUS_EXPORT_LABEL})</dt>
                      </div>
                    )}
                    {pub.wosTimesCited !== undefined && (
                      <div>
                        <dd className="text-3xl font-bold tracking-tighter text-purple-400">{pub.wosTimesCited}</dd>
                        <dt className="text-xs text-gray-500">Web of Science citations ({WEB_OF_SCIENCE.preparedLabel})</dt>
                      </div>
                    )}
                  </dl>
                )}
              </Card>
            )}

            {(pub.doi || pub.scopusUrl || (pub.wosCoreCollection && pub.wosAccession)) && (
              <Card title="Identifiers and links">
                <dl className="space-y-4">
                  {pub.doi && (
                    <Detail label="DOI">
                      <a href={doiUrl(pub.doi)} target="_blank" rel="noopener noreferrer" className={`${linkClass} break-all`}>{pub.doi}</a>
                    </Detail>
                  )}
                  {pub.scopusUrl && (
                    <Detail label="Scopus">
                      <a href={pub.scopusUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>Scopus record</a>
                    </Detail>
                  )}
                  {pub.wosCoreCollection && pub.wosAccession && (
                    <Detail label="Web of Science">
                      <a href={`https://www.webofscience.com/wos/woscc/full-record/${pub.wosAccession}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {pub.wosAccession}
                      </a>
                    </Detail>
                  )}
                </dl>
              </Card>
            )}

            <Card title="Browse more">
              <ul className="flex flex-wrap gap-2">
                <li><Link to={`${list.path}?year=${pub.year}`} className={chipClass}>{list.label} in {pub.year}</Link></li>
                <li><Link to={`/publications?year=${pub.year}`} className={chipClass}>All publications in {pub.year}</Link></li>
                {pub.indexed && (
                  <li><Link to={`/publications?indexed=${encodeURIComponent(pub.indexed)}`} className={chipClass}>{pub.indexed}</Link></li>
                )}
                <li><Link to={list.path} className={chipClass}>All {list.label.toLowerCase()}</Link></li>
              </ul>
            </Card>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
