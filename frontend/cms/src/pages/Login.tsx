import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Tv, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export const Login = () => {
  const { register, handleSubmit } = useForm();
  const { setToken } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');
      const formData = new URLSearchParams();
      formData.append('username', data.username.trim());
      formData.append('password', data.password.trim());
      
      const res = await api.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      setToken(res.data.access_token);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Tv size={48} style={{ color: 'var(--primary-color)', margin: '0 auto 1rem' }} />
          <h2>Welcome to Peblo TV</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Log in to the Admin CMS</p>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input {...register('username')} className="form-input" placeholder="admin" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" {...register('password')} className="form-input" placeholder="••••••••" required />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
