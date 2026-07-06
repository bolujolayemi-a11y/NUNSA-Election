import React, { useState, useEffect } from 'react';
import api from '../api/client';

export default function PublicResults() {
  const [results, setResults] = useState([]);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dynamic timestamp for "Published"
  const publishDate = new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });

  useEffect(() => {
    // Fetch both results and the voter list for live statistics
    Promise.all([
      api.get('/votes/results'),
      api.get('/votes/voters')
    ]).then(([resData, voterData]) => {
      setResults(resData.data);
      setVoters(voterData.data);
      setLoading(false);
    });
  }, []);

  // Calculate dynamic stats
  const totalStudents = voters.length;
  const verifiedStudents = voters.filter(v => v.verified).length;
  const totalVotesCast = results.reduce((sum, pos) => 
    sum + pos.candidates.reduce((s, c) => s + c.votes, 0) + (pos.no_votes || 0), 0);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Official Results...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif' }}>Nigerian Universities Nursing Students' Association (UNIMED Chapter) Election</h1>
        <p>Published: {publishDate}</p>
      </header>

      {/* Dynamic Stats Section */}
      <section style={{ display: 'flex', justifyContent: 'space-around', borderBottom: '2px solid #333', paddingBottom: 20, marginBottom: 40 }}>
        <div style={{ textAlign: 'center' }}><h3>{totalStudents}</h3><p style={{ fontSize: '0.7rem' }}>TOTAL STUDENTS</p></div>
        <div style={{ textAlign: 'center' }}><h3>{verifiedStudents}</h3><p style={{ fontSize: '0.7rem' }}>VERIFIED STUDENTS</p></div>
        <div style={{ textAlign: 'center' }}><h3>{totalVotesCast}</h3><p style={{ fontSize: '0.7rem' }}>VOTES CAST</p></div>
      </section>

      {/* Results Body */}
      {results.map(pos => {
        const sorted = [...pos.candidates].sort((a, b) => b.votes - a.votes);
        const winner = sorted[0];

        return (
          <div key={pos.position_id} style={{ marginBottom: 40, border: '1px solid #ddd', borderRadius: 8, padding: 20 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif' }}>{pos.position}</h2>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>Office of the {pos.position}</p>
            <div style={{ textAlign: 'right', fontWeight: 'bold' }}>TOTAL VOTES: {totalVotesCast}</div>
            
            {/* Candidates */}
            {sorted.map((c, i) => (
              <div key={c.candidate_id} style={{ margin: '20px 0', padding: 15, background: i === 0 ? '#f9f9f9' : 'transparent', borderRadius: 8 }}>
                {i === 0 && <div style={{ color: '#b45309', fontWeight: 'bold', fontSize: '0.7rem' }}>👑 WINNER</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{c.candidate} {i === 0 ? '👑' : ''}</strong>
                  <span>{totalVotesCast > 0 ? ((c.votes / totalVotesCast) * 100).toFixed(2) : 0}%</span>
                </div>
                <div>VOTES: {c.votes}</div>
              </div>
            ))}

            {/* Uncontested / NO Votes section to delete */}
            {pos.no_votes > 0 && (
            <div style={{ margin: '20px 0', padding: 15, background: '#fef2f2', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                <strong>NO / Abstain</strong>
                <span>{totalVotesCast > 0 ? ((pos.no_votes / totalVotesCast) * 100).toFixed(2) : 0}%</span>
                </div>
                <div>VOTES: {pos.no_votes}</div>
            </div>
            )}
          </div>
        );
      })}

      {/* Official Footer */}
      <footer style={{ marginTop: 60, paddingTop: 20, borderTop: '1px solid #ccc', fontSize: '0.8rem', color: '#555' }}>
        <p>These results are official and final. For inquiries, contact the electoral commission.</p>
        <p>University of Medical Sciences Student Union Elections 2026</p>
        <p>bolujolayemi@gmail.com | +234 906 623 7453</p>
        <p>© 2026 Nigerian Universities Nursing Students' Association (UNIMED Chapter). All rights reserved.</p>
      </footer>
    </div>
  );
}