import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import SiteLockedScreen from '../components/SiteLockedScreen';

// ── Candidate card with explicit Select button ────────────────────────────────
function CandidateCard({ candidate, selected, onSelect }) {
  return (
    <div style={{
      border: selected ? '2.5px solid var(--green)' : '2px solid var(--gray-200)',
      borderRadius: 'var(--radius)',
      background: selected ? 'var(--green-light)' : 'var(--white)',
      boxShadow: selected ? '0 0 0 4px rgba(26,107,58,0.10)' : 'var(--shadow-sm)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 14px 14px', gap: 10, position: 'relative',
      transition: 'all 0.18s ease',
    }}>
      {selected && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 22, height: 22, borderRadius: '50%',
          background: 'var(--green)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '0.75rem', fontWeight: 700,
        }}>✓</div>
      )}

      {/* Photo */}
      <div style={{
        width: 88, height: 88, borderRadius: '50%', overflow: 'hidden',
        background: 'var(--gray-100)', flexShrink: 0,
        border: `3px solid ${selected ? 'var(--green)' : 'var(--gray-200)'}`,
      }}>
        {candidate.photo_url
          ? <img src={candidate.photo_url} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>👤</div>}
      </div>

      {/* Name + bio */}
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: selected ? 'var(--green-dark)' : 'var(--gray-800)' }}>
          {candidate.name}
        </div>
        {candidate.bio && (
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)', marginTop: 4, lineHeight: 1.4 }}>{candidate.bio}</div>
        )}
      </div>

      {/* Explicit select button */}
      <button
        onClick={onSelect}
        style={{
          width: '100%', padding: '9px 0', borderRadius: 'var(--radius-sm)',
          fontWeight: 600, fontSize: '0.88rem',
          background: selected ? 'var(--green)' : 'var(--gray-100)',
          color: selected ? 'white' : 'var(--gray-600)',
          border: selected ? 'none' : '1.5px solid var(--gray-200)',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {selected ? '✓ Selected' : 'Select'}
      </button>
    </div>
  );
}

// ── Yes/No widget for uncontested (solo) candidates ───────────────────────────
function YesNoCard({ candidate, value, onChange }) {
  // value: 'yes' | 'no' | null
  return (
    <div style={{
      border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)',
      background: 'var(--white)', padding: '24px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Photo */}
      <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', background: 'var(--gray-100)', border: '3px solid var(--gray-200)' }}>
        {candidate.photo_url
          ? <img src={candidate.photo_url} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>👤</div>}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.05rem' }}>{candidate.name}</div>
        {candidate.bio && <div style={{ fontSize: '0.82rem', color: 'var(--gray-600)', marginTop: 4 }}>{candidate.bio}</div>}
        <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: 6 }}>Uncontested — vote YES or NO</div>
      </div>

      {/* YES / NO buttons */}
      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 280 }}>
        <button
          onClick={() => onChange('yes')}
          style={{
            flex: 1, padding: '12px 0', borderRadius: 'var(--radius-sm)',
            fontWeight: 700, fontSize: '1rem',
            background: value === 'yes' ? 'var(--green)' : 'var(--gray-100)',
            color: value === 'yes' ? 'white' : 'var(--gray-600)',
            border: value === 'yes' ? 'none' : '1.5px solid var(--gray-200)',
            cursor: 'pointer', transition: 'all 0.15s',
            boxShadow: value === 'yes' ? '0 0 0 3px rgba(26,107,58,0.15)' : 'none',
          }}
        >
          👍 YES
        </button>
        <button
          onClick={() => onChange('no')}
          style={{
            flex: 1, padding: '12px 0', borderRadius: 'var(--radius-sm)',
            fontWeight: 700, fontSize: '1rem',
            background: value === 'no' ? 'var(--red)' : 'var(--gray-100)',
            color: value === 'no' ? 'white' : 'var(--gray-600)',
            border: value === 'no' ? 'none' : '1.5px solid var(--gray-200)',
            cursor: 'pointer', transition: 'all 0.15s',
            boxShadow: value === 'no' ? '0 0 0 3px rgba(220,38,38,0.15)' : 'none',
          }}
        >
          👎 NO
        </button>
      </div>
    </div>
  );
}

