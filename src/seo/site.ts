import { PUBLICATIONS } from '../constants';
import { Publication } from '../types';

export const SITE_URL = 'https://www.nafees.info';
export const SITE_NAME = 'Nafees Mansoor';
export const WEB_OF_SCIENCE_PROFILE_URL = 'https://www.webofscience.com/wos/author/rid/M-2554-2016';

export const publicationPath = (pub: Publication) => `/publications/paper/${pub.slug}`;
export const doiUrl = (doi: string) => `https://doi.org/${doi}`;

const TYPE_LABELS: Record<Publication['type'], string> = {
  journal: 'Journal Article',
  conference: 'Conference Paper',
  'book-chapter': 'Book Chapter',
  patent: 'Patent',
  'edited-book': 'Edited Book',
};
export const typeLabel = (type: Publication['type']) => TYPE_LABELS[type];

// Page title and summary used for search results; must match scripts/prerender.mjs.
// A paper published twice shares its title, so later copies get the type appended.
export const publicationTitle = (pub: Publication) => {
  const first = PUBLICATIONS.find((other) => other.title === pub.title);
  return first === pub ? pub.title : `${pub.title} (${typeLabel(pub.type)})`;
};

// Abstracts that open like another paper's would give identical snippets, so those lead with the title.
const opening = (abstract: string) => abstract.slice(0, 160);
export const publicationSummary = (pub: Publication) => {
  if (!pub.abstract) return `${typeLabel(pub.type)} by ${pub.authors}. ${pub.venue}.`;
  const abstract = pub.abstract;
  const shared = PUBLICATIONS.some((other) => other !== pub && other.abstract && opening(other.abstract) === opening(abstract));
  return shared ? `${pub.title}. ${abstract}` : abstract;
};

// schema.org description of one publication; shared by the list and detail pages.
export const publicationJsonLd = (pub: Publication) => ({
  '@type': pub.type === 'book-chapter' ? 'Chapter' : pub.type === 'edited-book' ? 'Book' : 'ScholarlyArticle',
  '@id': `${SITE_URL}${publicationPath(pub)}`,
  name: pub.title,
  headline: pub.title,
  url: `${SITE_URL}${publicationPath(pub)}`,
  author: pub.authorNames?.map((author) => ({ '@type': 'Person', name: author })) ?? pub.authors,
  datePublished: String(pub.year),
  isPartOf: { '@type': pub.type === 'journal' ? 'Periodical' : 'PublicationVolume', name: pub.sourceTitle ?? pub.venue },
  ...(pub.abstract && { abstract: pub.abstract }),
  ...(pub.publisher && { publisher: { '@type': 'Organization', name: pub.publisher } }),
  ...(pub.authorKeywords && { keywords: pub.authorKeywords.join(', ') }),
  ...(pub.doi && {
    identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: pub.doi },
    sameAs: doiUrl(pub.doi),
  }),
});

// Replaces the page-level structured data. Site-wide data in index.html is left alone.
export const setPageJsonLd = (data: object | null) => {
  document.head.querySelectorAll('script[data-page-jsonld]').forEach((element) => element.remove());
  if (!data) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-page-jsonld', '');
  script.text = JSON.stringify({ '@context': 'https://schema.org', ...data });
  document.head.appendChild(script);
};

export const setMeta = (attribute: 'name' | 'property', key: string, content: string | null) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (content === null) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};
