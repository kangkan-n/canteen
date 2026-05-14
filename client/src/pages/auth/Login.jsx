import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.data);
      toast.success('Welcome back! 🎉');
      const role = res.data.data.user.role;
      navigate(role === 'student' ? '/dashboard' : '/owner/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: 8 }}>🍽️</div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to CanteenHub</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label className="form-label">Email</label>
            <input className="form-input form-control" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group mb-3">
            <label className="form-label">Password</label>
            <input className="form-input form-control" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary w-100 mt-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
