export default function VerificationPage() {
  const [matric, setMatric] = useState('');
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchVoter = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/auth/voters/verify/${matric.toUpperCase()}`);
      setVoter(data);
    } catch (e) { alert('Voter not found'); }
    finally { setLoading(false); }
  };

  const markVerified = async () => {
    await api.patch(`/auth/voters/verify/${matric.toUpperCase()}`);
    alert('Voter verified! They can now log in.');
    setVoter(null);
    setMatric('');
  };

  return (
    <div className="page">
      <h1>Voter Accreditation</h1>
      <input value={matric} onChange={e => setMatric(e.target.value)} placeholder="Enter Matric" />
      <button onClick={searchVoter}>Search</button>

      {voter && (
        <div className="card">
          <p><strong>Name:</strong> {voter.name}</p>
          <p><strong>Level:</strong> {voter.level}</p>
          <button onClick={markVerified} disabled={voter.verified}>
            {voter.verified ? 'Already Verified' : 'Verify & Accredit'}
          </button>
        </div>
      )}
    </div>
  );
}