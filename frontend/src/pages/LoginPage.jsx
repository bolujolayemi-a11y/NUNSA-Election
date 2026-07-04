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
      // 1. Check accreditation using the correct endpoint and encoded URL
      const encodedMatric = encodeURIComponent(matric);
      const { data } = await api.get(`/auth/voter/lookup?matric=${encodedMatric}`);
      
      if (!data.verified) {
        setError('You have not been verified yet. Please contact the electoral committee.');
        setLoading(false);
        return;
      }

      // 2. Proceed to login
      const loginResponse = await api.post('/auth/voter/login', {
        matric_number: matric.toUpperCase().trim(),
      });

      loginVoter(loginResponse.data.token, {
        ...loginResponse.data.voter,
        role: 'voter',
      });

      loginResponse.data.voter.has_voted ? navigate('/success') : navigate('/vote');
      
    } catch (err) {
      if (err.response?.data?.site_disabled) {
        setSiteEnabled(false);
      } else if (err.response?.status === 403 || err.response?.status === 404) {
        setError('Matric number not found or not accredited. Kindly contact the electoral committee.');
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
      <div style={{ padding: '20px' }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: 'white' }}>
          <span style={{ color: '#c9962a' }}>NUNSA</span>UNIMED
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.8rem', backdropFilter: 'blur(8px)' }}>🗳️</div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: 'white', marginBottom: 6 }}>NUNSA UNIMED Chapter Election</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', padding: '0 20px' }}>Enter your matric number to access the ballot</p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label htmlFor="matric">Matric Number</label>
                <IMaskInput
                  mask="aaa/00/0000"
                  definitions={{ a: /[A-Za-z]/, 0: /\d/ }}
                  value={matric}
                  onAccept={(value) => setMatric(value.toUpperCase())}
                  placeholder="NUS/21/0321"
                  autoComplete="off"
                  style={{ width: '100%', fontSize: '16px', padding: '14px 16px', letterSpacing: '0.5px' }}
                />
              </div>

              {error && <div className="error-msg" style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{error}</div>}

              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: 4 }}>
                {loading ? 'Verifying...' : 'Access Ballot →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}