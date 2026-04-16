import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-glass)',
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
          {payload[0].name}
        </p>
        <p style={{ color: payload[0].payload.fill, fontWeight: 700, fontSize: '0.9rem' }}>
          ₹{Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function ExpensePieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '30px 20px' }}>
        <p>No expense data to display</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
