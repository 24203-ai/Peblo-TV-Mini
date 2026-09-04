import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Play, ArrowLeft } from 'lucide-react';
import { LazyImage } from '../components/LazyImage';

// Fetch catalogue and find our show
const fetchShowFromCatalogue = async (showId: string) => {
  const res = await axios.get('http://localhost:8000/assets/catalogue.json');
  const catalogue = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
  
  // Flatten catalogue to find show
  for (const section of Object.values(catalogue)) {
    const shows = section as any[];
    const show = shows.find(s => s.id === showId);
    if (show) return show;
  }
  throw new Error("Show not found in published catalogue");
};

export const ShowDetail = () => {
  const { id } = useParams();

  const { data: show, isLoading, error } = useQuery({
    queryKey: ['show-detail', id],
    queryFn: () => fetchShowFromCatalogue(id!),
    enabled: !!id,
    retry: false
  });

  if (isLoading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading show details...</div>;
  
  if (error || !show) {
    return (
      <div className="glass-card" style={{ maxWidth: '600px', margin: '4rem auto', padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Show Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          This show might not be published yet, or it does not exist.
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
          Return Home
        </Link>
      </div>
    );
  }

  // Filter out Season 0, and group episodes by season
  const regularSeasons = (show.seasons || [])
    .filter((s: any) => s.season_number > 0)
    .sort((a: any, b: any) => a.season_number - b.season_number);

  // Helper to merge episodes by content_group
  const getMergedEpisodes = (episodes: any[]) => {
    const merged: Record<string, any> = {};
    
    for (const ep of episodes) {
      if (!merged[ep.content_group]) {
        merged[ep.content_group] = {
          ...ep,
          languages: [ep.language] // Start language array
        };
      } else {
        if (!merged[ep.content_group].languages.includes(ep.language)) {
          merged[ep.content_group].languages.push(ep.language);
        }
      }
    }
    
    return Object.values(merged).sort((a: any, b: any) => a.episode_number - b.episode_number);
  };

  return (
    <div className="animate-fade-in">
      <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Back to Library
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem', marginBottom: '4rem' }}>
        <div style={{ width: '300px', height: '450px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
          <LazyImage 
            src={show.artwork?.poster || show.artwork?.thumbnail || show.artwork?.banner || ''} 
            alt={show.title}
            fallbackText={show.title}
          />
        </div>
        
        <div>
          <h1 style={{ fontSize: '3.5rem', margin: '0 0 1rem 0' }}>{show.title}</h1>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {show.categories?.map((cat: string) => (
              <span key={cat} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                {cat}
              </span>
            ))}
          </div>

          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, maxWidth: '800px', marginBottom: '2.5rem' }}>
            {show.synopsis}
          </p>
          
          <button 
            className="btn btn-primary" 
            style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '30px' }}
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <Play fill="currentColor" size={24} style={{ marginRight: '8px' }} /> Start Watching
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {regularSeasons.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No episodes available.</p>
        ) : (
          regularSeasons.map((season: any) => {
            const mergedEpisodes = getMergedEpisodes(season.episodes || []);
            
            return (
              <div key={season.id}>
                <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                  {season.title || `Season ${season.season_number}`}
                </h2>
                
                {mergedEpisodes.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No episodes in this season.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {mergedEpisodes.map((ep: any) => (
                      <div key={ep.content_group} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ width: '100%', aspectRatio: '16/9' }}>
                          <LazyImage 
                            src={ep.artwork?.thumbnail || ''} 
                            alt={ep.title}
                            fallbackText={ep.title}
                          />
                        </div>
                        
                        <div style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{ep.episode_number}. {ep.title}</h4>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                              {ep.duration_seconds ? `${Math.floor(ep.duration_seconds / 60)}m` : ''}
                            </span>
                          </div>
                          
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {ep.description}
                          </p>
                          
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {ep.languages?.map((lang: string) => (
                              <span key={lang} style={{ background: 'rgba(255,255,255,0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
