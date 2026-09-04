import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { ArtworkUploader } from '../components/ArtworkUploader';

export const EpisodeForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    language: 'en',
    content_group: '',
    status: 'draft',
    season_id: '',
    category: ''
  });

  const { data: seasons } = useQuery({
    queryKey: ['seasons-all'],
    queryFn: () => api.get('/seasons').then(res => res.data)
  });

  const { data: episode, isLoading } = useQuery({
    queryKey: ['episode', id],
    queryFn: () => api.get(`/episodes/${id}`).then(res => res.data),
    enabled: isEditing
  });

  useEffect(() => {
    if (episode) {
      setFormData({
        title: episode.title || '',
        description: episode.description || '',
        duration: episode.duration || '',
        language: episode.language || 'en',
        content_group: episode.content_group || '',
        status: episode.status || 'draft',
        season_id: episode.season_id || '',
        category: episode.category || ''
      });
    }
  }, [episode]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      // Cast duration to int if it exists
      const payload = {
        ...data,
        duration: data.duration ? parseInt(data.duration, 10) : null
      };

      if (isEditing) {
        return api.put(`/episodes/${id}`, payload).then(res => res.data);
      } else {
        return api.post('/episodes/', payload).then(res => res.data);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['episodes-all'] });
      if (!isEditing) {
        navigate(`/episodes/${data.id}/edit`);
      } else {
        alert('Saved successfully!');
      }
    },
    onError: (err: any) => {
      alert(`Failed to save: ${err.response?.data?.detail || err.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isEditing && isLoading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button 
        className="btn btn-secondary" 
        onClick={() => navigate('/shows')} // For brevity, we route back to shows
        style={{ marginBottom: '1.5rem', border: 'none', padding: 0 }}
      >
        <ArrowLeft size={18} /> Back to Library
      </button>

      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>{isEditing ? 'Edit Episode' : 'Create New Episode'}</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2rem' }}>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Episode Title</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
              style={{ width: '100%', padding: '0.75rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
            <textarea 
              className="input-field" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={3}
              style={{ width: '100%', padding: '0.75rem', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Content Group (slug)</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.content_group} 
                onChange={e => setFormData({...formData, content_group: e.target.value})}
                required
                style={{ width: '100%', padding: '0.75rem' }}
                placeholder="e.g. moti-s01e01"
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Duration (Seconds)</label>
              <input 
                type="number" 
                className="input-field" 
                value={formData.duration} 
                onChange={e => setFormData({...formData, duration: e.target.value})}
                style={{ width: '100%', padding: '0.75rem' }}
                placeholder="e.g. 1500"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Language</label>
              <select 
                className="input-field" 
                value={formData.language} 
                onChange={e => setFormData({...formData, language: e.target.value})}
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <option value="en">English (en)</option>
                <option value="es">Spanish (es)</option>
                <option value="fr">French (fr)</option>
                <option value="ja">Japanese (ja)</option>
                <option value="hi">Hindi (hi)</option>
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                style={{ width: '100%', padding: '0.75rem' }}
                placeholder="e.g. sci-fi"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Assign to Season</label>
              <select 
                className="input-field" 
                value={formData.season_id} 
                onChange={e => setFormData({...formData, season_id: e.target.value})}
                required
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <option value="">Select Season...</option>
                {seasons?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.title || `Season ${s.season_number}`}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
              <select 
                className="input-field" 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={saveMutation.isPending}
            style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
          >
            <Save size={18} /> {saveMutation.isPending ? 'Saving...' : 'Save Episode Data'}
          </button>
        </form>

        <div>
          {isEditing ? (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Episode Artwork</h3>
              <ArtworkUploader 
                type="thumbnail" 
                entityType="episode" 
                entityId={id!} 
              />
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Save the episode first to upload artwork.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
