export default function Navbar({ links = [] }) {
  const { voter, admin, master, logoutVoter, logoutAdmin, logoutMaster } = useAuthStore();
  const currentUser = voter || admin || master;
  const navigate = useNavigate();

  const handleLogout = () => {
    if (voter) { logoutVoter(); navigate('/login'); }
    else if (admin) { logoutAdmin(); navigate('/secure-admin'); }
    else if (master) { logoutMaster(); navigate('/master/login'); }
  };

  return (
    <nav className="navbar" style={{ padding: '0 16px', height: 'auto', minHeight: '64px', flexWrap: 'wrap' }}>
      <div className="navbar-brand" style={{ padding: '10px 0' }}>
        NUNSA <span>UNIMED</span>
      </div>
      
      <div className="navbar-actions" style={{ 
        display: 'flex', gap: '8px', alignItems: 'center', 
        padding: '8px 0', flexWrap: 'wrap', justifyContent: 'center' 
      }}>
        {links.map((l) => (
          <button key={l.label} className="btn-ghost" 
            style={{ fontSize: '0.75rem', padding: '6px 10px', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} 
            onClick={() => navigate(l.to)}>
            {l.label}
          </button>
        ))}
        {currentUser && (
          <span className="navbar-user" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            👤 {currentUser.name?.split(' ')[0] || currentUser.username}
          </span>
        )}
        <button className="btn-ghost" 
          style={{ fontSize: '0.75rem', padding: '6px 10px', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} 
          onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}