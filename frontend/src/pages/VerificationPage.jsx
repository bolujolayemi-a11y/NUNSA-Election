import React, { useState } from 'react';
import { IMaskInput } from 'react-imask'; 
import api from '../api/client';

export default function VerificationPage() {
  const [matric, setMatric] = useState('');
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchVoter = async () => {
    setLoading(true);
    try {
      // Ensure you are calling the lookup route
      const { data } = await api.get(`/auth/voter/lookup?matric=${matric}`);
      setVoter(data);
    } catch (e) { alert('Voter not found'); }
    finally { setLoading(false); }
  };

  const markVerified = async () => {
    await api.patch(`/auth/voter/verify/${matric}`);
    alert('Voter verified! They can now log in.');
    setVoter(null);
    setMatric('');
  };

  return (
    <div className="page" style={{ padding: '20px' }}>
      <h1>Voter Accreditation</h1>
      
      <div className="card" style={{ padding: '24px', maxWidth: '400px' }}>
        <div className="form-group">
          <label>Matric Number</label>
          <IMaskInput
            mask="aaa/00/0000"
            definitions={{ a: /[A-Za-z]/, 0: /\d/ }}
            value={matric}
            onAccept={(value) => setMatric(value.toUpperCase())}
            placeholder="NUS/21/0321"
            style={{ width: '100%', fontSize: '16px', padding: '12px', marginBottom: '10px' }}
          />
        </div>
        <button className="btn-primary" onClick={searchVoter} disabled={loading}>
          {loading ? 'Searching...' : 'Search Voter'}
        </button>
      </div>

      {voter && (
        <div className="card" style={{ marginTop: '20px', maxWidth: '400px' }}>
          <p><strong>Name:</strong> {voter.name}</p>
          <p><strong>Level:</strong> {voter.level}</p>
          <button 
            className="btn-primary" 
            onClick={markVerified} 
            disabled={voter.verified}
            style={{ width: '100%', background: voter.verified ? 'gray' : 'var(--green)' }}
          >
            {voter.verified ? 'Already Verified' : 'Verify Voter'}
          </button>
        </div>
      )}
    </div>
  );
}