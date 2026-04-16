import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getTransactions, createTransaction, updateTransaction, deleteTransaction
} from '../api/transactionApi';
import { getCategories } from '../api/categoryApi';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, ArrowLeftRight, Loader2 } from 'lucide-react';
import '../styles/pages.css';

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    description: '', amount: '', type: 'EXPENSE',
    transactionDate: new Date().toISOString().split('T')[0],
    categoryId: '', isRecurring: false, recurrencePeriod: '',
  });

  useEffect(() => { fetchData(); }, [page, filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        getTransactions({ page, size: 10, type: filter || undefined }),
        getCategories(),
      ]);
      setTransactions(txRes.data.content || []);
      setTotalPages(txRes.data.totalPages || 0);
      setCategories(catRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditData(null);
    setForm({
      description: '', amount: '', type: 'EXPENSE',
      transactionDate: new Date().toISOString().split('T')[0],
      categoryId: '', isRecurring: false, recurrencePeriod: '',
    });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditData(t);
    setForm({
      description: t.description || '', amount: t.amount,
      type: t.type, transactionDate: t.transactionDate,
      categoryId: t.categoryId || '', isRecurring: t.isRecurring || false,
      recurrencePeriod: t.recurrencePeriod || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
    };
    setSubmitting(true);
    try {
      if (editData) {
        await updateTransaction(editData.id, payload);
        toast.success('Transaction updated!');
      } else {
        await createTransaction(payload);
        toast.success('Transaction added!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const filteredCategories = categories.filter(c =>
    !form.type || c.type === form.type
  );

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1><ArrowLeftRight size={24} /> Transactions</h1>
        <button className="btn-primary" onClick={openAdd} id="add-transaction-btn">
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      <div className="filters-bar">
        {['', 'INCOME', 'EXPENSE'].map((f) => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => { setFilter(f); setPage(0); }}
          >
            {f === '' ? 'All' : f === 'INCOME' ? '💰 Income' : '💸 Expense'}
          </button>
        ))}
      </div>

      <div className="transaction-table-card glass-card">
        {loading ? (
          <div className="loader-container"><div className="loader" /></div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <ArrowLeftRight size={48} />
            <h3>No transactions found</h3>
            <p>Start by adding your first transaction</p>
          </div>
        ) : (
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.transactionDate}</td>
                  <td>{t.description || '-'}</td>
                  <td>
                    <div className="category-cell">
                      <span className="category-dot" style={{ background: t.categoryColor || '#6366f1' }} />
                      {t.categoryName || 'Uncategorized'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${t.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`amount-cell ${t.type?.toLowerCase()}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn-icon" onClick={() => openEdit(t)} title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button className="btn-icon" onClick={() => handleDelete(t.id)} title="Delete"
                              style={{ color: 'var(--expense)' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
              <button key={i}
                className={page === i ? 'active' : ''}
                onClick={() => setPage(i)}
              >{i + 1}</button>
            ))}
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editData ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="select-field" value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value, categoryId: '' })}>
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input type="number" step="0.01" className="input-field"
                    placeholder="Enter amount" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input type="text" className="input-field"
                    placeholder="What was this for?" value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="select-field" value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">Select category</option>
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="input-field" value={form.transactionDate}
                    onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
                    required />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isRecurring}
                      onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} />
                    <span className="form-label" style={{ margin: 0 }}>Recurring Transaction</span>
                  </label>
                </div>
                {form.isRecurring && (
                  <div className="form-group">
                    <label className="form-label">Recurrence Period</label>
                    <select className="select-field" value={form.recurrencePeriod}
                      onChange={(e) => setForm({ ...form, recurrencePeriod: e.target.value })}>
                      <option value="">Select period</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="spin" /> : null}
                  {submitting ? 'Saving...' : (editData ? 'Update' : 'Add') + ' Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
