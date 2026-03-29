import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  useEffect(() => {
    // Dynamic canonical tag
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = window.location.origin + location.pathname;
    
    // Remove existing canonical if any
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      document.head.removeChild(existingCanonical);
    }
    
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, [location]);

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
                href="https://scholar.google.com/citations?user=v_v_v_v_v_v_v" 
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
