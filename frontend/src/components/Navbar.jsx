import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Navbar({ links = [] }) {
  const { voter, admin, master, logoutVoter, logoutAdmin, logoutMaster } = useAuthStore();
  const currentUser = voter || admin || master;
  const navigate = useNavigate();

  const handleLogout = () => {
    if (voter) {
      logoutVoter();
      navigate('/login');
    } else if (admin) {
      logoutAdmin();
      navigate('/secure-admin');
    } else if (master) {
      logoutMaster();
      navigate('/master/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        NUNSA <span>UNIMED</span>
      </div>
      <div className="navbar-actions">
        {links.map((l) => (
          <button key={l.label} className="btn-ghost" style={{ fontSize: '0.85rem', padding: '7px 14px' }} onClick={() => navigate(l.to)}>
            {l.label}
          </button>
        ))}
        {currentUser && <span className="navbar-user">👤 {currentUser.name || currentUser.username}</span>}
        <button className="btn-ghost" style={{ fontSize: '0.85rem', padding: '7px 14px' }} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