// ── Main VotePage ─────────────────────────────────────────────────────────────
export default function VotePage() {
  const [positions, setPositions] = useState([]);
  // selections: { [position_id]: candidate_id }  (for contested)
  // yesNo:      { [position_id]: 'yes' | 'no' }  (for uncontested)
  const [selections, setSelections] = useState({});
  const [yesNo, setYesNo]           = useState({});
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [siteEnabled, setSiteEnabled] = useState(true);
  const { voter, voterToken, loginVoter } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
  if (!voter) return; // Wait for store to hydrate
  if (voter.has_voted) { navigate('/success'); return; }
    api.get('/positions')
      .then(({ data }) => { setPositions(data); setLoading(false); })
      .catch(() => { setError('Failed to load ballot. Please refresh.'); setLoading(false); });
  }, [voter]);

  const isUncontested = (pos) => pos.candidates.length === 1;
  const isContested   = (pos) => pos.candidates.length > 1;

  // A position is answered if:
  // - contested: a candidate is selected
  // - uncontested: yes or no is chosen
  const isAnswered = (pos) => {
    if (isUncontested(pos)) return !!yesNo[pos.id];
    return !!selections[pos.id];
  };

  const allAnswered = positions.length > 0 && positions.every(isAnswered);
  const answeredCount = positions.filter(isAnswered).length;

  const handleSubmit = async () => {
    if (!allAnswered) return setError('Please answer every position before submitting.');
    setError('');

    setSubmitting(true);
    try {
      // Regular votes (contested positions, or YES on uncontested)
      const votes = [];
      const no_votes = [];

      for (const pos of positions) {
        if (isUncontested(pos)) {
          if (yesNo[pos.id] === 'yes') {
            votes.push({ position_id: pos.id, candidate_id: pos.candidates[0].id });
          } else {
            no_votes.push(pos.id);
          }
        } else {
          votes.push({ position_id: pos.id, candidate_id: selections[pos.id] });
        }
      }

      await api.post('/votes', { votes, no_votes });
      loginVoter(voterToken, { ...voter, has_voted: true });
      navigate('/success');
    } catch (err) {
      if (err.response?.data?.site_disabled) {
        setSiteEnabled(false);
      } else {
        setError(err.response?.data?.error || 'Failed to submit votes. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!siteEnabled) return <SiteLockedScreen />;
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--gray-600)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗳️</div>
        <p>Loading ballot...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'var(--green-dark)', color: 'white', padding: '28px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6 }}>Your Ballot</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
          Welcome, <strong>{voter?.name}</strong> · {voter?.matric_number}
          {voter?.level && <span> · {voter.level}</span>}
        </p>
        <div style={{ marginTop: 12, display: 'inline-flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.12)', padding: '6px 16px', borderRadius: 999, fontSize: '0.85rem' }}>
          ✓ {answeredCount}/{positions.length} positions answered
        </div>
      </div>

      <div className="page">
        {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

        {positions.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-600)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
            <p>No positions available yet.</p>
          </div>
        )}

        {positions.map((pos) => (
          <div key={pos.id} style={{ marginBottom: 36 }}>
            {/* Position header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.15rem', color: 'var(--green-dark)' }}>
                  {pos.title}
                  {isUncontested(pos) && (
                    <span style={{ marginLeft: 10, fontSize: '0.72rem', background: '#fdf6e3', color: '#c9962a', padding: '3px 10px', borderRadius: 999, fontWeight: 600, verticalAlign: 'middle', border: '1px solid #f0d9a0' }}>
                      UNCONTESTED
                    </span>
                  )}
                </h2>
                {pos.description && <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: 2 }}>{pos.description}</p>}
              </div>
              {isAnswered(pos) && <span className="badge-voted">✓ Done</span>}
            </div>

            {/* Uncontested — YES/NO */}
            {isUncontested(pos) && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 360 }}>
                  <YesNoCard
                    candidate={pos.candidates[0]}
                    value={yesNo[pos.id] || null}
                   onChange={(val) => {
                      setSelections(prev => { const next = {...prev}; delete next[pos.id]; return next; });
                      setYesNo((prev) => ({ ...prev, [pos.id]: val }));
                    }}
                  />
                </div>
              </div>
            )}

            {/* Contested — candidate grid */}
            {isContested(pos) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
                {pos.candidates.map((c) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    selected={selections[pos.id] === c.id}
                    onSelect={() => {
                      setYesNo(prev => { const next = {...prev}; delete next[pos.id]; return next; });
                      setSelections((prev) => ({ ...prev, [pos.id]: c.id }));
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Submit bar */}
        {positions.length > 0 && (
          <div style={{ padding: '20px', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {allAnswered ? '✅ All positions answered — ready to submit!' : `⚠️ ${positions.length - answeredCount} position(s) remaining`}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', marginTop: 2 }}>
                Your votes are final and cannot be changed after submission.
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              style={{ minWidth: 160, padding: '13px 24px', fontSize: '0.95rem' }}
            >
              {submitting ? 'Submitting...' : 'Submit Votes →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
