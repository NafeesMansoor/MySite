import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setMeta } from '../seo/site';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found | Nafees Mansoor';
    // Unknown addresses are served the app shell with a 200 status; keep them out of search results.
    setMeta('name', 'robots', 'noindex');
    return () => setMeta('name', 'robots', 'index, follow');
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-6">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Page not found</h1>
      <p className="text-gray-500 max-w-2xl">The page you are looking for does not exist or has moved.</p>
      <div className="flex flex-wrap gap-4">
        <Link to="/" className="px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-full border border-indigo-500/30 text-sm font-medium text-indigo-200 hover:text-white transition-all">
          Home
        </Link>
        <Link to="/publications" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-sm font-medium text-gray-300 hover:text-white transition-all">
          Publications
        </Link>
      </div>
    </div>
  );
}
