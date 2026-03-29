import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

const routes = [
  '/',
  '/about/degrees',
  '/about/interests',
  '/about/mentions',
  '/projects/funded',
  '/projects/awards',
  '/services/professional',
  '/services/qa',
  '/services/community',
  '/publications/journals',
  '/publications/proceedings',
  '/publications/book-chapters',
  '/publications/patent',
  '/awards'
];

const generateUrlEntries = (baseUrl, priority) => {
  return routes.map(route => `
  <url>
    <loc>${baseUrl}${route === '/' ? '' : route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');
};

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${generateUrlEntries('https://www.nafees.info', '1.0')}
${generateUrlEntries('https://nafees.mansoor.info', '0.9')}
</urlset>`;

const robots = `User-agent: *
Allow: /

Sitemap: https://www.nafees.info/sitemap.xml
Sitemap: https://nafees.mansoor.info/sitemap.xml`;

const redirects = `/*    /index.html   200`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robots);
fs.writeFileSync(path.join(PUBLIC_DIR, '_redirects'), redirects);

console.log('SEO and redirect files generated successfully in /public');
