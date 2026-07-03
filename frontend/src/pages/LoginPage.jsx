import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMaskInput } from 'react-imask';
import api from '../api/client';
import useAuthStore from '../store/authStore';
import SiteLockedScreen from '../components/SiteLockedScreen';

export default function LoginPage() {
  const [matric, setMatric] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [siteEnabled, setSiteEnabled] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const { loginVoter } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/master/site-status')
      .then(({ data }) => setSiteEnabled(data.site_enabled))
      .catch(() => setSiteEnabled(true))
      .finally(() => setCheckingStatus(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!matric.trim()) {
      setError('Please enter your matric number');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/voter/login', {
        matric_number: matric.toUpperCase().trim(),
      });

      loginVoter(data.token, {
        ...data.voter,
        role: 'voter',
      });

      data.voter.has_voted ? navigate('/success') : navigate('/vote');
    } catch (err) {
      if (err.response?.data?.site_disabled) {
        setSiteEnabled(false);
      } else if (err.response?.status === 403) {
        // Specific instruction for unregistered matric numbers
        setError('Matric number not found. Kindly contact the electoral committee for assistance.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) return null;
  if (!siteEnabled) return <SiteLockedScreen />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #134d2a 0%, #1a6b3a 60%, #2d8a52 100%)' }}>
      <div style={{ padding: '20px 32px' }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: 'white' }}>
          <span style={{ color: '#c9962a' }}>NUNSA</span>UNIMED
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem', backdropFilter: 'blur(8px)' }}>🗳️</div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: 'white', marginBottom: 6 }}>NUNSA ONDO UNIMED Chapter Elections</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem' }}>Enter your matric number to access the ballot</p>
          </div>

          <div className="card" style={{ padding: '32px 28px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label htmlFor="matric">Matric Number</label>
                <IMaskInput
                  mask="aaa/00/0000"
                  definitions={{ a: /[A-Za-z]/, 0: /\d/ }}
                  value={matric}
                  onAccept={(value) => setMatric(value.toUpperCase())}
                  placeholder="NUS/21/0321"
                  autoComplete="off"
                  style={{ width: '100%', fontSize: '1rem', padding: '13px 16px', letterSpacing: '0.5px' }}
                />
              </div>

              {error && <div className="error-msg" style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{error}</div>}

              <button className="btn-primary" type="submit" disabled={loading} style={{ padding: '13px', fontSize: '1rem', marginTop: 4 }}>
                {loading ? 'Verifying...' : 'Access Ballot →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}