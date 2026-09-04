import React, { useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useMutation } from '@tanstack/react-query';

interface ArtworkUploaderProps {
  type: 'poster' | 'banner' | 'thumbnail';
  entityId: string;
  entityType: 'show' | 'season' | 'episode';
  currentUrl?: string;
  onSuccess?: (url: string) => void;
}

const specs = {
  poster: { aspect: '2:3', target: '600x900', max: '200 KB' },
  banner: { aspect: '16:9', target: '1280x720', max: '200 KB' },
  thumbnail: { aspect: '16:9', target: '640x360', max: '200 KB' }
};

export const ArtworkUploader: React.FC<ArtworkUploaderProps> = ({ type, entityId, entityType, currentUrl, onSuccess }) => {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entity_type', entityType);
      formData.append('entity_id', entityId);
      formData.append('type', type);

      const res = await api.post('/artwork/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setError(null);
      if (onSuccess) onSuccess(data.url);
    },
    onError: (err: any) => {
      // Human-readable backend validation errors
      setError(err.response?.data?.detail || err.message || 'Upload failed');
      setPreview(currentUrl || null); // Revert on failure
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client side preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError(null);

    // Upload to backend immediately (backend remains authoritative)
    uploadMutation.mutate(file);
  };

  const spec = specs[type];

  return (
    <div className="artwork-uploader" style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ margin: 0, textTransform: 'capitalize' }}>{type}</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Aspect: {spec.aspect} | Target: {spec.target} | Max: {spec.max}
          </p>
        </div>
        <input 
          type="file" 
          accept="image/jpeg, image/png, image/webp" 
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button 
          type="button"
          className="btn btn-secondary" 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', background: 'rgba(255, 59, 48, 0.1)', color: 'rgb(255, 80, 80)', borderRadius: '4px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <AlertCircle size={16} style={{ marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ 
        width: '100%', 
        height: '200px', 
        background: 'rgba(0,0,0,0.4)', 
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        border: '1px dashed var(--glass-border)'
      }}>
        {preview ? (
          <img 
            src={preview} 
            alt={`${type} preview`} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain' 
            }} 
          />
        ) : (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            <Upload size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <div style={{ fontSize: '0.9rem' }}>No image uploaded</div>
          </div>
        )}
      </div>
    </div>
  );
};
