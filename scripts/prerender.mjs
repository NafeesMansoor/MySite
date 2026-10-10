// Runs after `vite build`. Writes one static HTML file per page into dist/ so that crawlers
// and link previews get each page's title, description, canonical URL, structured data and
// readable content without running JavaScript. The React app replaces the static content
// inside #root as soon as it loads, so what visitors see is unchanged.
import fs from 'fs';
import path from 'path';
import { SITE_URL, absoluteUrl, publicationPath, publications, staticRoutes } from './seo-config.mjs';

const DIST = path.resolve(process.cwd(), 'dist');
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

const TYPE_LABELS = {
  journal: 'Journal Article',
  conference: 'Conference Paper',
  'book-chapter': 'Book Chapter',
  patent: 'Patent',
  'edited-book': 'Edited Book',
};

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// "<" must not appear raw inside a JSON-LD script element.
const jsonLd = (data) =>
  `<script type="application/ld+json" data-page-jsonld>${JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c')}</script>`;
const meta = (attribute, key, content) => `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
const truncate = (text, length) => (text.length > length ? `${text.slice(0, length - 3).trimEnd()}…` : text);
const doiUrl = (doi) => `https://doi.org/${doi}`;

const publicationJsonLd = (pub, withAbstract) => ({
  '@type': pub.type === 'book-chapter' ? 'Chapter' : pub.type === 'edited-book' ? 'Book' : 'ScholarlyArticle',
  '@id': absoluteUrl(publicationPath(pub)),
  name: pub.title,
  headline: pub.title,
  url: absoluteUrl(publicationPath(pub)),
  author: pub.authorNames?.map((name) => ({ '@type': 'Person', name })) ?? pub.authors,
  datePublished: String(pub.year),
  isPartOf: { '@type': pub.type === 'journal' ? 'Periodical' : 'PublicationVolume', name: pub.sourceTitle ?? pub.venue },
  ...(withAbstract && pub.abstract && { abstract: pub.abstract }),
  ...(pub.publisher && { publisher: { '@type': 'Organization', name: pub.publisher } }),
  ...(pub.authorKeywords && { keywords: pub.authorKeywords.join(', ') }),
  ...(pub.doi && {
    identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: pub.doi },
    sameAs: doiUrl(pub.doi),
  }),
});

const siteNav = `<nav aria-label="Site"><ul>${Object.entries(staticRoutes)
  .map(([route, page]) => `<li><a href="${route}">${escapeHtml(page.heading)}</a></li>`)
  .join('')}</ul></nav>`;

const renderPage = ({ route, title, description, head = [], body, ogType = 'website' }) => {
  const url = absoluteUrl(route);
  const tags = [
    `<link rel="canonical" href="${url}" />`,
    meta('property', 'og:url', url),
    ...head,
  ].join('\n    ');
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${ogType}$2`)
    .replace('</head>', `  ${tags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"><main class="max-w-7xl mx-auto px-4 py-24 text-gray-400">${body}${siteNav}</main></div>`);
  if (!html.includes(body.slice(0, 40))) throw new Error(`prerender: could not inject content for ${route}`);

  const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
  fs.mkdirSync(path.dirname(path.join(DIST, file)), { recursive: true });
  fs.writeFileSync(path.join(DIST, file), html);
};

// A paper published twice (e.g. conference and journal versions) shares its title; later
// copies get the publication type appended so each page has a distinct title.
const publicationTitle = (pub) => {
  const first = publications.find((other) => other.title === pub.title);
  return first === pub ? pub.title : `${pub.title} (${TYPE_LABELS[pub.type]})`;
};

// Abstracts that open with the same sentences as another paper's would give identical search
// snippets, so those lead with the title.
const opening = (pub) => pub.abstract.slice(0, 160);
const sharedOpening = (pub) => publications.some((other) => other !== pub && other.abstract && opening(other) === opening(pub));
const publicationSummary = (pub) => {
  if (!pub.abstract) return `${TYPE_LABELS[pub.type]} by ${pub.authors}. ${pub.venue}.`;
  return sharedOpening(pub) ? `${pub.title}. ${pub.abstract}` : pub.abstract;
};

const publicationItem = (pub) =>
  `<li><a href="${publicationPath(pub)}">${escapeHtml(pub.title)}</a>. ${escapeHtml(pub.authors)}. ${escapeHtml(pub.venue)} (${pub.year}).</li>`;

for (const [route, page] of Object.entries(staticRoutes)) {
  const listed = page.types ? publications.filter((pub) => page.types.includes(pub.type)) : [];
  const head = listed.length
    ? [
        jsonLd({
          '@type': 'ItemList',
          name: page.heading,
          numberOfItems: listed.length,
          itemListElement: listed.map((pub, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: absoluteUrl(publicationPath(pub)),
            item: publicationJsonLd(pub, false),
          })),
        }),
      ]
    : [];
  const body =
    `<h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.description)}</p>` +
    (listed.length ? `<ol>${listed.map(publicationItem).join('')}</ol>` : '');
  renderPage({ route, title: page.title, description: page.description, head, body });
}

for (const pub of publications) {
  const description = truncate(publicationSummary(pub), 300);
  const head = [
    jsonLd(publicationJsonLd(pub, true)),
    meta('name', 'citation_title', pub.title),
    ...(pub.authorNames ?? []).map((name) => meta('name', 'citation_author', name)),
    meta('name', 'citation_publication_date', pub.year),
    meta('name', pub.type === 'journal' ? 'citation_journal_title' : 'citation_conference_title', pub.sourceTitle ?? pub.venue),
    ...(pub.doi ? [meta('name', 'citation_doi', pub.doi)] : []),
    meta('name', 'citation_abstract_html_url', absoluteUrl(publicationPath(pub))),
  ];
  const body =
    `<article><h1>${escapeHtml(pub.title)}</h1>` +
    `<p>${escapeHtml(pub.authorNames?.join(', ') ?? pub.authors)}</p>` +
    `<p>${escapeHtml(TYPE_LABELS[pub.type])}. ${escapeHtml(pub.venue)} (${pub.year}).</p>` +
    (pub.abstract ? `<h2>Abstract</h2><p>${escapeHtml(pub.abstract)}</p>` : '') +
    (pub.authorKeywords ? `<h2>Keywords</h2><p>${escapeHtml(pub.authorKeywords.join(', '))}</p>` : '') +
    (pub.doi ? `<p>DOI: <a href="${doiUrl(pub.doi)}">${escapeHtml(pub.doi)}</a></p>` : '') +
    `</article>`;
  renderPage({
    route: publicationPath(pub),
    title: `${publicationTitle(pub)} | Nafees Mansoor`,
    description,
    head,
    body,
    ogType: 'article',
  });
}

// Served by the host, with a 404 status, for any address that matches no file. It loads the
// app, which shows its "Page not found" view.
fs.writeFileSync(
  path.join(DIST, '404.html'),
  template
    .replace(/<title>[\s\S]*?<\/title>/, '<title>Page not found | Nafees Mansoor</title>')
    .replace(/(<meta name="robots" content=")[^"]*(")/, '$1noindex, follow$2'),
);

console.log(`Prerendered ${Object.keys(staticRoutes).length + publications.length} pages into dist/ (${SITE_URL}).`);
