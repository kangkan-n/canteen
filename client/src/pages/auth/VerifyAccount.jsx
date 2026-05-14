import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { verifyAccount } from '../../services/api';
import toast from 'react-hot-toast';

const VerifyAccount = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  if (user?.isVerified) {
    navigate('/dashboard');
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyAccount({ token });
      updateUser({ isVerified: true });
      toast.success('Account verified! You can now place orders 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in" style={{ maxWidth: 480 }}>
        <div className="verify-container">
          <div className="verify-icon">🔐</div>
          <h1 className="auth-title">Verify Your Account</h1>
          <p className="auth-subtitle" style={{ marginBottom: 12 }}>
            Visit the canteen and ask the owner for your verification token. Enter it below to complete your registration.
          </p>
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-sm)', padding: '14px', marginBottom: 24 }}>
            <p style={{ color: 'var(--primary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              📋 <strong>Steps:</strong><br/>
              1. Go to the canteen in person<br/>
              2. Ask the owner: "I just registered, can I get my token?"<br/>
              3. The owner will give you a 6-digit code<br/>
              4. Enter it below to activate your account
            </p>
          </div>
          <form onSubmit={handleVerify}>
            <div className="form-group mb-3">
              <input className="form-input form-control verify-token-input" type="text" placeholder="000000" value={token} onChange={e => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} required />
            </div>
            <button className="btn btn-primary w-100" disabled={loading || token.length < 6}>
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
