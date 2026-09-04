import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { LazyImage } from '../components/LazyImage';

const searchCatalog = async (q: string, category: string, language: string) => {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (category) params.append('category', category);
  if (language) params.append('language', language);
  
  const res = await axios.get(`http://localhost:8000/catalog/search?${params.toString()}`);
  return res.data.results;
};

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const language = searchParams.get('language') || '';

  const [localQ, setLocalQ] = useState(q);

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['search', q, category, language],
    queryFn: () => searchCatalog(q, category, language),
    // Only search if at least one filter is active to avoid pulling everything by default, 
    // or we can just pull everything if no filters (backend supports it).
    enabled: true 
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQ !== q) {
        setSearchParams(prev => {
          if (localQ) prev.set('q', localQ);
          else prev.delete('q');
          return prev;
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localQ, q, setSearchParams]);

  const updateFilter = (key: string, value: string) => {
    setSearchParams(prev => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      return prev;
    });
  };

  if (error) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'rgb(255, 80, 80)' }}>
        Error performing search. The catalogue may not be published yet.
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Search</h1>
        
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '4px', flex: 1, minWidth: '200px' }}>
            <SearchIcon size={18} style={{ color: 'var(--text-secondary)', marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Search by title, episode, or category..." 
              style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
              value={localQ}
              onChange={e => setLocalQ(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
            
            <select 
              className="input-field" 
              style={{ width: 'auto', padding: '0.5rem' }} 
              value={category} 
              onChange={e => updateFilter('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="kids">Kids</option>
              <option value="educational">Educational</option>
              <option value="documentary">Documentary</option>
            </select>
            
            <select 
              className="input-field" 
              style={{ width: 'auto', padding: '0.5rem' }} 
              value={language} 
              onChange={e => updateFilter('language', e.target.value)}
            >
              <option value="">All Languages</option>
              <option value="en">English (en)</option>
              <option value="es">Spanish (es)</option>
              <option value="ja">Japanese (ja)</option>
              <option value="hi">Hindi (hi)</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Searching...</div>
      ) : results?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <SearchIcon size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
          <h3>No results found</h3>
          <p>Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {results?.map((show: any) => (
            <Link 
              key={show.id} 
              to={`/show/${show.id}`} 
              className="show-card" 
              style={{ 
                textDecoration: 'none', 
                color: 'inherit',
                transition: 'transform 0.2s',
              }}
            >
              <div style={{ width: '100%', aspectRatio: '2/3', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                <LazyImage 
                  src={show.artwork?.poster || show.artwork?.thumbnail || show.artwork?.banner || ''} 
                  alt={show.title}
                  fallbackText={show.title}
                />
              </div>
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {show.title}
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {show.episodes?.length || 0} matching episode{show.episodes?.length !== 1 ? 's' : ''}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
