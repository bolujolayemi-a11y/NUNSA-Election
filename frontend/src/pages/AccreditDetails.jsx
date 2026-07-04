import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function AccreditDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { voter, matric } = state || {};

  const markVerified = async () => {
    try {
      await api.patch(`/auth/voter/verify/${encodeURIComponent(matric)}`);
      alert('Voter accredited successfully!');
      navigate('/verification'); // Return to search
    } catch (e) { alert('Failed to verify.'); }
  };

  if (!voter) return <div>No data found. Please search again.</div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #134d2a 0%, #1a6b3a 60%, #2d8a52 100%)' }}>
      {/* Header matching Login Page */}
      <div style={{ padding: '20px' }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: 'white' }}>
          <span style={{ color: '#c9962a' }}>NUNSA</span>UNIMED
        </span>
      </div>
      <div className="card" style={{ padding: '24px', maxWidth: '400px', margin: 'auto' }}>
        <h1>Confirm Accreditation</h1>
        <p><strong>Matric:</strong> {matric}</p>
        <p><strong>Name:</strong> {voter.name}</p>
        <p><strong>Level:</strong> {voter.level}</p>
        <button className="btn-primary" onClick={markVerified}>Confirm & Verify</button>
        <button onClick={() => navigate('/verification')}>Back</button>
      </div>
    </div>
  );
}