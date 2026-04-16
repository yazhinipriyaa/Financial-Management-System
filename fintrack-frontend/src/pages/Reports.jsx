import { useState } from 'react';
import { downloadReport } from '../api/reportApi';
import { FileText, Download, Loader2 } from 'lucide-react';
import '../styles/pages.css';

export default function Reports() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const monthNames = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await downloadReport(month, year);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FinTrack_Report_${year}_${String(month).padStart(2, '0')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate report. Make sure you have transactions for this period.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1><FileText size={24} /> Reports</h1>
      </div>

      <div className="glass-card" style={{ padding: 32 }}>
        <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Download size={18} /> Download Monthly Report
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
          Generate a detailed PDF report of your financial activity for any month. 
          The report includes income & expense summary, transaction details, and category breakdown.
        </p>

        <div className="report-controls">
          <div className="form-group">
            <label className="form-label">Month</label>
            <select className="select-field" value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}>
              {monthNames.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <select className="select-field" value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}>
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" onClick={handleDownload} disabled={loading}
                  style={{ marginTop: 'auto' }}>
            {loading ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
            {loading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <div className="glass-card report-preview" style={{ marginTop: 20 }}>
        <FileText size={64} />
        <h3 style={{ marginTop: 12 }}>Preview</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>
          Your report for <strong>{monthNames[month - 1]} {year}</strong> will include:
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginTop: 24, textAlign: 'left'
        }}>
          {[
            { icon: '📊', title: 'Financial Summary', desc: 'Total income, expenses & net balance' },
            { icon: '📋', title: 'Transaction List', desc: 'All transactions with details' },
            { icon: '🏷️', title: 'Category Breakdown', desc: 'Spending by category' },
            { icon: '📅', title: 'Date Range', desc: 'Full month coverage' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: 16, borderRadius: 12,
              background: 'var(--bg-input)', border: '1px solid var(--border-glass)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
