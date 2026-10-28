import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Linkedin } from 'lucide-react';
import { BRAND_ICON_PATHS } from './brandIcons';
import { WEB_OF_SCIENCE_PROFILE_URL } from '../seo/site';

interface Profile {
  name: string;
  href: string;
  mark: ReactNode;
}

const brandMark = (path: string) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0">
    <path d={path} />
  </svg>
);

const PROFILES: Profile[] = [
  { name: 'ORCID', href: 'https://orcid.org/0000-0002-3408-237X', mark: brandMark(BRAND_ICON_PATHS.orcid) },
  { name: 'Google Scholar', href: 'https://scholar.google.com/citations?user=5dt40PYAAAAJ&hl=en&oi=ao', mark: brandMark(BRAND_ICON_PATHS.googleScholar) },
  { name: 'ResearchGate', href: 'https://www.researchgate.net/profile/Nafees_Mansoor', mark: brandMark(BRAND_ICON_PATHS.researchgate) },
  { name: 'Web of Science', href: WEB_OF_SCIENCE_PROFILE_URL, mark: brandMark(BRAND_ICON_PATHS.clarivate) },
  { name: 'GitHub', href: 'https://github.com/NafeesMansoor', mark: brandMark(BRAND_ICON_PATHS.github) },
  {
    name: 'ULAB',
    href: 'https://cse.ulab.edu.bd/faculty/nafees-mansoor-phd',
    mark: <span className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter leading-none" aria-hidden="true">ULAB</span>,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/nafeesmansoor/',
    mark: <Linkedin className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0" aria-hidden="true" />,
  },
];

const VISIBLE = 4;
const INTERVAL_MS = 3500;

function ProfileLink({ profile }: { profile: Profile }) {
  return (
    <a
      href={profile.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${profile.name} profile`}
      className="flex items-center justify-center gap-2 sm:gap-3 w-full h-full min-w-0 rounded-2xl focus-visible:ring-2 focus-visible:ring-indigo-400/70 text-white/70 hover:text-white focus-visible:text-white focus-visible:outline-none transition-colors"
    >
      {profile.mark}
      {profile.name !== 'ULAB' && (
        <span className="text-sm sm:text-lg md:text-xl font-semibold tracking-tight whitespace-nowrap">{profile.name}</span>
      )}
    </a>
  );
}

// A row of large profile marks that rotates through all profiles, a few at a time.
export default function ProfileWall() {
  const reducedMotion = useReducedMotion();
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reducedMotion || paused) return;
    const timer = setInterval(() => setOffset((current) => (current + VISIBLE) % PROFILES.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [reducedMotion, paused]);

  // Without motion, show every profile at once instead of rotating.
  if (reducedMotion) {
    return (
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-2">
        {PROFILES.map((profile) => (
          <li key={profile.name} className="h-24">
            <ProfileLink profile={profile} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-2" aria-label="Academic and professional profiles">
        {Array.from({ length: VISIBLE }, (_, slot) => {
          const profile = PROFILES[(offset + slot) % PROFILES.length];
          return (
            <li key={slot} className="relative h-24 overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.div
                  key={profile.name}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.7, delay: slot * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <ProfileLink profile={profile} />
                </motion.div>
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      {/* Every profile stays reachable while only some are on screen. */}
      <ul className="sr-only">
        {PROFILES.map((profile) => (
          <li key={profile.name}>
            <a href={profile.href} target="_blank" rel="noopener noreferrer">{profile.name} profile</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
