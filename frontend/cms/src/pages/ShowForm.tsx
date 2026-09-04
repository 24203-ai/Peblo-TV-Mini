import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { ArtworkUploader } from '../components/ArtworkUploader';

export const ShowForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    section: 'featured',
    status: 'draft'
  });

  const { data: show, isLoading } = useQuery({
    queryKey: ['show', id],
    queryFn: () => api.get(`/shows/${id}`).then(res => res.data),
    enabled: isEditing
  });

  useEffect(() => {
    if (show) {
      setFormData({
        title: show.title || '',
        synopsis: show.synopsis || '',
        section: show.section || 'featured',
        status: show.status || 'draft'
      });
    }
  }, [show]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (isEditing) {
        return api.put(`/shows/${id}`, data).then(res => res.data);
      } else {
        return api.post('/shows/', data).then(res => res.data);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shows-all'] });
      if (!isEditing) {
        navigate(`/shows/${data.id}/edit`);
      } else {
        alert('Saved successfully!');
      }
    },
    onError: (err: any) => {
      alert(`Failed to save: ${err.message}`);
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
        onClick={() => navigate('/shows')}
        style={{ marginBottom: '1.5rem', border: 'none', padding: 0 }}
      >
        <ArrowLeft size={18} /> Back to Shows
      </button>

      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>{isEditing ? 'Edit Show' : 'Create New Show'}</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2rem' }}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
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
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Synopsis</label>
            <textarea 
              className="input-field" 
              value={formData.synopsis} 
              onChange={e => setFormData({...formData, synopsis: e.target.value})}
              rows={4}
              style={{ width: '100%', padding: '0.75rem', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Section</label>
              <select 
                className="input-field" 
                value={formData.section} 
                onChange={e => setFormData({...formData, section: e.target.value})}
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <option value="featured">Featured</option>
                <option value="action">Action</option>
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="documentary">Documentary</option>
                <option value="kids">Kids</option>
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
            <Save size={18} /> {saveMutation.isPending ? 'Saving...' : 'Save Show Data'}
          </button>
        </form>

        <div>
          {isEditing ? (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Artwork</h3>
              <ArtworkUploader 
                type="poster" 
                entityType="show" 
                entityId={id!} 
                // We'd ideally fetch the URL from a dedicated artwork endpoint, but we don't have it natively in the show response
                // For this challenge, we just enable the uploader.
              />
              <ArtworkUploader 
                type="banner" 
                entityType="show" 
                entityId={id!} 
              />
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Save the show first to upload artwork.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
