import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { SITE_URL, WEB_OF_SCIENCE_PROFILE_URL, setMeta } from '../seo/site';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  // Canonical URL always points at the primary domain, whichever host served the page.
  useEffect(() => {
    const url = SITE_URL + (location.pathname === '/' ? '/' : location.pathname.replace(/\/$/, ''));
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
    setMeta('property', 'og:url', url);
  }, [location.pathname]);

  // Pages set the title and description; mirror them into the social sharing tags.
  useEffect(() => {
    const sync = () => {
      setMeta('property', 'og:title', document.title);
      setMeta('name', 'twitter:title', document.title);
      const description = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content;
      if (description) {
        setMeta('property', 'og:description', description);
        setMeta('name', 'twitter:description', description);
      }
    };
    sync();
    const observer = new MutationObserver(sync);
    const title = document.head.querySelector('title');
    const description = document.head.querySelector('meta[name="description"]');
    if (title) observer.observe(title, { childList: true, characterData: true, subtree: true });
    if (description) observer.observe(description, { attributes: true, attributeFilter: ['content'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20 selection:text-white">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <footer className="py-12 border-t border-white/10 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Nafees Mansoor. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4">
              <a 
                href="https://orcid.org/0000-0002-3408-237X" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-xs text-gray-400 hover:text-white transition-all flex items-center space-x-2"
              >
                <span>ORCID</span>
              </a>
              <a 
                href="https://www.researchgate.net/profile/Nafees_Mansoor" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-xs text-gray-400 hover:text-white transition-all flex items-center space-x-2"
              >
                <span>ResearchGate</span>
              </a>
              <a 
                href={WEB_OF_SCIENCE_PROFILE_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-xs text-gray-400 hover:text-white transition-all flex items-center space-x-2"
              >
                <span>Web of Science</span>
              </a>
              <a 
                href="https://scholar.google.com/citations?user=5dt40PYAAAAJ&hl=en&oi=ao" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-xs text-gray-400 hover:text-white transition-all flex items-center space-x-2"
              >
                <span>Google Scholar</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
