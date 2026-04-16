import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../api/authApi';
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import '../styles/auth.css';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await registerApi({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      loginUser(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="auth-card">
        <div className="auth-logo">
          <h1>💎 FinTrack</h1>
          <p>Create your free account</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <User />
              <input
                type="text"
                name="fullName"
                className="input-field"
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                required
                id="register-name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail />
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                id="register-email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock />
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                id="register-password"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper">
              <Lock />
              <input
                type="password"
                name="confirmPassword"
                className="input-field"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                id="register-confirm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
            id="register-submit"
          >
            {loading ? <Loader2 size={20} className="spin" /> : null}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
