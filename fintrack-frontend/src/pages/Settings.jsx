import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateProfile } from '../api/authApi';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, User, Palette, Shield, Sun, Moon, Loader2 } from 'lucide-react';
import '../styles/pages.css';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    currency: user?.currency || 'INR',
  });
  const [saving, setSaving] = useState(false);

  const currencies = [
    { code: 'INR', name: 'Indian Rupee (₹)' },
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile({ fullName: form.fullName, currency: form.currency });
      updateUser({ ...user, fullName: res.data.fullName, currency: res.data.currency });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1><SettingsIcon size={24} /> Settings</h1>
      </div>

      {/* Profile */}
      <div className="settings-section glass-card">
        <h3><User size={18} /> Profile Information</h3>
        <div className="settings-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="input-field" value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="input-field" value={form.email} disabled
              style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="select-field" value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn-primary" style={{ marginTop: 20 }} onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="spin" /> : null}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Appearance */}
      <div className="settings-section glass-card">
        <h3><Palette size={18} /> Appearance</h3>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <button
            className={`glass-card ${theme === 'dark' ? '' : ''}`}
            onClick={() => theme !== 'dark' && toggleTheme()}
            style={{
              padding: '20px 28px', cursor: 'pointer', textAlign: 'center',
              border: theme === 'dark' ? '2px solid var(--accent-1)' : '1px solid var(--border-glass)',
              borderRadius: 12, background: '#0a0f1e', minWidth: 140,
            }}
          >
            <Moon size={24} style={{ color: '#94a3b8', marginBottom: 8 }} />
            <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem' }}>Dark</div>
          </button>
          <button
            className={`glass-card`}
            onClick={() => theme !== 'light' && toggleTheme()}
            style={{
              padding: '20px 28px', cursor: 'pointer', textAlign: 'center',
              border: theme === 'light' ? '2px solid var(--accent-1)' : '1px solid var(--border-glass)',
              borderRadius: 12, background: '#f0f4f8', minWidth: 140,
            }}
          >
            <Sun size={24} style={{ color: '#475569', marginBottom: 8 }} />
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>Light</div>
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="settings-section glass-card">
        <h3><Shield size={18} /> Security</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
          Your account is secured with encrypted password storage (BCrypt).
        </p>
        <div style={{
          padding: '12px 16px', borderRadius: 8,
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
          color: 'var(--income)', fontSize: '0.85rem', fontWeight: 500,
        }}>
          ✅ Account is secure
        </div>
      </div>
    </div>
  );
}
