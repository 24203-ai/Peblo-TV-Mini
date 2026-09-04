import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit } from 'lucide-react';
import api from '../lib/api';

export const ShowSeasons = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: show, isLoading: showLoading } = useQuery({
    queryKey: ['show', id],
    queryFn: () => api.get(`/shows/${id}`).then(res => res.data),
  });

  const { data: seasons, isLoading: seasonsLoading } = useQuery({
    queryKey: ['seasons', id],
    queryFn: () => api.get(`/seasons?show_id=${id}`).then(res => res.data),
    enabled: !!id
  });

  // Since we want episodes for all these seasons, we can fetch them individually
  // Or we can just use the fact that the backend returns 100 limit, so we should fetch by season.
  const { data: allEpisodes, isLoading: episodesLoading } = useQuery({
    queryKey: ['episodes', id],
    queryFn: async () => {
      if (!seasons) return [];
      const eps = await Promise.all(
        seasons.map((s: any) => api.get(`/episodes?season_id=${s.id}`).then(res => res.data))
      );
      return eps.flat();
    },
    enabled: !!seasons && seasons.length > 0
  });

  if (showLoading || seasonsLoading || episodesLoading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  const showSeasons = seasons?.sort((a: any, b: any) => a.season_number - b.season_number) || [];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        className="btn btn-secondary" 
        onClick={() => navigate('/shows')}
        style={{ marginBottom: '1.5rem', border: 'none', padding: 0 }}
      >
        <ArrowLeft size={18} /> Back to Shows
      </button>

      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>{show?.title} - Seasons</h1>
        </div>
      </div>

      {showSeasons.length === 0 ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No seasons found for this show.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {showSeasons.map((season: any) => {
            const seasonEpisodes = allEpisodes?.filter((e: any) => e.season_id === season.id).sort((a: any, b: any) => a.title.localeCompare(b.title)) || [];
            
            return (
              <div key={season.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>Season {season.season_number}</h3>
                </div>
                
                {seasonEpisodes.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No episodes in this season.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {seasonEpisodes.map((ep: any) => (
                      <div key={ep.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                        <div>
                          <strong>{ep.title}</strong>
                          <span style={{ margin: '0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{ep.language}</span>
                          <span className={`status-pill ${ep.status === 'published' ? 'status-published' : 'status-draft'}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                            {ep.status}
                          </span>
                        </div>
                        <Link to={`/episodes/${ep.id}/edit`} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                          <Edit size={14} style={{ marginRight: '4px' }}/> Edit
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
