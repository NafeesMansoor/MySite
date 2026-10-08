import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Degrees from './pages/About/Degrees';
import Interests from './pages/About/Interests';
import Mentions from './pages/About/Mentions';
import Funded from './pages/Projects/Funded';
import Awards from './pages/Projects/Awards';
import Professional from './pages/Services/Professional';
import QA from './pages/Services/QA';
import Community from './pages/Services/Community';
import AllPublications from './pages/Publications/AllPublications';
import Journals from './pages/Publications/Journals';
import Proceedings from './pages/Publications/Proceedings';
import BookChapters from './pages/Publications/BookChapters';
import Patents from './pages/Publications/Patents';
import FsmDesigner from './pages/Gnu/FsmDesigner';

export default function App() {
  return (
    <Router>
      <Layout>
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
          <Route path="/awards" element={<Navigate to="/projects/awards" replace />} />
          <Route path="/gnu-projects/fsm-designer" element={<FsmDesigner />} />
        </Routes>
      </Layout>
    </Router>
  );
}
