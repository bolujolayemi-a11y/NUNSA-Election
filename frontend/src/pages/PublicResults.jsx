import React, { useState, useEffect } from 'react';
import api from '../api/client';

export default function PublicResults() {
  const [results, setResults] = useState([]);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // These now bypass the redirect logic thanks to the interceptor update
    Promise.all([
      api.get('/votes/public-results'),
      api.get('/votes/public-voters')
    ]).then(([res, vRes]) => {
      setResults(res.data);
      setVoters(vRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Official Report...</div>;

  const totalParticipation = results.length > 0 ? results[0].total_participation : 0;

  return (
    // 'width: 100%' and 'max-width' ensure it fills PC screens while remaining readable
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: "'DM Sans', sans-serif" }}>
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", color: '#1a6b3a' }}>NUNSA UNIMED Chapter Election Results</h1>
        <p>Published: {new Date().toLocaleString()}</p>
      </header>

      {/* Stats Section: Uses grid for even spacing on PC */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', borderBottom: '2px solid #333', paddingBottom: 20, marginBottom: 40 }}>
        <div style={{ textAlign: 'center' }}><h3>{voters.length}</h3><p style={{ fontSize: '0.7rem' }}>TOTAL STUDENTS</p></div>
        <div style={{ textAlign: 'center' }}><h3>{voters.filter(v => v.verified).length}</h3><p style={{ fontSize: '0.7rem' }}>VERIFIED STUDENTS</p></div>
        <div style={{ textAlign: 'center' }}><h3>{totalParticipation}</h3><p style={{ fontSize: '0.7rem' }}>VOTES CAST</p></div>
      </section>

      {/* Results Body: Card-based container layout */}
      {results.map(pos => (
        <div key={pos.position_id} style={{ marginBottom: 30, background: '#fff', padding: 24, borderRadius: '12px', border: '1px solid #e4e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", borderBottom: '1px solid #eee', paddingBottom: 10 }}>{pos.position}</h2>
          {pos.candidates.map((c, i) => {
            const pct = totalParticipation > 0 ? ((c.votes / totalParticipation) * 100).toFixed(1) : 0;
            return (
              <div key={c.candidate_id} style={{ padding: '15px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <strong style={{ fontSize: '1rem' }}>{i === 0 && '👑 '} {c.candidate}</strong>
                  <span style={{ fontWeight: 700 }}>{c.votes} votes ({pct}%)</span>
                </div>
                {/* Progress bar for visual fill */}
                <div style={{ height: '10px', background: '#f0f2f5', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: i === 0 ? '#1a6b3a' : '#9ca3af' }} />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}