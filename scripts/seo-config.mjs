// Shared by the sitemap generator, the prerender step and the IndexNow submission.
import fs from 'fs';
import path from 'path';

export const SITE_URL = 'https://www.nafees.info';
export const INDEXNOW_KEY = 'ec04a5577a2192c2f751b9f39488bdba';

const read = (file) => JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file), 'utf8'));

export const staticRoutes = read('src/seo/routes.json');
export const publications = read('src/data/publications/publications.json').records;
export const publicationPath = (pub) => `/publications/paper/${pub.slug}`;

// Every indexable path on the site, home page first.
export const allPaths = [...Object.keys(staticRoutes), ...publications.map(publicationPath)];
export const absoluteUrl = (route) => SITE_URL + (route === '/' ? '/' : route);
