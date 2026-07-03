import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import SiteStatusBanner from '../components/SiteStatusBanner';

// ── Modals ─────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Admin Panel ─────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [tab, setTab] = useState('positions');
  const [positions, setPositions] = useState([]);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Modals
  const [positionModal, setPositionModal] = useState(null);
  const [candidateModal, setCandidateModal] = useState(null);
  const [voterModal, setVoterModal] = useState(false);
  const [bulkModal, setBulkModal] = useState(false);

  const navigate = useNavigate();

  // FIX: Ensure flash only ever receives strings
  const flash = (type, text) => { 
    setMsg({ type, text: typeof text === 'string' ? text : 'An error occurred' }); 
    setTimeout(() => setMsg({ type: '', text: '' }), 3500); 
  };

  const loadData = async () => {
    try {
      const [p, v] = await Promise.all([
        api.get('/positions/admin/all'),
        api.get('/votes/voters'),
      ]);
      setPositions(p.data);
      setVoters(v.data);
    } catch (e) { flash('error', 'Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // ── Position CRUD ─────────────────────────────────────────────────────────

  const PositionModal = () => {
    const editing = positionModal?.mode === 'edit';
    const [form, setForm] = useState(editing ? positionModal.data : { title: '', description: '', display_order: 0 });
    const [saving, setSaving] = useState(false);

    const save = async () => {
      if (!form.title) return flash('error', 'Title is required');
      setSaving(true);
      try {
        if (editing) await api.put(`/positions/${positionModal.data.id}`, form);
        else await api.post('/positions', form);
        flash('success', editing ? 'Position updated' : 'Position created');
        setPositionModal(null);
        loadData();
      } catch (e) { flash('error', e.response?.data?.error || 'Failed to save position'); }
      finally { setSaving(false); }
    };

    return (
      <Modal
        title={editing ? 'Edit Position' : 'Add Position'}
        onClose={() => setPositionModal(null)}
        footer={<>
          <button className="btn-ghost" onClick={() => setPositionModal(null)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Position Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. President" />
          </div>
          <div className="form-group"><label>Description</label>
            <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional short description" />
          </div>
          <div className="form-group"><label>Display Order</label>
            <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
          </div>
        </div>
      </Modal>
    );
  };

  const deletePosition = async (id) => {
    if (!window.confirm('Delete this position and all its candidates? Votes for it will also be removed.')) return;
    try { await api.delete(`/positions/${id}`); flash('success', 'Position deleted'); loadData(); }
    catch (e) { flash('error', e.response?.data?.error || 'Delete failed'); }
  };

  // ── Candidate CRUD ────────────────────────────────────────────────────────

  const CandidateModal = () => {
    const editing = candidateModal?.mode === 'edit';
    const [form, setForm] = useState(editing ? candidateModal.data : { position_id: '', name: '', bio: '' });
    const [photo, setPhoto] = useState(null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef();

    const save = async () => {
      if (!form.name || !form.position_id) return flash('error', 'Name and position are required');
      setSaving(true);
      try {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (photo) fd.append('photo', photo);
        fd.append('removePhoto', removePhoto);

        if (editing) await api.put(`/positions/candidates/${candidateModal.data.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        else await api.post('/positions/candidates', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

        flash('success', editing ? 'Candidate updated' : 'Candidate added');
        setCandidateModal(null);
        loadData();
      } catch (e) { flash('error', e.response?.data?.error || 'Failed to save candidate'); }
      finally { setSaving(false); }
    };

    return (
      <Modal
        title={editing ? 'Edit Candidate' : 'Add Candidate'}
        onClose={() => setCandidateModal(null)}
        footer={<>
          <button className="btn-ghost" onClick={() => setCandidateModal(null)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Position *</label>
            <select value={form.position_id} onChange={e => setForm({ ...form, position_id: e.target.value })}>
              <option value="">Select position…</option>
              {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Full Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Candidate's full name" />
          </div>
          <div className="form-group"><label>Short Bio</label>
            <textarea value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} rows={2} placeholder="e.g. 300L Computer Science" />
          </div>
          <div className="form-group">
            <label>Photo</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={e => { setPhoto(e.target.files[0]); setRemovePhoto(false); }} style={{ border: 'none', padding: 0, background: 'transparent' }} />
            {photo && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>📷 {photo.name}</span>
                <button type="button" className="btn-danger" style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => { setPhoto(null); fileRef.current.value = ''; }}>Remove Selected</button>
              </div>
            )}
            {editing && candidateModal.data.photo_url && !photo && !removePhoto && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={candidateModal.data.photo_url} alt="current" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
                <button type="button" className="btn-danger" style={{ fontSize: '0.78rem', padding: '5px 12px' }} onClick={() => setRemovePhoto(true)}>❌ Remove Photo</button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  const deleteCandidate = async (id) => {
    if (!window.confirm('Remove this candidate?')) return;
    try { await api.delete(`/positions/candidates/${id}`); flash('success', 'Candidate removed'); loadData(); }
    catch (e) { flash('error', e.response?.data?.error || 'Delete failed'); }
  };

  // ── Voter CRUD ─────────────────────────────────────────────────────────────

  const VoterModal = () => {
    const [form, setForm] = useState({ matric_number: '', name: '', level: '' });
    const [saving, setSaving] = useState(false);

    const save = async () => {
      if (!form.matric_number || !form.name) return flash('error', 'Both fields are required');
      setSaving(true);
      try {
        await api.post('/votes/voters', form);
        flash('success', 'Voter added');
        setVoterModal(false);
        loadData();
      } catch (e) { flash('error', e.response?.data?.error || 'Failed to add voter'); }
      finally { setSaving(false); }
    };

    return (
      <Modal
        title="Add Voter"
        onClose={() => setVoterModal(false)}
        footer={<>
          <button className="btn-ghost" onClick={() => setVoterModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Add'}</button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Matric Number</label>
            <input value={form.matric_number} onChange={e => setForm({ ...form, matric_number: e.target.value })} placeholder="NUS/25/0001" />
          </div>
          <div className="form-group"><label>Full Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Student full name" />
          </div>
          <div className="form-group"><label>Level</label>
            <input value={form.level || ''} onChange={e => setForm({ ...form, level: e.target.value })} placeholder="e.g. 300L" />
          </div>
        </div>
      </Modal>
    );
  };

  const BulkVoterModal = () => {
    const [preview, setPreview] = useState([]);
    const [saving, setSaving] = useState(false);

    const parseFile = (f) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const delim = text.includes('\t') ? '\t' : ',';
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const dataLines = lines.slice(1);
        const parsed = dataLines.map(line => {
          const cols = line.split(delim).map(c => c.trim().replace(/^"|"$/g, ''));
          return { matric_number: cols[0] || '', name: cols[1] || '', level: cols[2] || '' };
        }).filter(v => v.matric_number && v.name);
        setPreview(parsed);
      };
      reader.readAsText(f);
    };

    const save = async () => {
      if (!preview.length) return flash('error', 'No valid rows');
      setSaving(true);
      try {
        const { data } = await api.post('/votes/voters/bulk', { voters: preview });
        flash('success', data.message);
        setBulkModal(false);
        loadData();
      } catch (e) { flash('error', 'Bulk import failed'); }
      finally { setSaving(false); }
    };

    return (
      <Modal title="Bulk Import" onClose={() => setBulkModal(false)} footer={<button className="btn-primary" onClick={save} disabled={saving || !preview.length}>{saving ? 'Importing...' : 'Import'}</button>}>
        <input type="file" accept=".csv,.tsv" onChange={e => e.target.files[0] && parseFile(e.target.files[0])} />
      </Modal>
    );
  };

  const deleteVoter = async (id) => {
    if (!window.confirm('Remove this voter?')) return;
    try { await api.delete(`/votes/voters/${id}`); flash('success', 'Voter removed'); loadData(); }
    catch (e) { flash('error', 'Delete failed'); }
  };

  const resetVote = async (id) => {
    if (!window.confirm('Reset this voter\'s vote?')) return;
    try { await api.patch(`/votes/voters/${id}/reset`); flash('success', 'Vote reset'); loadData(); }
    catch (e) { flash('error', 'Reset failed'); }
  };

  const tabStyle = (t) => ({
    padding: '10px 20px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '0.9rem',
    background: tab === t ? 'var(--green)' : 'transparent',
    color: tab === t ? 'white' : 'var(--gray-600)',
    border: tab === t ? 'none' : '1.5px solid var(--gray-200)',
  });
  
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

   return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <Navbar links={[{ label: '📊 Results', to: '/secure-admin/results' }]} />
      <SiteStatusBanner />

      <div className="page-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem' }}>Admin Panel</h1>
          <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
            {voters.filter(v => v.has_voted).length}/{voters.length} voters have voted
          </div>
        </div>
        {msg.text && <div className={msg.type === 'error' ? 'error-msg' : 'success-msg'} style={{ marginBottom: 16 }}>{msg.text}</div>}
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <button style={tabStyle('positions')} onClick={() => setTab('positions')}>📋 Positions & Candidates</button>
          <button style={tabStyle('voters')} onClick={() => setTab('voters')}>👥 Voters ({voters.length})</button>
        </div>

        {/* ── Positions Tab ── */}
        {tab === 'positions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem' }}>Positions</h2>
              <div style={{ display: 'flex', gap: 10 }}>

                <button className="btn-primary" onClick={() => setCandidateModal({ mode: 'add' })} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Add Candidate</button>
                <button className="btn-primary" onClick={() => setPositionModal({ mode: 'add' })} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Add Position</button>
              </div>
            </div>

            {positions.length === 0 && (
              <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--gray-600)' }}>
                No positions yet. Add your first position above.
              </div>
            )}

            {positions.map(pos => (
              <div key={pos.id} className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', background: 'var(--green-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)' }}>
                  <div>
                    <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: 'var(--green-dark)' }}>{pos.title}</span>
                    {pos.description && <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginLeft: 10 }}>{pos.description}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => setPositionModal({ mode: 'edit', data: pos })}>Edit</button>
                    <button className="btn-danger" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => deletePosition(pos.id)}>Delete</button>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  {pos.candidates.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>No candidates yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>

                      {pos.candidates.map(c => (

                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', minWidth: 200 }}>

                          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'var(--gray-200)', flexShrink: 0 }}>

                            {c.photo_url ? <img src={c.photo_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>}

                          </div>

                          <div style={{ flex: 1 }}>

                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.name}</div>

                            {c.bio && <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{c.bio}</div>}

                          </div>

                          <div style={{ display: 'flex', gap: 6 }}>

                            <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 8px' }} onClick={() => setCandidateModal({ mode: 'edit', data: c })}>Edit</button>

                            <button className="btn-danger" style={{ fontSize: '0.75rem', padding: '4px 8px' }} onClick={() => deleteCandidate(c.id)}>✕</button>

                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}


        {/* ── Voters Tab ── */}

        {tab === 'voters' && (

          <div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>

              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem' }}>Voter Registry</h2>

              <div style={{ display: 'flex', gap: 10 }}>

                <button className="btn-ghost" onClick={() => setBulkModal(true)} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>📥 Bulk Import</button>

                <button className="btn-primary" onClick={() => setVoterModal(true)} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Add Voter</button>

              </div>

            </div>


            <div className="card" style={{ overflow: 'auto' }}>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>

                <thead>

                  <tr style={{ borderBottom: '2px solid var(--gray-200)', background: 'var(--gray-100)' }}>

                    {['Matric Number', 'Name', 'Level', 'Status', 'Actions'].map(h => (

                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 600, color: 'var(--gray-600)', fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>

                    ))}

                  </tr>

                </thead>

                <tbody>

                  {voters.map((v, i) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--gray-100)', background: i % 2 === 0 ? 'white' : 'var(--off-white)' }}>
                      <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: '0.88rem', color: 'var(--green-dark)', fontWeight: 600 }}>{v.matric_number}</td>
                      <td style={{ padding: '11px 16px', fontSize: '0.9rem' }}>{v.name}</td>
                      <td style={{ padding: '11px 16px', fontSize: '0.85rem', color: 'var(--gray-600)' }}>{v.level || '—'}</td>
                      <td style={{ padding: '11px 16px' }}>
                        {v.has_voted
                          ? <span className="badge-voted">✓ Voted</span>
                          : <span style={{ color: 'var(--gray-400)', fontSize: '0.82rem' }}>Pending</span>}
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {v.has_voted && (
                            <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '5px 10px', color: 'var(--gold)' }} onClick={() => resetVote(v.id)}>Reset</button>
                          )}
                          <button className="btn-danger" style={{ fontSize: '0.75rem', padding: '5px 10px' }} onClick={() => deleteVoter(v.id)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {voters.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>No voters registered yet.</div>}
            </div>
          </div>
        )}
      </div>
      {positionModal && <PositionModal />}
      {candidateModal && <CandidateModal />}
      {voterModal && <VoterModal />}
      {bulkModal && <BulkVoterModal />}
    </div>

  );

}