import { Fragment, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import Layout from './components/Layout';
import redirects from './seo/redirects.json';

// Each page is its own chunk so visitors download only what the current page needs.
const Home = lazy(() => import('./pages/Home'));
const Degrees = lazy(() => import('./pages/About/Degrees'));
const Interests = lazy(() => import('./pages/About/Interests'));
const Mentions = lazy(() => import('./pages/About/Mentions'));
const Funded = lazy(() => import('./pages/Projects/Funded'));
const Awards = lazy(() => import('./pages/Projects/Awards'));
const Professional = lazy(() => import('./pages/Services/Professional'));
const QA = lazy(() => import('./pages/Services/QA'));
const Community = lazy(() => import('./pages/Services/Community'));
const AllPublications = lazy(() => import('./pages/Publications/AllPublications'));
const Journals = lazy(() => import('./pages/Publications/Journals'));
const Proceedings = lazy(() => import('./pages/Publications/Proceedings'));
const BookChapters = lazy(() => import('./pages/Publications/BookChapters'));
const Patents = lazy(() => import('./pages/Publications/Patents'));
const PublicationDetail = lazy(() => import('./pages/Publications/PublicationDetail'));
const FsmDesigner = lazy(() => import('./pages/Gnu/FsmDesigner'));
const StateTracePage = lazy(() => import('./pages/Gnu/StateTracePage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// The host serves "/about/degrees.html" and "/index.html" with the right prerendered page; move the
// app to the clean address instead of showing "Page not found", which search engines saw as a soft 404.
function CatchAll() {
  const { pathname, search, hash } = useLocation();
  const route = pathname.replace(/(\/index)?\.html$/, '') || '/';
  return route === pathname ? <NotFound /> : <Navigate to={route + search + hash} replace />;
}

export default function App() {
  return (
    // Visitors who ask for reduced motion get content at once, without entrance animations.
    <MotionConfig reducedMotion="user">
      <Router>
        <Layout>
          <Suspense fallback={<div className="min-h-screen" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about/degrees" element={<Degrees />} />
              <Route path="/about/interests" element={<Interests />} />
              <Route path="/about/mentions" element={<Mentions />} />
              <Route path="/projects/funded" element={<Funded />} />
              <Route path="/projects/awards" element={<Awards />} />
              <Route path="/services/professional" element={<Professional />} />
              <Route path="/services/qa" element={<QA />} />
              <Route path="/services/community" element={<Community />} />
              <Route path="/publications" element={<AllPublications />} />
              <Route path="/publications/journals" element={<Journals />} />
              <Route path="/publications/proceedings" element={<Proceedings />} />
              <Route path="/publications/book-chapters" element={<BookChapters />} />
              <Route path="/publications/patent" element={<Patents />} />
              <Route path="/publications/paper/:slug" element={<PublicationDetail />} />
              {/* React Router ignores a trailing slash, so "/publications/" -> "/publications" would also match
                  "/publications" and loop forever; the host's forwarding page handles those addresses instead. */}
              {Object.entries(redirects)
                .filter(([from, to]) => from.replace(/\/+$/, '') !== to)
                .map(([from, to]) => (
                  <Fragment key={from}>
                    <Route path={from} element={<Navigate to={to} replace />} />
                  </Fragment>
                ))}
              <Route path="/gnu-projects/fsm-designer" element={<FsmDesigner />} />
              <Route
                path="/gnu-projects/statetrace"
                element={<StateTracePage key="statetrace" name="StateTrace" route="/gnu-projects/statetrace" workspaceUrl="/tools/statetrace/index.html" />}
              />
              <Route
                path="/gnu-projects/statetrace2"
                element={<StateTracePage key="statetrace2" name="StateTrace2" route="/gnu-projects/statetrace2" workspaceUrl="/tools/statetrace2/index.html" />}
              />
              <Route path="*" element={<CatchAll />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </MotionConfig>
  );
}
