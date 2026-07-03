import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Navbar from '../components/Navbar';
import SiteStatusBanner from '../components/SiteStatusBanner';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/votes/results');
      setResults(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading results...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <Navbar links={[{ label: '⚙️ Admin Panel', to: '/secure-admin/dashboard' }]} />
      <SiteStatusBanner />

      <div className="page-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem' }}>📊 Election Results</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {lastUpdated && <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Updated {lastUpdated} · auto-refreshes every 15s</span>}
            <button className="btn-ghost" onClick={load} style={{ fontSize: '0.85rem', padding: '8px 14px' }}>↻ Refresh</button>
          </div>
        </div>

        {results.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-600)' }}>
            No results yet.
          </div>
        )}

        {results.map(pos => {
          const total = pos.candidates.reduce((s, c) => s + c.votes, 0);
          const leader = pos.candidates[0];

          return (
            <div key={pos.position_id} className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '14px 20px', background: 'var(--green-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.05rem', color: 'white' }}>{pos.position}</h2>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>{total} total vote{total !== 1 ? 's' : ''}</span>
              </div>

              {/* Candidates */}
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pos.candidates.length === 0 && <p style={{ color: 'var(--gray-400)', fontSize: '0.88rem' }}>No candidates.</p>}
                {pos.no_votes > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fef2f2', border: '2px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>👎</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--red)' }}>NO votes</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--red)' }}>{pos.no_votes}</span>
                      </div>
                      <div style={{ height: 10, background: 'var(--gray-100)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${total > 0 ? Math.round((pos.no_votes / (total + pos.no_votes)) * 100) : 0}%`, background: '#dc2626', borderRadius: 999 }} />
                      </div>
                    </div>
                  </div>
                )}
                {pos.candidates.map((c, idx) => {
                  const pct = total > 0 ? Math.round((c.votes / total) * 100) : 0;
                  const isLeader = idx === 0 && c.votes > 0;

                  return (
                    <div key={c.candidate_id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Photo */}
                      <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0, border: isLeader ? '2.5px solid var(--gold)' : '2px solid var(--gray-200)' }}>
                        {c.photo_url
                          ? <img src={c.photo_url} alt={c.candidate} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>}
                      </div>

                      {/* Bar */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {isLeader && <span style={{ color: '#c9962a', fontSize: '0.75rem' }}>👑</span>}
                            {c.candidate}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isLeader ? 'var(--green)' : 'var(--gray-600)' }}>
                            {c.votes} vote{c.votes !== 1 ? 's' : ''} ({pct}%)
                          </span>
                        </div>
                        <div style={{ height: 10, background: 'var(--gray-100)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: isLeader ? 'var(--green)' : 'var(--gray-400)',
                            borderRadius: 999,
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
