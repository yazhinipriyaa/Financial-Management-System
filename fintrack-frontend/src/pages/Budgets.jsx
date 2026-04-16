import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBudgets, createOrUpdateBudget, deleteBudget } from '../api/budgetApi';
import { getCategories } from '../api/categoryApi';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Target } from 'lucide-react';
import '../styles/pages.css';

export default function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({ categoryId: '', limitAmount: '', month, year });

  useEffect(() => { fetchData(); }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        getBudgets(month, year),
        getCategories('EXPENSE'),
      ]);
      setBudgets(bRes.data || []);
      setCategories(cRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOrUpdateBudget({
        categoryId: parseInt(form.categoryId),
        limitAmount: parseFloat(form.limitAmount),
        month, year,
      });
      toast.success('Budget saved!');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await deleteBudget(id);
      toast.success('Budget deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete budget');
    }
  };

  const getColor = (pct) => {
    if (pct >= 100) return '#ef4444';
    if (pct >= 75) return '#f59e0b';
    return '#10b981';
  };

  const monthNames = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1><Target size={24} /> Budgets</h1>
        <button className="btn-primary" onClick={() => {
          setForm({ categoryId: '', limitAmount: '', month, year });
          setShowModal(true);
        }}>
          <Plus size={18} /> Set Budget
        </button>
      </div>

      <div className="filters-bar">
        <select className="select-field" style={{ width: 'auto' }} value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}>
          {monthNames.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select className="select-field" style={{ width: 'auto' }} value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}>
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loader-container"><div className="loader" /></div>
      ) : budgets.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: 60 }}>
          <Target size={48} />
          <h3>No budgets set</h3>
          <p>Create a monthly budget to track your spending limits</p>
        </div>
      ) : (
        <div className="cards-grid">
          {budgets.map((b) => {
            const pct = b.percentUsed || 0;
            const color = getColor(pct);
            return (
              <div key={b.id} className="budget-card glass-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="category-card-icon"
                       style={{ background: `${b.categoryColor || '#6366f1'}20` }}>
                    {b.categoryIcon || '📁'}
                  </div>
                  <div className="budget-info">
                    <div className="name">{b.categoryName}</div>
                  </div>
                  <button className="btn-icon" onClick={() => handleDelete(b.id)}
                          style={{ color: 'var(--expense)', marginLeft: 'auto' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="budget-progress-bar">
                  <div className="budget-progress-fill"
                    style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                </div>
                <div className="amounts" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {formatCurrency(b.spentAmount || 0, user?.currency)} / {formatCurrency(b.limitAmount, user?.currency)}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                {pct >= 100 && (
                  <div style={{
                    marginTop: 8, padding: '6px 10px', borderRadius: 6,
                    background: 'var(--expense-bg)', color: 'var(--expense)',
                    fontSize: '0.78rem', fontWeight: 600, textAlign: 'center'
                  }}>
                    ⚠️ Over budget!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Set Budget</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="select-field" value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                    <option value="">Select expense category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Limit ({user?.currency})</label>
                  <input type="number" step="1" className="input-field"
                    placeholder="e.g. 5000" value={form.limitAmount}
                    onChange={(e) => setForm({ ...form, limitAmount: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Set Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
