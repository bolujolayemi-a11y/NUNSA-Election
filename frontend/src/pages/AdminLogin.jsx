import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import useAuthStore from '../store/authStore';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin/login', form);
      loginAdmin(data.token, { username: data.username, role: 'admin' });
      navigate('/secure-admin/dashboard');
    } catch (err) {
      // ✅ FIX: Extract the string message from the error object
      const errorMessage = err.response?.data?.error || err.message || 'Invalid credentials';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#1a1f2e' }}>
      <div style={{ padding: '20px' }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>
          <span style={{ color: '#c9962a' }}>NUNSA</span>UNIMED
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔐</div>
            <h1 style={{ color: 'white', marginBottom: 4 }}>Admin Panel</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Authorized personnel only</p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="admin"
                  style={{ fontSize: '16px', padding: '14px' }}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    style={{ padding: '14px 45px 14px 14px', fontSize: '16px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', background: 'none', border: 'none',
                      display: 'flex', alignItems: 'center', padding: '8px'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                  </button>
                </div>
              </div>
              {error && <div className="error-msg" style={{ fontSize: '0.85rem' }}>{error}</div>}
              <button className="btn-primary" type="submit" disabled={loading} style={{ padding: '14px', fontSize: '1rem' }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}