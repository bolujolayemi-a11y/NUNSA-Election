import React, { useState } from 'react';
import { IMaskInput } from 'react-imask';
import api from '../api/client';

export default function VerificationPage() {
  const [matric, setMatric] = useState('');
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchVoter = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/auth/voter/lookup?matric=${matric}`);
      setVoter(data);
    } catch (e) {
      setError('Voter not found in database.');
      setVoter(null);
    } finally {
      setLoading(false);
    }
  };

  const markVerified = async () => {
    setLoading(true);
    try {
      await api.patch(`/auth/voter/verify/${matric}`);
      alert('Voter accredited successfully!');
      setVoter({ ...voter, verified: true });
    } catch (e) {
      alert('Failed to verify.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #134d2a 0%, #1a6b3a 60%, #2d8a52 100%)' }}>
      {/* Header matching Login Page */}
      <div style={{ padding: '20px' }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: 'white' }}>
          <span style={{ color: '#c9962a' }}>NUNSA</span>UNIMED
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: 'white', marginBottom: 6 }}>Accreditation Desk</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>Verify voter identity before login</p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Matric Number</label>
                <IMaskInput
                  mask="aaa/00/0000"
                  definitions={{ a: /[A-Za-z]/, 0: /\d/ }}
                  value={matric}
                  onAccept={(value) => setMatric(value.toUpperCase())}
                  placeholder="NUS/21/0321"
                  style={{ width: '100%', fontSize: '16px', padding: '14px 16px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              
              <button className="btn-primary" onClick={searchVoter} disabled={loading} style={{ width: '100%', padding: '14px' }}>
                {loading ? 'Searching...' : 'Search Voter'}
              </button>
            </div>

            {error && <p style={{ color: 'red', marginTop: 16, fontSize: '0.9rem' }}>{error}</p>}

            {voter && (
              <div style={{ marginTop: 24, padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 8px 0' }}><strong>Name:</strong> {voter.name}</p>
                <p style={{ margin: '0 0 16px 0' }}><strong>Level:</strong> {voter.level}</p>
                <button 
                  className="btn-primary" 
                  onClick={markVerified} 
                  disabled={voter.verified || loading}
                  style={{ width: '100%', background: voter.verified ? '#666' : 'var(--green)' }}
                >
                  {voter.verified ? '✓ Already Verified' : 'Verify Voter'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}