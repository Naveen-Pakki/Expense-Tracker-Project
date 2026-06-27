import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFilteredExpenses, deleteExpense, downloadCsvReport, downloadPdfReport } from '../services/expenseService';
import { getAllCategories } from '../services/categoryService';
import { Search, Filter, FileText, Download, Edit3, Trash2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const ExpenseHistory = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filter settings state
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  
  // Pageable state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('expenseDate');
  const [sortDir, setSortDir] = useState('desc');

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [page, size, sortBy, sortDir]);

  const fetchCategories = async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const getFilterParams = () => {
    const params = {};
    if (search) params.search = search;
    if (categoryId) params.categoryId = parseInt(categoryId);
    if (paymentMethod) params.paymentMethod = paymentMethod;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (minAmount) params.minAmount = parseFloat(minAmount);
    if (maxAmount) params.maxAmount = parseFloat(maxAmount);
    return params;
  };

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = getFilterParams();
      const response = await getFilteredExpenses({
        ...filters,
        page,
        size,
        sortBy,
        sortDir
      });
      setExpenses(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError('Failed to fetch expenses history.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    setPage(0); // Reset to first page
    fetchExpenses();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryId('');
    setPaymentMethod('');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setPage(0);
    setTimeout(() => fetchExpenses(), 100);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this expense?')) {
      try {
        await deleteExpense(id);
        fetchExpenses();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete transaction.');
      }
    }
  };

  // Safe file export triggers using Axios blobs
  const handleExport = async (format) => {
    setExporting(true);
    try {
      const filters = getFilterParams();
      let blob;
      let filename = `expenses_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        blob = await downloadCsvReport(filters);
        filename += '.csv';
      } else {
        blob = await downloadPdfReport(filters);
        filename += '.pdf';
      }

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to generate export file.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Expense History</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Browse, filter, and export transaction records
          </p>
        </div>
        
        {/* Export buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => handleExport('csv')} disabled={exporting || expenses.length === 0}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('pdf')} disabled={exporting || expenses.length === 0}>
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleApplyFilters} className="filter-bar">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Title/Notes</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Payment Method</label>
            <select
              className="form-control"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">All Methods</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="NET_BANKING">Net Banking</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Min Amount (₹)</label>
            <input
              type="number"
              className="form-control"
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Max Amount (₹)</label>
            <input
              type="number"
              className="form-control"
              placeholder="10000"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" style={{ padding: '12px' }} onClick={handleClearFilters}>
              Clear
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px', flex: 1 }}>
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* Sorting config */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div>
          Showing {expenses.length} of {totalElements} transactions
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div>
            Sort By:{' '}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', cursor: 'pointer', fontWeight: '600' }}
            >
              <option value="expenseDate">Date</option>
              <option value="amount">Amount</option>
              <option value="title">Title</option>
            </select>
          </div>
          <div>
            Direction:{' '}
            <select 
              value={sortDir} 
              onChange={(e) => setSortDir(e.target.value)}
              style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', cursor: 'pointer', fontWeight: '600' }}
            >
              <option value="desc">Newest / Largest</option>
              <option value="asc">Oldest / Smallest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} className="spin" style={{ display: 'inline', marginRight: '8px' }} /> Fetching transactions...
          </p>
        ) : expenses.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No expenses found. Adjust filters or record a new one.
          </p>
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
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => (
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
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {expense.notes || '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 8px', borderRadius: '6px' }}
                          onClick={() => navigate(`/edit-expense/${expense.expenseId}`)}
                        >
                          <Edit3 size={14} style={{ color: 'var(--primary)' }} />
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 8px', borderRadius: '6px' }}
                          onClick={() => handleDelete(expense.expenseId)}
                        >
                          <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-secondary" 
            style={{ padding: '8px 12px' }}
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '8px 12px' }}
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseHistory;
