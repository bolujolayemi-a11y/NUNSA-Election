import React, { useState, useEffect } from 'react';
import api from '../api/client';

export default function PublicResults() {
  const [results, setResults] = useState([]);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      publicApi.get('/votes/public-results'),
      publicApi.get('/votes/public-voters')
    ]).then(([res, vRes]) => {
      setResults(res.data);
      setVoters(vRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  // Safe check to get participation count
  const totalParticipation = results.length > 0 ? results[0].total_participation : 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1>Nigerian Universities Nursing Students' Association (UNIMED Chapter) Election</h1>
        <p>Published: {new Date().toLocaleString()}</p>
      </header>

      <section style={{ display: 'flex', justifyContent: 'space-around', borderBottom: '2px solid #333', paddingBottom: 20, marginBottom: 40 }}>
        <div style={{ textAlign: 'center' }}><h3>{voters.length}</h3><p style={{ fontSize: '0.7rem' }}>TOTAL STUDENTS</p></div>
        <div style={{ textAlign: 'center' }}><h3>{voters.filter(v => v.verified).length}</h3><p style={{ fontSize: '0.7rem' }}>VERIFIED STUDENTS</p></div>
        <div style={{ textAlign: 'center' }}><h3>{totalParticipation}</h3><p style={{ fontSize: '0.7rem' }}>VOTES CAST</p></div>
      </section>

      {results.map(pos => (
        <div key={pos.position_id} style={{ marginBottom: 40 }}>
          <h2 style={{ borderBottom: '1px solid #ccc', marginBottom: '10px' }}>{pos.position}</h2>
          {pos.candidates.map((c, i) => (
            <div key={c.candidate_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <strong>{i === 0 && '👑 '} {c.candidate}</strong>
              <span>{c.votes} votes ({totalParticipation > 0 ? ((c.votes / totalParticipation) * 100).toFixed(2) : 0}%)</span>
            </div>
          ))}
        </div>
      ))}

      <footer style={{ marginTop: 60, paddingTop: 20, borderTop: '1px solid #ccc', fontSize: '0.8rem', color: '#555' }}>
        <p>These results are official and final. For inquiries, contact the electoral commission.</p>
        <p>University of Medical Sciences Student Union Elections 2026</p>
        <p>bolujolayemi@gmail.com | +234 906 623 7453</p>
        <p>© 2026 Nigerian Universities Nursing Students' Association (UNIMED Chapter). All rights reserved.</p>
      </footer>
    </div>
  );
}