# nafees.info: speed and SEO fixes (MySite repo)

Apply these on a branch, run `npm run build`, check the site locally with `npm run preview`, then merge.
Every file path below is relative to the repo root.

---

## 1. Replace the heavy home-page background (biggest speed win)

**Why:** Lighthouse measured about 33 s of main-thread work on the home page, coming from `InteractiveBackground` in `src/pages/Home.tsx`.

1. Add the new file **`src/components/InteractiveBackground.tsx`** (attached separately).
2. In **`src/pages/Home.tsx`**:
   - Delete the whole `const InteractiveBackground = () => { ... };` block. It starts around line 40, right after the `STATS` array, and ends at the `};` after the animated SVG `<motion.path>` lines.
   - Add this import near the top:
     ```tsx
     import InteractiveBackground from '../components/InteractiveBackground';
     ```
   - If `useMotionValue`, `useSpring` or `useState` are no longer used anywhere else in `Home.tsx`, remove them from the imports (TypeScript or the linter will flag them).
3. Append this to **`src/index.css`**:
   ```css
   @keyframes bg-particle-rise {
     from { transform: translateY(0);      opacity: 0.3; }
     to   { transform: translateY(-250px); opacity: 0;   }
   }
   .bg-particle {
     animation: bg-particle-rise linear infinite;
     will-change: transform, opacity;
   }
   @media (prefers-reduced-motion: reduce) {
     .bg-particle { animation: none; }
     *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
   }
   ```

## 2. Load the analytics chart only when needed

In **`src/pages/Home.tsx`**, replace
```tsx
import AnalyticsDashboard from '../components/AnalyticsDashboard';
```
with
```tsx
import { lazy, Suspense } from 'react';
const AnalyticsDashboard = lazy(() => import('../components/AnalyticsDashboard'));
```
and wrap where it is rendered:
```tsx
<Suspense fallback={<div className="h-[400px]" />}>
  <AnalyticsDashboard />
</Suspense>
```
(Keep the same props, if any. The fixed-height fallback stops the page from jumping while the chart loads.)

## 3. Stop Google Fonts from blocking the first render (~750 ms on mobile)

Find where the font is loaded. It is probably an `@import url('https://fonts.googleapis.com/css2?...')` at the top of `src/index.css`.

- **Best:** self-host the font. Example for Inter (use your actual family):
  ```bash
  npm i @fontsource-variable/inter
  ```
  then in `src/main.tsx` add `import '@fontsource-variable/inter';` and delete the Google Fonts `@import`.
- **Quick alternative:** move the font into `index.html` as a non-blocking stylesheet (the `preconnect` lines are already there):
  ```html
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=YOUR_FONT&display=swap" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=YOUR_FONT&display=swap" media="print" onload="this.media='all'" />
  ```
  and delete the `@import` from `index.css`. Make sure the URL contains `display=swap`.

## 4. Soft 404s: unknown URLs currently return 200 with the home page title

In **`src/pages/NotFound.tsx`**, tell search engines not to index the page. Using whatever head or meta helper your other pages use, add:
```tsx
<meta name="robots" content="noindex, follow" />
```
and a title such as `Page not found | Nafees Mansoor`.

If there is no helper, add this inside the component:
```tsx
useEffect(() => {
  document.title = 'Page not found | Nafees Mansoor';
  const m = document.createElement('meta');
  m.name = 'robots';
  m.content = 'noindex, follow';
  document.head.appendChild(m);
  return () => { m.remove(); };
}, []);
```

Server side: also make the host return HTTP 404 for unknown paths (the site is served from `nafees.mansoor.info`). If `scripts/prerender.mjs` writes a `404.html`, configure the host to serve it with status 404 instead of falling back to `index.html` with status 200.

## 5. Duplicate titles and descriptions (publication data, `src/data/publications/*.json`)

Search the data files for these titles and add a suffix to the conference version, e.g. ` (Conference Version)`:

| Slug | Change |
|---|---|
| `a-robust-routing-protocol-in-cognitive-unmanned-aerial-vehicular-networks-conference` | title + " (Conference Version)" |
| `classification-of-bangla-compound-characters-using-a-hog-cnn-hybrid-model-conference` | title + " (Conference Version)" |

These two pages share the same description (the abstract starts "With the rapid development of wireless t…"). Give one of them its correct abstract:
- `a-novel-node-joining-algorithm-for-spectrum-aware-cluster-based-cognitive-radio`
- `a-stable-cluster-based-architecture-for-cognitive-radio-ad-hoc-networks`

## 6. Garbled paper title / URL

The slug `a-portoble-insuloled-contoiner-for-sloring-ond-tronsporting-voccines` comes from a garbled title (letters swapped during PDF/OCR import). In the publication data, correct the title to:

> A Portable Insulated Container for Storing and Transporting Vaccines

Rebuild so the new slug is generated, then add a permanent redirect from the old URL. Add this line to **`public/_redirects`** (Netlify/Cloudflare Pages syntax; adjust if your host differs):
```
/publications/paper/a-portoble-insuloled-contoiner-for-sloring-ond-tronsporting-voccines  /publications/paper/a-portable-insulated-container-for-storing-and-transporting-vaccines  301
```
(Check the generated slug in the new `sitemap.xml` and use that exact value.)

## 7. Social preview image (`og:image`)

Create a 1200×630 image (name, title, photo or logo) and save it as `public/og-image.png`. Then add to **`index.html`** `<head>`:
```html
<meta property="og:image" content="https://www.nafees.info/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:image" content="https://www.nafees.info/og-image.png" />
```
and change `twitter:card` from `summary` to `summary_large_image`.

If `scripts/prerender.mjs` or `src/seo/site.ts` writes per-page meta tags, add `og:image` there too, so every page keeps it.

## 8. Accessibility: buttons without names (Lighthouse)

In the **Recent Publications** list in `Home.tsx`, the icon-only button
```tsx
<button className="p-2 bg-white/5 rounded-full ...">
  <ExternalLink ... />
</button>
```
does nothing and has no label. Make it a real link:
```tsx
<a href={`/publications/paper/${pub.slug ?? pub.id}`} aria-label={`Open: ${pub.title}`}
   className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white" aria-hidden="true" />
</a>
```
(Use whatever field your data uses for the paper URL.) Also check the mobile menu button in `Navbar.tsx` for an `aria-label`, e.g. `aria-label="Open menu"`.

## 9. Fix in `index.html` (found while reviewing)

The JSON-LD `jobTitle` says "Head of Department, Computer Science & Engineering". Keep that line only if it is current; otherwise update it. Your profile elsewhere lists Director, Office of Faculty Research.

---

### After deploying
1. Re-run PageSpeed Insights (mobile). Targets: LCP ≤ 2.5 s, TBT under ~200 ms, CLS ≤ 0.1.
2. In Google Search Console: **Sitemaps**, resubmit `https://www.nafees.info/sitemap.xml`; then **URL Inspection**, run "Request indexing" on the home page.
3. Re-run your SEO audit tool.