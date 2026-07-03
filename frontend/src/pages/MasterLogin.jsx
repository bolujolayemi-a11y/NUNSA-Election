import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import useAuthStore from '../store/authStore';
import { Eye, EyeOff } from 'lucide-react';

export default function MasterLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginMaster } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/master/login', form);
      loginMaster(data.token, { email: data.email, role: 'master' });
      navigate('/master/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0c10' }}>
      <div style={{ padding: '20px 32px' }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>
          <span style={{ color: '#c9962a' }}>NUNSA</span>UNIMED <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: 500, marginLeft: 6 }}>MASTER CONTROL</span>
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(201,150,42,0.12)', border: '2px solid rgba(201,150,42,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', fontSize: '1.7rem',
            }}>
              👑
            </div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: 'white', marginBottom: 4 }}>
              Owner Access
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              Full system control — use with caution
            </p>
          </div>

          <div style={{ background: '#13161d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', padding: '28px 24px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label style={{ color: 'rgba(255,255,255,0.6)' }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="owner@example.com"
                  style={{ background: '#0a0c10', border: '1.5px solid rgba(255,255,255,0.1)', color: 'white' }}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Password
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      background: '#0a0c10',
                      border: '1.5px solid rgba(255,255,255,0.1)',
                      color: 'white',
                      paddingRight: '45px',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '12px',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {error && <div className="error-msg">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: 13,
                  borderRadius: 'var(--radius-sm)',
                  background: '#c9962a',
                  color: '#0a0c10',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Verifying...' : 'Access Control Panel →'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem' }}>
            <a href="/login" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>← Back to voter login</a>
          </p>
        </div>
      </div>
    </div>
  );
}