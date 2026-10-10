import fs from 'fs';
import path from 'path';
import { SITE_URL, allPaths, absoluteUrl, redirects as movedPages, staticRoutes } from './seo-config.mjs';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

const today = new Date().toISOString().slice(0, 10);

// One entry per page on the primary domain; publication pages rank below the section pages.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
  .map(
    (route) => `  <url>
    <loc>${absoluteUrl(route)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${route === '/' ? '1.0' : route in staticRoutes ? '0.8' : '0.6'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

// Permanent redirects for moved pages. There is deliberately no catch-all rewrite: every page is
// prerendered, and unknown addresses get dist/404.html with a real 404 status.
const redirects = Object.entries(movedPages)
  .map(([from, to]) => `${from}  ${to}  301`)
  .join('\n') + '\n';

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robots);
fs.writeFileSync(path.join(PUBLIC_DIR, '_redirects'), redirects);

console.log(`SEO files generated in /public (${allPaths.length} URLs in sitemap)`);
