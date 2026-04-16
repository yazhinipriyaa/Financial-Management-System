import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-glass)',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 6 }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color, fontWeight: 600, fontSize: '0.85rem' }}>
            {entry.name}: ₹{Number(entry.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrendLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '30px 20px' }}>
        <p>No trend data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
        <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
        <YAxis stroke="var(--text-muted)" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#10b981"
          strokeWidth={2.5}
          fill="url(#incomeGrad)"
          animationDuration={1000}
        />
        <Area
          type="monotone"
          dataKey="expense"
          name="Expense"
          stroke="#ef4444"
          strokeWidth={2.5}
          fill="url(#expenseGrad)"
          animationDuration={1000}
          animationBegin={200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
