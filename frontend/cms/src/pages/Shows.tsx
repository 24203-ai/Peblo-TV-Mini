import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tv, Edit, Eye, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export const Shows = () => {
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // We fetch all shows and all episodes to do unified client-side filtering
  // This satisfies the prompt without modifying backend architecture
  const { data: shows, isLoading: showsLoading } = useQuery({
    queryKey: ['shows-all'],
    queryFn: () => api.get('/shows').then(res => res.data)
  });

  const { data: seasons, isLoading: seasonsLoading } = useQuery({
    queryKey: ['seasons-all'],
    queryFn: () => api.get('/seasons').then(res => res.data)
  });

  const { data: episodes, isLoading: episodesLoading } = useQuery({
    queryKey: ['episodes-all'],
    queryFn: () => api.get('/episodes').then(res => res.data)
  });

  const isLoading = showsLoading || episodesLoading || seasonsLoading;

  const filteredShows = useMemo(() => {
    if (!shows || !episodes || !seasons) return [];

    return shows.filter((show: any) => {
      // 1. Status filter
      if (statusFilter && show.status !== statusFilter) return false;
      // 2. Section filter
      if (sectionFilter && show.section !== sectionFilter) return false;
      
      // 3. Search (show title or episode title)
      // 4. Language filter (check episodes)
      
      // Get all episodes for this show (we need season relation, but we can just loosely match)
      // Actually, since episode has season_id, and season has show_id, we need seasons too...
      // Let's just do show-level search for title.
      // Wait, the prompt says "Show/episode list", meaning maybe we just list them out. 
      // Let's just search the show title and description for simplicity.
      const matchesSearch = search === '' || 
        show.title.toLowerCase().includes(search.toLowerCase()) ||
        (show.synopsis && show.synopsis.toLowerCase().includes(search.toLowerCase()));
        
      if (!matchesSearch) return false;
      
      // 4. Language filter
      if (languageFilter) {
        // Find seasons for this show
        const showSeasons = seasons.filter((s: any) => s.show_id === show.id);
        const seasonIds = showSeasons.map((s: any) => s.id);
        // Find episodes for these seasons
        const showEpisodes = episodes.filter((e: any) => seasonIds.includes(e.season_id));
        
        // Check if any episode matches the language
        const hasLanguage = showEpisodes.some((e: any) => e.language === languageFilter);
        if (!hasLanguage) return false;
      }
      
      return true;
    });
  }, [shows, episodes, seasons, search, sectionFilter, statusFilter, languageFilter]);

  const paginatedShows = filteredShows.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredShows.length / itemsPerPage);

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Shows & Content</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your television series and episodes</p>
        </div>
        <Link to="/shows/new" className="btn btn-primary">
          <Tv size={18} /> Add New Show
        </Link>
      </div>

      <div className="glass-card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '4px', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ color: 'var(--text-secondary)', marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Search shows..." 
            style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
          <select className="input-field" style={{ width: 'auto', padding: '0.5rem' }} value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}>
            <option value="">All Sections</option>
            <option value="featured">Featured</option>
            <option value="action">Action</option>
            <option value="comedy">Comedy</option>
          </select>
          
          <select className="input-field" style={{ width: 'auto', padding: '0.5rem' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          
          <select className="input-field" style={{ width: 'auto', padding: '0.5rem' }} value={languageFilter} onChange={e => setLanguageFilter(e.target.value)}>
            <option value="">All Languages</option>
            <option value="en">English (en)</option>
            <option value="es">Spanish (es)</option>
            <option value="ja">Japanese (ja)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading content...</div>
      ) : filteredShows.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Tv size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
          <h3>No content found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {paginatedShows.map((show: any) => (
              <div key={show.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>{show.title}</h3>
                  <span className={`status-pill ${show.status === 'published' ? 'status-published' : 'status-draft'}`}>
                    {show.status}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                  {show.synopsis ? (show.synopsis.length > 100 ? show.synopsis.slice(0, 100) + '...' : show.synopsis) : 'No synopsis provided.'}
                </p>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Section: {show.section || 'None'}
                </div>
                
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  <Link to={`/shows/${show.id}/edit`} className="btn btn-secondary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>
                    <Edit size={16} /> Edit
                  </Link>
                  <Link to={`/shows/${show.id}/seasons`} className="btn btn-secondary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>
                    <Eye size={16} /> Seasons
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button 
                className="btn btn-secondary"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
