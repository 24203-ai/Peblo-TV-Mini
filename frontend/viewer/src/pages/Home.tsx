import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Info } from 'lucide-react';
import { LazyImage } from '../components/LazyImage';

// Viewer strictly consumes the public static JSON (or search API), NEVER the admin endpoints.
const fetchCatalogue = async () => {
  const res = await axios.get('http://localhost:8000/assets/catalogue.json');
  return typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
};

export const Home = () => {
  const { data: catalogue, isLoading, error } = useQuery({
    queryKey: ['catalogue'],
    queryFn: fetchCatalogue,
    retry: false
  });

  if (isLoading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading content...</div>;
  
  if (error) {
    return (
      <div className="glass-card" style={{ maxWidth: '600px', margin: '4rem auto', padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Catalogue Not Published</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          The streaming catalogue has not been published yet. Please ask an administrator to resolve any blocking validation issues and publish the content.
        </p>
      </div>
    );
  }

  // Find a featured show for the hero
  const featuredShows = catalogue['featured'] || [];
  const heroShow = featuredShows.length > 0 ? featuredShows[0] : null;

  return (
    <div className="animate-fade-in">
      {/* Featured Hero using Banner artwork */}
      {heroShow && (
        <div style={{ position: 'relative', height: '60vh', minHeight: '400px', marginBottom: '3rem', borderRadius: '12px', overflow: 'hidden' }}>
          <LazyImage 
            src={heroShow.artwork?.banner || heroShow.artwork?.poster || heroShow.artwork?.thumbnail || ''} 
            alt={heroShow.title} 
            fallbackText="No Banner Available"
          />
          <div style={{ 
            position: 'absolute', 
            bottom: 0, left: 0, right: 0, 
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', 
            padding: '4rem 2rem 2rem 2rem' 
          }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{heroShow.title}</h1>
            <p style={{ maxWidth: '600px', fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              {heroShow.synopsis}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to={`/show/${heroShow.id}`} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>
                <Play fill="currentColor" size={20} /> Play Now
              </Link>
              <Link to={`/show/${heroShow.id}`} className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>
                <Info size={20} /> More Info
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal rows grouped by section using Poster artwork */}
      {Object.entries(catalogue).map(([section, shows]: [string, any]) => {
        if (section === 'featured' && shows.length <= 1) return null; // Already hero
        
        return (
          <div key={section} style={{ marginBottom: '3rem' }}>
            <h2 style={{ textTransform: 'capitalize', marginBottom: '1rem', paddingLeft: '0.5rem', borderLeft: '4px solid var(--accent-color)' }}>
              {section}
            </h2>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              overflowX: 'auto', 
              padding: '0.5rem',
              scrollbarWidth: 'none'
            }}>
              {shows.map((show: any) => {
                // Skip the hero show if it's in the featured list so we don't duplicate it immediately below
                if (heroShow && show.id === heroShow.id) return null;

                return (
                  <Link 
                    key={show.id} 
                    to={`/show/${show.id}`} 
                    className="show-card" 
                    style={{ 
                      flex: '0 0 auto', 
                      width: '200px', 
                      textDecoration: 'none', 
                      color: 'inherit',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <div style={{ width: '200px', height: '300px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                      <LazyImage 
                        src={show.artwork?.poster || show.artwork?.thumbnail || show.artwork?.banner || ''} 
                        alt={show.title}
                        fallbackText={show.title}
                      />
                    </div>
                    <h3 style={{ fontSize: '1rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {show.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
