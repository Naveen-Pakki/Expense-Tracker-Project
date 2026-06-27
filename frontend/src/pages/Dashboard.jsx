import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardData } from '../services/reportService';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (err) {
      setError('Failed to load dashboard data. Verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Dashboard details...</div>;
  }

  if (error) {
    return (
      <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)', padding: '20px' }}>
        <p style={{ color: '#fca5a5', fontWeight: '600' }}>{error}</p>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={fetchDashboard}>Retry</button>
      </div>
    );
  }

  const { totalExpenses, todayExpenses, monthlyExpenses, highestCategory, recentTransactions, categoryBreakdowns, activeBudgets } = data;

  // Filter budgets that have been exceeded
  const exceededBudgets = activeBudgets?.filter(b => b.isExceeded) || [];

  // Recharts Pie Chart Formatter
  const pieData = categoryBreakdowns?.map(c => ({
    name: c.categoryName,
    value: parseFloat(c.totalAmount)
  })) || [];

  return (
    <div>
      {/* 1. Exceeded Budget Warnings */}
      {exceededBudgets.map(budget => (
        <div key={budget.budgetId} className="budget-warning">
          <AlertTriangle size={24} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <div className="budget-warning-text">
            <strong>Warning:</strong> You have exceeded your monthly budget for <strong>{budget.categoryName}</strong>! 
            Spent: <strong>₹{budget.spentAmount.toFixed(2)}</strong> of <strong>₹{budget.amount.toFixed(2)}</strong> limit.
          </div>
        </div>
      ))}

      {/* 2. Metrics Summary Grid */}
      <div className="metrics-grid">
        <div className="glass-card metric-card hoverable">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)' }}>
            <DollarSign size={24} />
          </div>
          <div className="metric-details">
            <h3>Total Expenses</h3>
            <div className="value">₹{totalExpenses.toFixed(2)}</div>
          </div>
        </div>

        <div className="glass-card metric-card hoverable">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <TrendingDown size={24} />
          </div>
          <div className="metric-details">
            <h3>Today's Expenses</h3>
            <div className="value">₹{todayExpenses.toFixed(2)}</div>
          </div>
        </div>

        <div className="glass-card metric-card hoverable">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <Calendar size={24} />
          </div>
          <div className="metric-details">
            <h3>Monthly Expenses</h3>
            <div className="value">₹{monthlyExpenses.toFixed(2)}</div>
          </div>
        </div>

        <div className="glass-card metric-card hoverable">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <TrendingUp size={24} />
          </div>
          <div className="metric-details">
            <h3>Highest Category</h3>
            <div className="value" style={{ fontSize: '1.25rem' }}>{highestCategory}</div>
          </div>
        </div>
      </div>

      {/* 3. Visual Graphs & Budgets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        
        {/* Category breakdown Pie Chart */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px' }}>Category Wise Spending</h3>
          {pieData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No transactional data available.</p>
          ) : (
            <div style={{ width: '100%', height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: '#fff' }} 
                    formatter={(value) => [`₹${value.toFixed(2)}`, 'Spent']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Budgets Tracker panel */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Monthly Budget Limits</h3>
            <Link to="/profile" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Set Limit <ArrowRight size={14} />
            </Link>
          </div>
          
          {activeBudgets?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No budget limits configured for this month.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {activeBudgets?.map(budget => {
                const percent = Math.min((budget.spentAmount / budget.amount) * 100, 100);
                const isWarning = budget.isExceeded;
                return (
                  <div key={budget.budgetId} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: '500' }}>{budget.categoryName}</span>
                      <span style={{ color: isWarning ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        ₹{budget.spentAmount.toFixed(0)} / ₹{budget.amount.toFixed(0)} ({Math.round((budget.spentAmount / budget.amount) * 100)}%)
                      </span>
                    </div>
                    {/* Progress Bar Container */}
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${percent}%`, 
                        height: '100%', 
                        backgroundColor: isWarning ? 'var(--danger)' : 'var(--success)',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease-in-out'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 4. Recent Transactions Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Recent Transactions</h3>
          <Link to="/history" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All History <ArrowRight size={14} />
          </Link>
        </div>

        {recentTransactions?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No recent transactions. Add one to start tracking!</p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions?.map(expense => (
                  <tr key={expense.expenseId}>
                    <td style={{ fontWeight: '500' }}>{expense.title}</td>
                    <td>
                      <span className="category-badge">{expense.categoryName}</span>
                    </td>
                    <td>{expense.expenseDate}</td>
                    <td>{expense.paymentMethod}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>
                      -₹{expense.amount.toFixed(2)}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{expense.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
