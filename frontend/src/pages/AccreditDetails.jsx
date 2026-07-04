import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function AccreditDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Safely extract data, providing defaults if state is null
  const voter = state?.voter;
  const matric = state?.matric;

  // Handle refresh or direct navigation where state is empty
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
        <p><strong>Matric:</strong> {matric}</p>
        <p><strong>Name:</strong> {voter.name}</p>
        <p><strong>Level:</strong> {voter.level}</p>
        
        <button 
          className="btn-primary" 
          onClick={markVerified}
          style={{ width: '100%', padding: '12px', marginTop: 10 }}
        >
          Confirm & Verify
        </button>
        
        <button 
          onClick={() => navigate('/verification')}
          style={{ width: '100%', padding: '12px', marginTop: 10, background: 'none', border: '1px solid #ccc' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}