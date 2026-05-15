import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../services/api';
import toast from 'react-hot-toast';

const Register = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    rollNumber: '',
    department: '',
    canteenName: '',
    canteenLocation: '',
    role: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size must be less than 5MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setForm({ ...form, photoBase64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data.data);
      toast.success(res.data.message);
      const role = res.data.data.user.role;
      if (role === 'student') navigate('/verify');
      else navigate('/owner/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Step 1: Select Role
  if (step === 1) {
    return (
      <div className="auth-container">
        <div className="auth-card fade-in" style={{ maxWidth: 500 }}>
          <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: 8 }}>🍽️</div>
          <h1 className="auth-title">Join CanteenHub</h1>
          <p className="auth-subtitle">Select your account type</p>
          
          <div style={{ display: 'grid', gap: 16, marginTop: 32 }}>
            {/* Student */}
            <div
              onClick={() => handleRoleSelect('student')}
              style={{
                padding: 20,
                border: '2px solid var(--border)',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👨‍🎓</div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Student</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Register to browse menus and place orders
              </p>
            </div>

            {/* Canteen Owner */}
            <div
              onClick={() => handleRoleSelect('canteenOwner')}
              style={{
                padding: 20,
                border: '2px solid var(--border)',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👨‍💼</div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Canteen Owner</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Manage menus and handle student orders
              </p>
            </div>

          </div>

          <p style={{ textAlign: 'center', marginTop: 32, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Fill Details
  return (
    <div className="auth-container">
      <div className="auth-card fade-in" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <button
            onClick={() => setStep(1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              marginRight: 12
            }}
          >
            ← Back
          </button>
          <div>
            <h1 className="auth-title" style={{ margin: 0 }}>
              {form.role === 'student' ? 'Student Registration' : 'Owner Registration'}
            </h1>
            <p className="auth-subtitle" style={{ margin: '4px 0 0 0' }}>
              {form.role === 'student' ? '👨‍🎓' : '👨‍💼'} {form.role.charAt(0).toUpperCase() + form.role.slice(1)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Common Fields */}
          <div className="form-group mb-3">
            <label className="form-label">Full Name *</label>
            <input
              className="form-input form-control"
              placeholder="John Doe"
              value={form.name}
              onChange={set('name')}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Email *</label>
            <input
              className="form-input form-control"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Password *</label>
            <input
              className="form-input form-control"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input form-control"
              placeholder="9876543210"
              value={form.phone}
              onChange={set('phone')}
            />
          </div>

          {/* Student-specific Fields */}
          {form.role === 'student' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group mb-3">
                    <label className="form-label">Roll Number *</label>
                    <input
                      className="form-input form-control"
                      placeholder="CS2023001"
                      value={form.rollNumber}
                      onChange={set('rollNumber')}
                      required
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label">Department *</label>
                    <input
                      className="form-input form-control"
                      placeholder="Computer Science"
                      value={form.department}
                      onChange={set('department')}
                      required
                    />
                  </div>
              </div>

              {/* Photo Upload for Verification */}
              <div className="form-group mb-3">
                <label className="form-label">Verification Photo *</label>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Upload a clear photo of your ID card or student badge for verification
                </p>
                
                {photoPreview ? (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      borderRadius: 8,
                      overflow: 'hidden',
                      marginBottom: 8
                    }}
                  >
                    <img
                      src={photoPreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 8
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setForm({ ...form, photoBase64: null });
                      }}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <label
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: 16,
                      border: '2px dashed var(--border)',
                      borderRadius: 8,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: 'var(--bg-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = 'rgba(66, 153, 225, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📸</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      required
                      style={{ display: 'none' }}
                    />
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      Click to upload or drag and drop
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      PNG, JPG, GIF up to 5MB
                    </div>
                  </label>
                )}
              </div>
            </>
          )}

          {/* Canteen Owner-specific Fields */}
          {form.role === 'canteenOwner' && (
            <>
              <div className="form-group mb-3">
                <label className="form-label">Canteen Name *</label>
                <input
                  className="form-input form-control"
                  placeholder="XYZ Canteen"
                  value={form.canteenName}
                  onChange={set('canteenName')}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Location *</label>
                <input
                  className="form-input form-control"
                  placeholder="Building A, Ground Floor"
                  value={form.canteenLocation}
                  onChange={set('canteenLocation')}
                  required
                />
              </div>
            </>
          )}

          <button
            className="btn btn-primary w-100 mt-3"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
