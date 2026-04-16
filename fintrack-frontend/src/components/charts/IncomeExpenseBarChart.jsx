import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
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
          <p key={i} style={{ color: entry.fill, fontWeight: 600, fontSize: '0.85rem' }}>
            {entry.name}: ₹{Number(entry.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function IncomeExpenseBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '30px 20px' }}>
        <p>No data to display</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
        <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
        <YAxis stroke="var(--text-muted)" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={800} />
        <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={200} />
      </BarChart>
    </ResponsiveContainer>
  );
}
