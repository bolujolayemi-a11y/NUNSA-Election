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
      <div className="page" style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        minHeight: 'calc(100vh - 64px)', padding: '16px' 
      }}>
        <div className="card" style={{ 
          padding: '32px 20px', // Reduced from 48px/40px to fit small screens
          textAlign: 'center', maxWidth: 480, width: '100%' 
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>✅</div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: 'var(--green-dark)', marginBottom: 10 }}>
            Vote Recorded!
          </h1>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: 8 }}>
            Thank you, <strong>{voter?.name}</strong>. Your vote has been securely submitted.
          </p>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginBottom: 24 }}>
            {voter?.matric_number} · Only one vote is allowed.
          </p>
          <div style={{ padding: '12px', background: 'var(--green-light)', borderRadius: 'var(--radius-sm)', marginBottom: 24, fontSize: '0.85rem', color: 'var(--green)' }}>
            🔒 Ballot is confidential and counted.
          </div>
          <button
            className="btn-ghost"
            style={{ width: '100%', padding: '12px' }}
            onClick={() => { logoutVoter(); navigate('/login'); }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}