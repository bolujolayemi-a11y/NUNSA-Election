import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';

export default function SuccessPage() {
  const { voter, logoutVoter } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <Navbar />
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <div className="card" style={{ padding: '48px 40px', textAlign: 'center', maxWidth: 480, width: '100%' }}>
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>✅</div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: 'var(--green-dark)', marginBottom: 10 }}>
            Vote Recorded!
          </h1>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 8 }}>
            Thank you, <strong>{voter?.name}</strong>. Your vote has been securely submitted.
          </p>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginBottom: 32 }}>
            {voter?.matric_number} · Each voter may only vote once.
          </p>
          <div style={{ padding: '14px', background: 'var(--green-light)', borderRadius: 'var(--radius-sm)', marginBottom: 28, fontSize: '0.88rem', color: 'var(--green)' }}>
            🔒 Your ballot is confidential and has been counted.
          </div>
          <button
            className="btn-ghost"
            style={{ width: '100%' }}
            onClick={() => { logoutVoter(); navigate('/login'); }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
