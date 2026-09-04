import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadCloud, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../lib/api';

export const Dashboard = () => {
  const queryClient = useQueryClient();

  const { data: runs, isLoading } = useQuery({
    queryKey: ['publish_runs'],
    queryFn: () => api.get('/catalog/publish/runs').then(res => res.data)
  });

  const publishMutation = useMutation({
    mutationFn: () => api.post('/catalog/publish'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publish_runs'] });
      alert("Catalogue published successfully!");
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: ['publish_runs'] });
      const detail = err.response?.data?.detail;
      if (detail && detail.problems) {
        console.error(detail.problems);
        alert(`Publishing failed: ${detail.problems.map((p:any) => p.message).join('\n')}`);
      } else {
        alert("Publishing failed!");
      }
    }
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Overview of your catalogue operations</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => publishMutation.mutate()}
          disabled={publishMutation.isPending}
        >
          <UploadCloud size={18} /> 
          {publishMutation.isPending ? 'Publishing...' : 'Publish Catalogue'}
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Recent Publish Runs</h3>
        
        {isLoading ? (
          <p>Loading runs...</p>
        ) : runs?.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No publish runs yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {runs?.map((run: any) => (
              <div key={run.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {run.status === 'success' ? (
                    <CheckCircle className="text-emerald-400" size={24} style={{ color: 'var(--success-color)' }} />
                  ) : (
                    <AlertTriangle className="text-rose-400" size={24} style={{ color: 'var(--danger-color)' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 500 }}>{new Date(run.created_at).toLocaleString()}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID: {run.id.substring(0,8)}</div>
                  </div>
                </div>
                
                <span className={`status-pill ${run.status === 'success' ? 'status-published' : 'status-draft'}`}>
                  {run.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
