import { Outlet, Link } from 'react-router-dom';

import { LayoutDashboard, Tv, UploadCloud } from 'lucide-react';

export const Layout = () => {
  return (
    <div className="app-container">
      <nav className="sidebar">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tv className="text-indigo-400" /> Peblo TV CMS
          </h2>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/" className="btn btn-secondary" style={{ justifyContent: 'flex-start', border: 'none' }}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/shows" className="btn btn-secondary" style={{ justifyContent: 'flex-start', border: 'none' }}>
            <Tv size={18} /> Shows & Content
          </Link>
          <Link to="/publish" className="btn btn-secondary" style={{ justifyContent: 'flex-start', border: 'none' }}>
            <UploadCloud size={18} /> Publish Catalogue
          </Link>
        </div>

      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
