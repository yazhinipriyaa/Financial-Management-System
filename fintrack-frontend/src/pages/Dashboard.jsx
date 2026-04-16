import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary } from '../api/transactionApi';
import { getBudgets } from '../api/budgetApi';
import { formatCurrency } from '../utils/formatCurrency';
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank,
  ArrowLeftRight, BarChart3, PieChart as PieIcon, Target
} from 'lucide-react';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import BudgetProgressChart from '../components/charts/BudgetProgressChart';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, budRes] = await Promise.all([
        getDashboardSummary(),
        getBudgets(new Date().getMonth() + 1, new Date().getFullYear()),
      ]);
      setSummary(sumRes.data);
      setBudgets(budRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Income',
      value: formatCurrency(summary?.totalIncome || 0, user?.currency),
      icon: TrendingUp,
      type: 'income',
      sub: 'This month',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(summary?.totalExpenses || 0, user?.currency),
      icon: TrendingDown,
      type: 'expense',
      sub: 'This month',
    },
    {
      label: 'Net Balance',
      value: formatCurrency(summary?.netBalance || 0, user?.currency),
      icon: Wallet,
      type: 'balance',
      sub: 'Income - Expenses',
    },
    {
      label: 'Savings Rate',
      value: `${(summary?.savingsRate || 0).toFixed(1)}%`,
      icon: PiggyBank,
      type: 'savings',
      sub: 'Of income saved',
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        {stats.map((stat, i) => (
          <div key={i} className={`stat-card glass-card ${stat.type}`}
               style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-card-header">
              <div className="stat-card-icon">
                <stat.icon size={22} />
              </div>
              <span className="stat-card-label">{stat.label}</span>
            </div>
            <div className="stat-card-value">{stat.value}</div>
            <div className="stat-card-sub">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid">
        <div className="chart-card glass-card">
          <div className="chart-card-header">
            <h3><BarChart3 size={18} /> Monthly Trend</h3>
          </div>
          <TrendLineChart data={summary?.monthlyTrend || []} />
        </div>
        <div className="chart-card glass-card">
          <div className="chart-card-header">
            <h3><PieIcon size={18} /> Expense Breakdown</h3>
          </div>
          <ExpensePieChart data={summary?.expenseByCategory || []} />
        </div>
      </div>

      {/* Budget Progress + Recent Transactions */}
      <div className="dashboard-grid">
        <div className="recent-transactions glass-card">
          <h3><ArrowLeftRight size={18} /> Recent Transactions</h3>
          {(!summary?.recentTransactions || summary.recentTransactions.length === 0) ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <p>No transactions yet. Add your first one!</p>
            </div>
          ) : (
            <div className="recent-list">
              {summary.recentTransactions.map((t) => (
                <div key={t.id} className="recent-item">
                  <div className="recent-item-icon"
                       style={{ background: t.categoryColor ? `${t.categoryColor}20` : 'var(--bg-tertiary)' }}>
                    {t.categoryIcon || '💰'}
                  </div>
                  <div className="recent-item-details">
                    <div className="desc">{t.description || 'No description'}</div>
                    <div className="category">{t.categoryName || 'Uncategorized'} • {t.transactionDate}</div>
                  </div>
                  <div className={`recent-item-amount ${t.type?.toLowerCase()}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="chart-card glass-card">
          <div className="chart-card-header">
            <h3><Target size={18} /> Budget Progress</h3>
          </div>
          <BudgetProgressChart budgets={budgets} currency={user?.currency} />
        </div>
      </div>
    </div>
  );
}
