import React, { useEffect, useState } from 'react';
import { getReportData } from '../services/reportService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Calendar, BarChart3, TrendingUp } from 'lucide-react';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const reportData = await getReportData();
      setData(reportData);
    } catch (err) {
      setError('Failed to fetch analytics metrics. Verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Compiling report summaries...</div>;
  }

  if (error) {
    return (
      <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)', padding: '20px' }}>
        <p style={{ color: '#fca5a5', fontWeight: '600' }}>{error}</p>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={fetchReport}>Retry</button>
      </div>
    );
  }

  const { monthlySummaries, yearlySummaries, categorySummaries } = data;

  // Format monthly summaries: sort chronologically and map month integer to name
  const formattedMonthly = monthlySummaries
    ?.slice()
    .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))
    .map(m => ({
      name: `${MONTHS[m.month - 1]} ${m.year}`,
      Amount: parseFloat(m.totalAmount)
    })) || [];

  // Format category summaries
  const formattedCategory = categorySummaries?.map(c => ({
    Category: c.categoryName,
    Amount: parseFloat(c.totalAmount)
  })) || [];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2>Financial Reports & Analytics</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Evaluate expenditure trends and compare seasonal distributions
        </p>
      </div>

      {/* 1. Monthly Spending Trend Area Chart */}
      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Calendar style={{ color: 'var(--primary)' }} />
          <h3>Monthly Spending Trend</h3>
        </div>
        {formattedMonthly.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
            Insufficient data to calculate monthly trend.
          </p>
        ) : (
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedMonthly} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: '#fff' }} 
                  formatter={(value) => [`₹${value.toFixed(2)}`, 'Spent']}
                />
                <Area type="monotone" dataKey="Amount" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
        
        {/* 2. Category distribution Bar Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <BarChart3 style={{ color: 'var(--success)' }} />
            <h3>Category wise Aggregation</h3>
          </div>
          {formattedCategory.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
              No categories mapped.
            </p>
          ) : (
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedCategory} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis dataKey="Category" type="category" stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: '#fff' }}
                    formatter={(value) => [`₹${value.toFixed(2)}`, 'Spent']}
                  />
                  <Bar dataKey="Amount" fill="var(--success)" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 3. Yearly summaries list */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <TrendingUp style={{ color: 'var(--warning)' }} />
            <h3>Yearly Financial Summaries</h3>
          </div>
          {yearlySummaries?.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
              No annual metrics saved.
            </p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th style={{ textAlign: 'right' }}>Total Spent</th>
                    <th style={{ textAlign: 'center' }}>Avg. Monthly Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlySummaries?.map(y => (
                    <tr key={y.year}>
                      <td style={{ fontWeight: '600' }}>{y.year}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>
                        ₹{parseFloat(y.totalAmount).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        ₹{(parseFloat(y.totalAmount) / 12).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Reports;
