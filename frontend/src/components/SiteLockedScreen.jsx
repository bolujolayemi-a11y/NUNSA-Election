import React from 'react';

export default function SiteLockedScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #134d2a 0%, #1a6b3a 60%, #2d8a52 100%)', padding: 20,
    }}>
      <div className="card" style={{ padding: '40px 32px', textAlign: 'center', maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', color: 'var(--green-dark)', marginBottom: 10 }}>
          Voting is Currently Closed
        </h1>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.92rem', lineHeight: 1.6 }}>
          The election portal is temporarily unavailable. Please check back later or contact your election administrator for more information.
        </p>
      </div>
    </div>
  );
}
