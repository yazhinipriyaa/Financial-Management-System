import { formatCurrency } from '../../utils/formatCurrency';

export default function BudgetProgressChart({ budgets, currency }) {
  if (!budgets || budgets.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '30px 20px' }}>
        <p>No budgets set for this month</p>
      </div>
    );
  }

  const getColor = (percent) => {
    if (percent >= 100) return '#ef4444';
    if (percent >= 75) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {budgets.map((b) => {
        const pct = Math.min(b.percentUsed || 0, 100);
        const color = getColor(b.percentUsed || 0);
        return (
          <div key={b.id} style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{b.categoryIcon || '📁'}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {b.categoryName}
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {(b.percentUsed || 0).toFixed(0)}%
              </span>
            </div>
            <div className="budget-progress-bar">
              <div
                className="budget-progress-fill"
                style={{
                  width: `${pct}%`,
                  background: color,
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {formatCurrency(b.spentAmount || 0, currency)} spent
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {formatCurrency(b.limitAmount || 0, currency)} limit
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
