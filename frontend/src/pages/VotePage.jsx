import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import SiteLockedScreen from '../components/SiteLockedScreen';

// ── Candidate card ────────────────────────────────
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
      width: '100%',
      maxWidth: '220px',
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

      <div style={{
        width: 88, height: 88, borderRadius: '50%', overflow: 'hidden',
        background: 'var(--gray-100)', flexShrink: 0,
        border: `3px solid ${selected ? 'var(--green)' : 'var(--gray-200)'}`,
      }}>
        {candidate.photo_url
          ? <img src={candidate.photo_url} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>👤</div>}
      </div>

      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: selected ? 'var(--green-dark)' : 'var(--gray-800)' }}>
          {candidate.name}
        </div>
        {candidate.bio && (
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)', marginTop: 4, lineHeight: 1.4 }}>{candidate.bio}</div>
        )}
      </div>

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
        {selected ? '✓ Selected' : 'Vote'}
      </button>
    </div>
  );
}

// ── Yes/No widget ────────────────────────────────
function YesNoCard({ candidate, value, onChange }) {
  return (
    <div style={{
      border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)',
      background: 'var(--white)', padding: '24px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      boxShadow: 'var(--shadow-sm)',
    }}>
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
          YES
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
          NO
        </button>
      </div>
    </div>
  );
}

// ── Main VotePage ────────────────────────────────
export default function VotePage() {
  const [positions, setPositions] = useState([]);
  const [selections, setSelections] = useState({});
  const [yesNo, setYesNo]           = useState({});
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [siteEnabled, setSiteEnabled] = useState(true);
  const { voter, voterToken, loginVoter } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!voter) return;
    if (voter.has_voted) { navigate('/success'); return; }
    api.get('/positions')
      .then(({ data }) => { setPositions(data); setLoading(false); })
      .catch(() => { setError('Failed to load ballot.'); setLoading(false); });
  }, [voter]);

  const isUncontested = (pos) => pos.candidates.length === 1;
  const isContested   = (pos) => pos.candidates.length > 1;
  const isAnswered = (pos) => isUncontested(pos) ? !!yesNo[pos.id] : !!selections[pos.id];

  const allAnswered = positions.length > 0 && positions.every(isAnswered);
  const answeredCount = positions.filter(isAnswered).length;

  const handleSubmit = async () => {
    if (!allAnswered) return setError('Please answer every position.');
    setSubmitting(true);
    try {
      const votes = [];
      const no_votes = [];
      for (const pos of positions) {
        if (isUncontested(pos)) {
          yesNo[pos.id] === 'yes' ? votes.push({ position_id: pos.id, candidate_id: pos.candidates[0].id }) : no_votes.push(pos.id);
        } else {
          votes.push({ position_id: pos.id, candidate_id: selections[pos.id] });
        }
      }
      await api.post('/votes', { votes, no_votes });
      loginVoter(voterToken, { ...voter, has_voted: true });
      navigate('/success');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!siteEnabled) return <SiteLockedScreen />;
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <Navbar />
      <div style={{ background: 'var(--green-dark)', color: 'white', padding: '28px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem' }}>Your Ballot</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>Welcome, {voter?.name}</p>
        <div style={{ marginTop: 12, display: 'inline-flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.12)', padding: '6px 16px', borderRadius: 999, fontSize: '0.85rem' }}>
          ✓ {answeredCount}/{positions.length} positions answered
        </div>
      </div>

      <div className="page">
        {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}
        {positions.map((pos) => (
          <div key={pos.id} style={{ marginBottom: 48, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: 880, textAlign: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.25rem', color: 'var(--green-dark)' }}>
                {pos.title} {isUncontested(pos) && <span style={{ fontSize: '0.72rem', background: '#fdf6e3', color: '#c9962a', padding: '3px 10px', borderRadius: 999 }}>UNCONTESTED</span>}
              </h2>
              {pos.description && <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: 4 }}>{pos.description}</p>}
            </div>

            {isUncontested(pos) ? (
              <div style={{ width: '100%', maxWidth: 360 }}>
                <YesNoCard candidate={pos.candidates[0]} value={yesNo[pos.id]} onChange={(val) => { setSelections(p => { const n={...p}; delete n[pos.id]; return n; }); setYesNo(p => ({...p, [pos.id]: val })); }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, width: '100%', maxWidth: 880 }}>
                {pos.candidates.map((c) => (
                  <CandidateCard key={c.id} candidate={c} selected={selections[pos.id] === c.id} onSelect={() => { setYesNo(p => { const n={...p}; delete n[pos.id]; return n; }); setSelections(p => ({...p, [pos.id]: c.id })); }} />
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={{ padding: '20px', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{allAnswered ? '✅ Ready to submit!' : `⚠️ ${positions.length - answeredCount} remaining`}</p>
          </div>
          <button className="btn-primary" onClick={handleSubmit} disabled={!allAnswered || submitting} style={{ minWidth: 160, padding: '13px 24px' }}>
            {submitting ? 'Submitting...' : 'Submit Votes →'}
          </button>
        </div>
      </div>
    </div>
  );
}