import { useState, useEffect } from 'react';
import {
  getCategories, createCategory, updateCategory, deleteCategory
} from '../api/categoryApi';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import '../styles/pages.css';

const ICONS = ['💰','💻','📈','🎁','🍔','🚗','🛒','🎬','💡','🏥','📚','🏠','✈️','🎮','👗','💊','🐾','🎵','📱','⚽'];
const COLORS = ['#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#10b981','#14b8a6','#06b6d4','#3b82f6','#6366f1','#8b5cf6','#a855f7','#ec4899','#78716c'];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ name: '', type: 'EXPENSE', icon: '📁', color: '#6366f1' });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditData(null);
    setForm({ name: '', type: 'EXPENSE', icon: '📁', color: '#6366f1' });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditData(c);
    setForm({ name: c.name, type: c.type, icon: c.icon, color: c.color });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await updateCategory(editData.id, form);
      } else {
        await createCategory(form);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) { alert('Cannot delete: category may have transactions'); }
  };

  const filtered = filter ? categories.filter(c => c.type === filter) : categories;

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1><Tag size={24} /> Categories</h1>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="filters-bar">
        {['', 'INCOME', 'EXPENSE'].map((f) => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>
            {f === '' ? 'All' : f === 'INCOME' ? '💰 Income' : '💸 Expense'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loader-container"><div className="loader" /></div>
      ) : (
        <div className="cards-grid">
          {filtered.map((c) => (
            <div key={c.id} className="category-card glass-card">
              <div className="category-card-icon"
                   style={{ background: `${c.color}20`, color: c.color }}>
                {c.icon}
              </div>
              <div className="category-card-info">
                <div className="name">{c.name}</div>
                <span className={`badge type-badge ${c.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                  {c.type}
                </span>
              </div>
              <div className="category-card-actions">
                <button className="btn-icon" onClick={() => openEdit(c)}><Edit2 size={15} /></button>
                <button className="btn-icon" onClick={() => handleDelete(c.id)}
                        style={{ color: 'var(--expense)' }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editData ? 'Edit Category' : 'New Category'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" className="input-field" placeholder="Category name"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="select-field" value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ICONS.map((icon) => (
                      <button key={icon} type="button"
                        style={{
                          width: 40, height: 40, fontSize: '1.2rem',
                          borderRadius: 8, border: form.icon === icon ? '2px solid var(--accent-1)' : '1px solid var(--border-glass)',
                          background: form.icon === icon ? 'rgba(6,182,212,0.1)' : 'var(--bg-input)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        onClick={() => setForm({ ...form, icon })}
                      >{icon}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {COLORS.map((color) => (
                      <button key={color} type="button"
                        style={{
                          width: 32, height: 32, borderRadius: '50%', background: color,
                          border: form.color === color ? '3px solid var(--text-primary)' : '2px solid transparent',
                          cursor: 'pointer', transition: 'transform 0.15s',
                          transform: form.color === color ? 'scale(1.2)' : 'scale(1)',
                        }}
                        onClick={() => setForm({ ...form, color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editData ? 'Update' : 'Create'} Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
