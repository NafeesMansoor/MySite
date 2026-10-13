import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

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
const StateTrace = lazy(() => import('./pages/Gnu/StateTrace'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
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
            <Route path="/awards" element={<Navigate to="/projects/awards" replace />} />
            <Route path="/gnu-projects/fsm-designer" element={<FsmDesigner />} />
            <Route path="/gnu-projects/statetrace" element={<StateTrace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}
