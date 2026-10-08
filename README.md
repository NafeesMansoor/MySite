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
| `npm run build`   | Regenerate SEO files and create the production build in `dist/` |
| `npm run preview` | Serve the production build locally                             |
| `npm run lint`    | Type-check the project (`tsc --noEmit`)                        |
| `npm run clean`   | Remove `dist/`                                                 |

## Project structure

```
public/             Static files (sitemap.xml, robots.txt, _redirects)
scripts/            Build-time scripts (SEO file generation)
src/
  components/       Shared layout and UI components
  pages/            Route pages (About, Projects, Services, Publications, Awards)
  data/             Publication and citation data
  constants.ts      Site content (education, awards, grants, services, …)
  types.ts          Shared TypeScript types
```

## Deployment

`npm run build` outputs a static site to `dist/`, which can be served by any
static host. `public/_redirects` rewrites all paths to `index.html` so that
client-side routes resolve on hosts that support that file.

## Development workflow

1. Create a branch from `main`.
2. Make focused changes; run `npm run lint` and `npm run build`.
3. Review the diff, commit with a descriptive message, and push.
4. Merge into `main` once the change has been verified.
