import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Candidates from './pages/Candidates';
import Shortlist from './pages/Shortlist';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/shortlist" element={<Shortlist />} />
      </Routes>
    </Router>
  );
}

export default App;
