import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Degrees from './pages/About/Degrees';
import Interests from './pages/About/Interests';
import Mentions from './pages/About/Mentions';
import Funded from './pages/Projects/Funded';
import ResearchAwards from './pages/Projects/Awards';
import Professional from './pages/Services/Professional';
import QA from './pages/Services/QA';
import Community from './pages/Services/Community';
import Journals from './pages/Publications/Journals';
import Proceedings from './pages/Publications/Proceedings';
import BookChapters from './pages/Publications/BookChapters';
import Patents from './pages/Publications/Patents';
import Awards from './pages/Awards/Awards';
import Contact from './pages/Contact';

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
          <Route path="/projects/awards" element={<ResearchAwards />} />
          <Route path="/services/professional" element={<Professional />} />
          <Route path="/services/qa" element={<QA />} />
          <Route path="/services/community" element={<Community />} />
          <Route path="/publications/journals" element={<Journals />} />
          <Route path="/publications/proceedings" element={<Proceedings />} />
          <Route path="/publications/book-chapters" element={<BookChapters />} />
          <Route path="/publications/patent" element={<Patents />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}
