import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(form);
      updateUser(res.data.data.user);
      toast.success('Profile updated');
    } catch (err) { toast.error('Failed to update profile'); }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Profile</h1><p>Manage your account</p></div>
      <div className="grid-2">
        <div className="glass-card">
          <h3 style={{ marginBottom: 20 }}>Edit Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3"><label className="form-label">Name</label><input className="form-input form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group mb-3"><label className="form-label">Phone</label><input className="form-input form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-group mb-3"><label className="form-label">Department</label><input className="form-input form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
        <div className="glass-card">
          <h3 style={{ marginBottom: 20 }}>Account Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Email</span><p>{user?.email}</p></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Role</span><p style={{ textTransform: 'capitalize' }}>{user?.role}</p></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Roll Number</span><p>{user?.rollNumber || '-'}</p></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verification Status</span><p><span className={`badge ${user?.isVerified ? 'badge-success' : 'badge-warning'}`}>{user?.isVerified ? '✅ Verified' : '⏳ Not Verified'}</span></p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
