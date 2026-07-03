import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import useAuthStore from '../store/authStore';

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: '#13161d', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 'var(--radius)', padding: '20px 22px', flex: 1, minWidth: 150,
    }}>
      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: accent || 'white' }}>{value}</div>
    </div>
  );
}

export default function MasterDashboard() {
  const [stats, setStats] = useState(null);
  const [siteEnabled, setSiteEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [msg, setMsg] = useState('');
  const { master, logoutMaster } = useAuthStore();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [statsRes, statusRes] = await Promise.all([
        api.get('/master/stats'),
        api.get('/master/site-status'),
      ]);
      setStats(statsRes.data);
      setSiteEnabled(statusRes.data.site_enabled);
    } catch (e) {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleSite = async () => {
    const next = !siteEnabled;
    const action = next ? 'ENABLE' : 'SHUT DOWN';
    if (!window.confirm(`Are you sure you want to ${action} the entire site? ${!next ? 'Voters will be unable to log in or vote until you turn it back on.' : ''}`)) return;

    setToggling(true);
    try {
      await api.put('/master/site-status', { enabled: next });
      setSiteEnabled(next);
      setMsg(next ? '✅ Site is now LIVE' : '🔴 Site has been shut down');
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {
      setMsg('Failed to update site status');
    } finally {
      setToggling(false);
    }
  };

  if (loading || !stats) return (
    <div style={{ minHeight: '100vh', background: '#0a0c10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      Loading control panel...
    </div>
  );
  return (
    <div style={{ minHeight: '100vh', background: '#0a0c10' }}>
      <div style={{ padding: '18px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.15rem', color: 'white' }}>
          👑 Master Control
        </span>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>{master?.email}</span>
          <button
            onClick={() => { logoutMaster(); navigate('/master/login'); }}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', padding: '7px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{
          background: siteEnabled ? 'rgba(26,107,58,0.1)' : 'rgba(220,38,38,0.1)',
          border: `1px solid ${siteEnabled ? 'rgba(26,107,58,0.35)' : 'rgba(220,38,38,0.35)'}`,
          borderRadius: 'var(--radius)', padding: '24px 26px', marginBottom: 28,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: siteEnabled ? '#2d8a52' : '#dc2626',
                boxShadow: siteEnabled ? '0 0 8px #2d8a52' : '0 0 8px #dc2626',
              }} />
              <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.05rem', color: 'white' }}>
                Site is currently {siteEnabled ? 'LIVE' : 'SHUT DOWN'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', maxWidth: 480 }}>
              {siteEnabled
                ? 'Voters can log in and submit votes. Admins can manage candidates and positions normally.'
                : 'Voters cannot log in or vote. Admins can still log in and see a notice that voting is closed.'}
            </p>
          </div>
          <button
            onClick={toggleSite}
            disabled={toggling}
            style={{
              padding: '13px 26px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.92rem',
              background: siteEnabled ? '#dc2626' : '#1a6b3a', color: 'white', minWidth: 200, border: 'none', cursor: toggling ? 'not-allowed' : 'pointer',
            }}
          >
            {toggling ? 'Updating...' : siteEnabled ? '🔴 Shut Down Site' : '🟢 Bring Site Back Live'}
          </button>
        </div>

        {msg && (
          <div style={{ marginBottom: 24, padding: '10px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '0.88rem' }}>
            {msg}
          </div>
        )}

        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>
          OVERVIEW
        </h2>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
          <StatCard label="Total Voters Registered" value={stats.total_voters} />
          <StatCard label="Votes Cast" value={stats.votes_cast} accent="#2d8a52" />
          <StatCard label="Turnout" value={`${stats.turnout_pct}%`} accent="#c9962a" />
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <StatCard label="Positions" value={stats.total_positions} />
          <StatCard label="Candidates" value={stats.total_candidates} />
          <StatCard label="Admin Accounts" value={stats.total_admins} />
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/secure-admin" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}>
            → Go to Admin Panel
          </a>
          <a href="/secure-admin/results" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}>
            → View Live Results
          </a>
        </div>
      </div>
    </div>
  );
}
