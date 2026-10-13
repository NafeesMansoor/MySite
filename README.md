# Nafees Mansoor — Personal Academic Website

Source code for the personal academic website of Dr. Nafees Mansoor
(<https://www.nafees.info>): profile, publications, funded projects, awards,
and professional services.

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite 6](https://vite.dev) (static single-page application, no backend)
- [Tailwind CSS 4](https://tailwindcss.com)
- [React Router 7](https://reactrouter.com) for client-side routing
- Chart.js / D3 for the analytics dashboard and word cloud

## Getting started

**Prerequisite:** Node.js 20 or newer.

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:3000
```

## Scripts

| Command           | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `npm run dev`     | Start the local development server                             |
| `npm run build`   | Validate data, regenerate SEO files, build to `dist/`, and prerender every page |
| `npm run preview` | Serve the production build locally                             |
| `npm run lint`    | Type-check the project (`tsc --noEmit`)                        |
| `npm test`        | Run the StateTrace simulator tests (Node's built-in test runner) |
| `npm run clean`   | Remove `dist/`                                                 |
| `npm run pubs:import` | Rebuild publication data from the curated list and the Scopus export |
| `npm run pubs:validate` | Validate publication data (also runs as part of `build`)     |
| `npm run pubs:check-links` | Check that every published DOI resolves (needs network)   |
| `npm run seo:submit` | After a deployment, submit all page URLs to IndexNow (Bing, Yandex and others) |

## Project structure

```
docs/               Generated publication match report
public/             Static files (sitemap.xml, robots.txt, _redirects)
  tools/            Standalone tools embedded by pages (StateTrace, the DFA & NFA simulator)
resource/           Source workbooks (Scopus export)
scripts/            Build-time scripts (SEO files, publication import and validation)
tests/              Automated tests (FSM simulator)
src/
  components/       Shared layout and UI components
  pages/            Route pages (About, Projects, Services, Publications, Awards)
  data/             Citation counts and publication data (see below)
  constants.ts      Site content (education, awards, grants, services, …)
  types.ts          Shared TypeScript types
```

## Publication data

Publications live in `src/data/publications/`:

| File                 | Role                                                                    |
| -------------------- | ----------------------------------------------------------------------- |
| `curated.json`       | Hand-maintained list (title, authors, venue, year, type, indexing). Edit this file to add or correct a publication. |
| `import-config.json` | Path of the Scopus workbook, manual match decisions, and DOIs to withhold. |
| `wos.json`           | Web of Science profile metrics and records, transcribed from the researcher CV PDF in `resource/`. Update by hand when a new CV is exported. |
| `publications.json`  | **Generated** — the merged data the website reads. Do not edit by hand. |

`npm run pubs:import` merges `curated.json` with the Scopus export in
`resource/`. Curated fields are never overwritten; the workbook only adds
metadata (abstract, keywords, DOI, Scopus link, citation count, and so on).
Records are matched by DOI when the curated record has one, otherwise by
normalized title; anything uncertain is listed in
`docs/publication-match-report.md` instead of being guessed. Scopus rows that
are not on the curated list are added as separate records
(`"origin": "scopus"`).

To refresh from a new Scopus export:

1. Save the export in `resource/` and update `workbook` and
   `scopusExportLabel` in `import-config.json`.
2. Run `npm run pubs:import`.
3. Read `docs/publication-match-report.md`. Resolve entries under
   "Needs review" by adding `"<id>": "<EID>"` (or `null`) to `matches`,
   then re-run the import.
4. Run `npm run pubs:check-links`, then `npm run build`.

To give a curated record an exact match, add its `doi` to `curated.json`.

## Search engine optimisation

- Every publication has its own page at `/publications/paper/<slug>` with the abstract, keywords,
  `ScholarlyArticle` structured data and the `citation_*` tags read by Google Scholar.
- `scripts/prerender.mjs` runs at the end of the build and writes a static HTML file for each page
  (title, description, canonical URL, structured data and readable content), so crawlers and link
  previews do not depend on JavaScript. Titles and descriptions of the section pages live in
  `src/seo/routes.json`.
- `public/sitemap.xml` and `public/robots.txt` are regenerated on every build and list each page
  once, on the primary domain `https://www.nafees.info`.
- `index.html` carries site-wide `Person` and `WebSite` structured data and the social sharing tags.

## Deployment

The site is hosted on GitHub Pages. Every push to `main` runs
`.github/workflows/deploy.yml`, which builds the site and publishes `dist/`. In
the repository settings, Pages must have its source set to "GitHub Actions" and
its custom domain set to `www.nafees.info`.

`npm run build` outputs a static site to `dist/`, which can be served by any
static host. Every page is prerendered to its own HTML file, and `dist/404.html`
is served with a 404 status for any other address. Moved pages are listed in
`src/seo/redirects.json`; add an entry there whenever a page's address changes.
The build writes a small forwarding page for each entry (GitHub Pages cannot send
a 301) and also `public/_redirects`, which Netlify and Cloudflare Pages read.

## Development workflow

1. Create a branch from `main`.
2. Make focused changes; run `npm run lint` and `npm run build`.
3. Review the diff, commit with a descriptive message, and push.
4. Merge into `main` once the change has been verified.
