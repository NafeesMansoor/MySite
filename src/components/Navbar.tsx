import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/' },
  { 
    id: 'about', 
    label: 'About', 
    children: [
      { label: 'Academic Degrees', path: '/about/degrees' },
      { label: 'Research Interests', path: '/about/interests' },
    ]
  },
  { 
    id: 'projects', 
    label: 'Projects & Awards', 
    children: [
      { label: 'Funded Projects', path: '/projects/funded' },
      { label: 'Awards & Recognition', path: '/projects/awards' },
    ]
  },
  { 
    id: 'services', 
    label: 'Engagement & Services', 
    children: [
      { label: 'Professional & Administrative Services', path: '/services/professional' },
      { label: 'Quality Assurance Activities', path: '/services/qa' },
      { label: 'Service to the Community', path: '/services/community' },
    ]
  },
  { 
    id: 'publications', 
    label: 'Publications', 
    children: [
      { label: 'All Publications', path: '/publications' },
      { label: 'Journals', path: '/publications/journals' },
      { label: 'Proceedings', path: '/publications/proceedings' },
      { label: 'Book Chapters', path: '/publications/book-chapters' },
      { label: 'Patent', path: '/publications/patent' },
    ]
  },
  { 
    id: 'gnu', 
    label: 'GNU Projects', 
    children: [
      { label: 'FSM Designer', path: '/gnu-projects/fsm-designer' },
    ]
  },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tighter text-white">NM.</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {NAV_ITEMS.map((item) => (
              <div 
                key={item.id} 
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.children ? (
                  <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    <span>{item.label}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                ) : (
                  <Link 
                    to={item.path!} 
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      location.pathname === item.path ? 'text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}

                {item.children && (
                  <AnimatePresence>
                    {activeDropdown === item.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 mt-0 w-64 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden"
                      >
                        <div className="py-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`block px-4 py-2 text-sm transition-colors ${
                                location.pathname === child.path ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-900 border-b border-white/10 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <div key={item.id}>
                  {item.children ? (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {item.label}
                      </div>
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block px-3 py-2 rounded-md text-base font-medium ${
                            location.pathname === child.path ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </>
                  ) : (
                    <Link
                      to={item.path!}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        location.pathname === item.path ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
