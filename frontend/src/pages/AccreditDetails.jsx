import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function AccreditDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const voter = state?.voter;
  const matric = state?.matric;

  if (!voter) {
    return (
      <div style={{ padding: 40, color: 'white', textAlign: 'center' }}>
        <h2>No voter data found.</h2>
        <button onClick={() => navigate('/verification')}>Back to Search</button>
      </div>
    );
  }

  const markVerified = async () => {
    try {
      await api.patch(`/auth/voter/verify/${encodeURIComponent(matric)}`);
      alert('Voter accredited successfully!');
      navigate('/verification');
    } catch (e) { 
      alert('Failed to verify.'); 
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #134d2a 0%, #1a6b3a 60%, #2d8a52 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ padding: '24px', maxWidth: '400px', width: '90%' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '1.5rem', marginBottom: 20 }}>Confirm Accreditation</h1>
        
        {/* Added status display */}
        <div style={{ marginBottom: 15, padding: '8px', borderRadius: '4px', background: voter.verified ? '#e6fffa' : '#fff5f5', textAlign: 'center' }}>
          <strong>Status: </strong>
          <span style={{ color: voter.verified ? 'var(--green)' : '#c53030', fontWeight: 'bold' }}>
            {voter.verified ? 'Accredited' : 'Not Accredited'}
          </span>
        </div>

        <p><strong>Matric Number:</strong> {matric}</p>
        <p><strong>Full Name:</strong> {voter.name}</p>
        <p><strong>Level:</strong> {voter.level}</p>
        
        {/* Only show the button if they are not already verified */}
        {!voter.verified && (
          <button 
            className="btn-primary" 
            onClick={markVerified}
            style={{ width: '100%', padding: '12px', marginTop: 10 }}
          >
            Confirm & Verify
          </button>
        )}
        
        <button 
          onClick={() => navigate('/verification')}
          style={{ width: '100%', padding: '12px', marginTop: 10, background: 'none', border: '1px solid #ccc', cursor: 'pointer' }}
        >
          {voter.verified ? 'Back' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}