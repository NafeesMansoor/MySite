import { ReactNode, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
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

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid sm:grid-cols-[10rem_1fr] gap-1 sm:gap-6 py-3 border-b border-white/5">
      <dt className="text-xs uppercase tracking-widest text-violet-400/70 pt-0.5">{label}</dt>
      <dd className="text-sm text-gray-300">{children}</dd>
    </div>
  );
}

export default function PublicationDetail() {
  const { slug } = useParams();
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
  const related = pub.authorKeywords
    ? PUBLICATIONS.filter(
        (other) =>
          other.id !== pub.id &&
          other.authorKeywords?.some((keyword) =>
            pub.authorKeywords!.some((own) => own.toLowerCase() === keyword.toLowerCase()),
          ),
      ).slice(0, 5)
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
        <nav aria-label="Breadcrumb">
          <Link to={list.path} className="inline-flex items-center space-x-2 text-sm text-indigo-300 hover:text-indigo-200 transition-colors">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>{list.label}</span>
          </Link>
        </nav>

        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-xs text-indigo-400 font-mono font-medium">{pub.year}</span>
            <span className={BADGE.neutral}>{typeLabel(pub.type)}</span>
            {pub.indexed && <span className={indexedBadge(pub.indexed)}>{pub.indexed}</span>}
            {pub.impactFactor && <span className={BADGE.impact}>IF: {pub.impactFactor}</span>}
            {pub.wosCoreCollection && <span className={BADGE.wos}>Web of Science</span>}
            {pub.openAccess && <span className={BADGE.openAccess}>Open Access</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">{pub.title}</h1>
          <p className="text-gray-400 italic">{pub.authorNames?.join(', ') ?? pub.authors}</p>
          <div className="group flex flex-wrap items-center gap-4">
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
            <ShareButtons title={pub.title} url={`${SITE_URL}${publicationPath(pub)}`} />
          </div>
        </header>

        {pub.abstract && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">Abstract</h2>
            <p className="text-gray-300 leading-relaxed">{pub.abstract}</p>
          </section>
        )}

        {pub.authorKeywords && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">Keywords</h2>
            <ul className="flex flex-wrap gap-2">
              {pub.authorKeywords.map((keyword) => (
                <li key={keyword}>
                  <Link
                    to={`/publications?q=${encodeURIComponent(keyword)}`}
                    className="inline-block text-xs text-gray-400 hover:text-indigo-200 bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 rounded-full px-3 py-1 transition-colors"
                  >
                    {keyword}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Publication details</h2>
          <dl>
            <Detail label="Published in">{pub.venue}</Detail>
            {pub.publisher && <Detail label="Publisher">{pub.publisher}</Detail>}
            {pub.conferenceName && (
              <Detail label="Conference">
                {[pub.conferenceName, pub.conferenceLocation, pub.conferenceDate].filter(Boolean).join(' · ')}
              </Detail>
            )}
            <Detail label="Year">{pub.year}</Detail>
            {pub.doi && (
              <Detail label="DOI">
                <a href={doiUrl(pub.doi)} target="_blank" rel="noopener noreferrer" className="text-sky-400/90 hover:text-sky-300 hover:underline underline-offset-4 break-all">
                  {pub.doi}
                </a>
              </Detail>
            )}
            {pub.citedBy !== undefined && (
              <Detail label="Citations">
                {pub.citedBy} in Scopus ({SCOPUS_EXPORT_LABEL})
                {pub.wosTimesCited !== undefined && ` · ${pub.wosTimesCited} in Web of Science (${WEB_OF_SCIENCE.preparedLabel})`}
              </Detail>
            )}
            {(pub.scopusUrl || (pub.wosCoreCollection && pub.wosAccession)) && (
              <Detail label="Index records">
                <span className="flex flex-wrap gap-x-6 gap-y-1">
                  {pub.scopusUrl && (
                    <a href={pub.scopusUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400/90 hover:text-sky-300 hover:underline underline-offset-4">
                      Scopus record
                    </a>
                  )}
                  {pub.wosCoreCollection && pub.wosAccession && (
                    <a
                      href={`https://www.webofscience.com/wos/woscc/full-record/${pub.wosAccession}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400/90 hover:text-sky-300 hover:underline underline-offset-4"
                    >
                      Web of Science record
                    </a>
                  )}
                </span>
              </Detail>
            )}
          </dl>
        </section>

        {related.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">Related publications</h2>
            <ul className="space-y-2">
              {related.map((other) => (
                <li key={other.id}>
                  <Link to={publicationPath(other)} className="text-sm text-gray-300 hover:text-indigo-300 transition-colors">
                    {other.title} <span className="text-gray-600">({other.year})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </motion.article>
    </div>
  );
}
