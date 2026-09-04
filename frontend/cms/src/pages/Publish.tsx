import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, CheckCircle2, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import api from '../lib/api';

export const Publish = () => {
  const queryClient = useQueryClient();

  const { data: reportData, isLoading: isLoadingReport, error: reportError } = useQuery({
    queryKey: ['validation-report'],
    queryFn: () => api.get('/catalog/publish/validation-report').then(res => res.data),
    retry: false
  });

  const { data: runs, isLoading: isLoadingRuns } = useQuery({
    queryKey: ['publish-runs'],
    queryFn: () => api.get('/catalog/publish/runs').then(res => res.data)
  });

  const publishMutation = useMutation({
    mutationFn: () => api.post('/catalog/publish/').then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validation-report'] });
      queryClient.invalidateQueries({ queryKey: ['publish-runs'] });
      alert('Catalogue published successfully!');
    },
    onError: (err: any) => {
      if (err.response?.status === 403) {
        alert('Permission Denied: Only Admins can publish the catalogue.');
      } else {
        alert(`Failed to publish: ${err.response?.data?.detail?.message || err.message}`);
      }
      queryClient.invalidateQueries({ queryKey: ['validation-report'] });
    }
  });

  if (reportError) {
    const status = (reportError as any).response?.status;
    if (status === 403 || status === 401) {
      return (
        <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
          <ShieldAlert size={48} style={{ color: 'var(--accent-color)', marginBottom: '1rem' }} />
          <h2>Permission Denied</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You do not have the required permissions to view the validation report or publish.</p>
        </div>
      );
    }
    return <div>Error loading report.</div>;
  }

  const isBlocked = reportData?.status === 'blocked';

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Play size={24} /> Publish Catalogue
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Push your content live to the public viewer</p>
        </div>
        
        <button 
          className={`btn ${isBlocked ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => publishMutation.mutate()}
          disabled={isBlocked || publishMutation.isPending || isLoadingReport}
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {publishMutation.isPending ? 'Publishing...' : 'Publish Now'}
        </button>
      </div>

      {isLoadingReport ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Running validation checks...</div>
      ) : (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '1.5rem', color: isBlocked ? 'rgb(255, 80, 80)' : 'rgb(48, 209, 88)' }}>
            {isBlocked ? <AlertCircle /> : <CheckCircle2 />}
            Validation Report
          </h2>
          
          {isBlocked ? (
            <>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Publishing is disabled because there are <strong>{reportData.total_issues} blocking issues</strong> across your content.
                Please resolve them before publishing.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reportData.report?.map((group: any) => (
                  <div key={group.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
                      <span style={{ opacity: 0.5, marginRight: '8px', fontWeight: 'normal' }}>{group.entity}</span> 
                      {group.title}
                    </h3>
                    
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'rgb(255, 120, 120)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {group.issues.map((issue: any, idx: number) => (
                        <li key={idx}>
                          <div style={{ marginBottom: '4px' }}>{issue.message}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <strong>Action:</strong> {issue.suggested_action}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              All checks passed! Your content is valid and ready to be published to the live catalogue.
            </p>
          )}
        </div>
      )}

      <div>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.2rem' }}>
          <Clock size={20} /> Recent Publish Runs
        </h2>
        {isLoadingRuns ? (
          <p>Loading history...</p>
        ) : runs?.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No runs recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {runs?.map((run: any) => (
              <div key={run.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{new Date(run.created_at).toLocaleString()}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID: {run.id.slice(0,8)}</div>
                </div>
                <span className={`status-pill ${run.status === 'success' ? 'status-published' : 'status-draft'}`} style={{ 
                  background: run.status === 'success' ? 'rgba(48, 209, 88, 0.1)' : 'rgba(255, 80, 80, 0.1)',
                  color: run.status === 'success' ? 'rgb(48, 209, 88)' : 'rgb(255, 80, 80)',
                  border: 'none'
                }}>
                  {run.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
