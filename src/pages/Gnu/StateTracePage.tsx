import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import routes from '../../seo/routes.json';
import { SITE_URL, setMeta, setPageJsonLd } from '../../seo/site';

// Frames a StateTrace workspace, a standalone tool under public/tools:
//   StateTrace   /tools/statetrace    downloaded at build time from github.com/NafeesMansoor/StateTrace
//   StateTrace2  /tools/statetrace2   the edition kept in this repository
interface StateTracePageProps {
  name: string;
  route: '/gnu-projects/statetrace' | '/gnu-projects/statetrace2';
  workspaceUrl: string;
}

const NAVBAR_HEIGHT = 64;
const TOOL_HEADER_HEIGHT = 56;
const DEFAULT_IMAGE = { url: `${SITE_URL}/og-image.png`, alt: 'Dr. Nafees Mansoor, Professor & Researcher' };

const setSocialImage = (url: string, alt: string) => {
  setMeta('property', 'og:image', url);
  setMeta('name', 'twitter:image', url);
  setMeta('property', 'og:image:alt', alt);
};

export default function StateTracePage({ name, route, workspaceUrl }: StateTracePageProps) {
  // Title, description and the text below the workspace are shared with the prerendered page.
  const PAGE = routes[route];
  const frame = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(TOOL_HEADER_HEIGHT + 680);

  useEffect(() => {
    document.title = PAGE.title;
    setMeta('name', 'description', PAGE.description);
    setMeta('name', 'keywords', 'keywords' in PAGE ? PAGE.keywords.join(', ') : null);
    setSocialImage(SITE_URL + PAGE.image, PAGE.imageAlt);
    setPageJsonLd(PAGE.jsonLd);
    return () => {
      setSocialImage(DEFAULT_IMAGE.url, DEFAULT_IMAGE.alt);
      setPageJsonLd(null);
    };
  }, [PAGE]);

  // The workspace is on the same origin, so the frame can follow its height (no inner scrollbar)
  // and the board can be told how much of the window it may fill.
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    let observer: ResizeObserver | undefined;

    const fit = () => {
      const page = element.contentDocument;
      if (!page?.body) return;
      const room = window.innerHeight - NAVBAR_HEIGHT - TOOL_HEADER_HEIGHT - 16;
      page.documentElement.style.setProperty('--workspace-h', `${Math.max(600, Math.min(room, 920))}px`);
      setFrameHeight(page.body.offsetHeight);
    };
    const connect = () => {
      const page = element.contentDocument;
      if (!page?.body) return;
      observer?.disconnect();
      observer = new ResizeObserver(() => setFrameHeight(page.body.offsetHeight));
      observer.observe(page.body);
      fit();
    };

    element.addEventListener('load', connect);
    window.addEventListener('resize', fit);
    if (element.contentDocument?.readyState === 'complete') connect();
    return () => {
      element.removeEventListener('load', connect);
      window.removeEventListener('resize', fit);
      observer?.disconnect();
    };
  }, []);

  return (
    <div className="bg-[#070b1a]">
      <div className="max-w-[1680px] mx-auto px-3 sm:px-6 pt-8 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 mb-5">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              <span className="block mb-2 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#a5ecff]">
                {name} <span className="text-[#94a2d0]">· Interactive DFA &amp; NFA Simulator</span>
              </span>{' '}
              Explore Finite-State Machines
            </h1>
            <p className="text-[#94a2d0] max-w-2xl">
              Build a DFA or NFA, enter an input string, and trace how the machine processes each symbol.
            </p>
          </div>
          <a
            href={workspaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#7a98ff]/30 bg-[#7a98ff]/10 hover:bg-[#7a98ff]/20 text-sm font-medium text-[#e8edff] transition-colors"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            Open full screen
          </a>
        </div>

        <div className="rounded-2xl overflow-hidden border border-[#7a98ff]/20 shadow-[0_24px_80px_rgba(2,5,18,0.6)]">
          <iframe
            ref={frame}
            src={workspaceUrl}
            title={`${name} workspace: state machine canvas and execution inspector`}
            className="w-full block bg-[#0c1330]"
            style={{ height: frameHeight }}
          />
        </div>

        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-3 mt-12">
          {PAGE.sections.slice(1).map((section) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#e8edff]">{section.heading}</h2>
              <p className="text-sm leading-relaxed text-[#94a2d0]">{section.text}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
