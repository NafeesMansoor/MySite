import { useEffect } from 'react';
import routes from './routes.json';
import { setMeta } from './site';

export type Route = keyof typeof routes;
export const pageMeta = (route: Route): { title: string; description: string; keywords?: string[] } => routes[route];

// Title, description and keywords for a section page come from routes.json, the same source the
// prerender step uses, so the static HTML and the running app always agree.
export const usePageMeta = (route: Route) => {
  useEffect(() => {
    const page = pageMeta(route);
    document.title = page.title;
    setMeta('name', 'description', page.description);
    setMeta('name', 'keywords', page.keywords?.join(', ') ?? null);
  }, [route]);
};
