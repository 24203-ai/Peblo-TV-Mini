import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { ShowDetail } from './pages/ShowDetail';
import { PlayCircle, Search as SearchIcon } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/" className="brand">
          <PlayCircle color="var(--accent)" /> Peblo
        </Link>
        <div style={{ display: 'flex', gap: '1rem', fontWeight: 600 }}>
          <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Home</Link>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Series</Link>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Movies</Link>
          <Link to="/search" style={{ color: 'white', textDecoration: 'none' }}><SearchIcon size={20} /></Link>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/show/:id" element={<ShowDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
