import { useState, useEffect } from 'react';
import { getPendingStudents, getAllStudents } from '../../services/api';

const VerifyStudents = () => {
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getPendingStudents(), getAllStudents()])
      .then(([p, a]) => { setPending(p.data.data.students); setAll(a.data.data.students); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const list = tab === 'pending' ? pending : all;

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Student Verification</h1><p>View tokens for students who need verification</p></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn btn-sm ${tab === 'pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('pending')}>⏳ Pending ({pending.length})</button>
        <button className={`btn btn-sm ${tab === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('all')}>👥 All Students ({all.length})</button>
      </div>
      {loading ? <div className="loader"><div className="spinner"></div></div> : list.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">✅</div><h3>{tab === 'pending' ? 'No pending verifications' : 'No students registered'}</h3></div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead><tr><th>Image</th><th>Name</th><th>Email</th><th>Roll No</th><th>Dept</th><th>Phone</th>{tab === 'pending' && <th>Token</th>}<th>Status</th><th>Registered</th></tr></thead>
            <tbody>
              {list.map(s => (
                <tr key={s._id}>
                  <td><img src={s.image} alt={s.name} style={{ width: 40, height: 40, borderRadius: '50%' }} /></td>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.email}</td>
                  <td>{s.rollNumber || '-'}</td>
                  <td>{s.department || '-'}</td>
                  <td>{s.phone || '-'}</td>
                  {tab === 'pending' && <td><span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: 6 }}>{s.verificationToken}</span></td>}
                  <td><span className={`badge ${s.isVerified ? 'badge-success' : 'badge-warning'}`}>{s.isVerified ? '✅ Verified' : '⏳ Pending'}</span></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VerifyStudents;
