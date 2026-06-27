import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { createExpense, updateExpense, getExpenseById } from '../services/expenseService';
import { getAllCategories } from '../services/categoryService';
import { getBudgets } from '../services/budgetService';
import { Save, X, AlertTriangle, ArrowLeft } from 'lucide-react';

const AddExpense = () => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [notes, setNotes] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [budgetWarning, setBudgetWarning] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams(); // URL parameter if editing
  const isEditMode = !!id;

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  // Forecast budget warnings in real-time when amount or category changes
  useEffect(() => {
    if (categoryId && amount && budgets.length > 0) {
      const selectedCatId = parseInt(categoryId);
      const inputAmt = parseFloat(amount) || 0;
      
      const budget = budgets.find(b => b.categoryId === selectedCatId);
      if (budget) {
        setSelectedBudget(budget);
        
        // If editing, subtract current expense amount from calculations
        let currentExpenseAmt = 0;
        // In case of edit, we check if budget was already calculated.
        const willExceed = (budget.spentAmount + inputAmt) > budget.amount;
        setBudgetWarning(willExceed);
      } else {
        setBudgetWarning(false);
        setSelectedBudget(null);
      }
    } else {
      setBudgetWarning(false);
      setSelectedBudget(null);
    }
  }, [categoryId, amount, budgets]);

  const fetchInitialData = async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);

      // Fetch active budgets for current month
      const today = new Date();
      const currentBudgets = await getBudgets(today.getMonth() + 1, today.getFullYear());
      setBudgets(currentBudgets);

      if (isEditMode) {
        setLoading(true);
        const expense = await getExpenseById(id);
        setTitle(expense.title);
        setAmount(expense.amount.toString());
        setExpenseDate(expense.expenseDate);
        setCategoryId(expense.categoryId.toString());
        setPaymentMethod(expense.paymentMethod);
        setNotes(expense.notes || '');
      }
    } catch (err) {
      setError('Failed to fetch initial settings. Verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !amount || !expenseDate || !categoryId || !paymentMethod) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = {
      title,
      amount: parseFloat(amount),
      expenseDate,
      categoryId: parseInt(categoryId),
      paymentMethod,
      notes
    };

    setLoading(true);
    try {
      if (isEditMode) {
        await updateExpense(id, payload);
      } else {
        await createExpense(payload);
      }
      navigate('/history');
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <button className="btn btn-secondary" style={{ marginBottom: '20px', padding: '8px 16px' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass-card">
        <h2 style={{ marginBottom: '24px' }}>{isEditMode ? 'Edit Transaction' : 'Record New Expense'}</h2>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--danger)',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#fca5a5',
            fontSize: '0.85rem'
          }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Real-time budget warning display */}
        {budgetWarning && selectedBudget && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px dashed var(--warning)',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#fde047',
            fontSize: '0.85rem'
          }}>
            <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <div>
              <strong>Budget Warning:</strong> Adding this expense will exceed your monthly budget for <strong>{selectedBudget.categoryName}</strong>!
              <br />
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                Current Spent: ₹{selectedBudget.spentAmount.toFixed(2)} | Budget Limit: ₹{selectedBudget.amount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Expense Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Grocery Shopping"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-control"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI Transfer</option>
                <option value="NET_BANKING">Net Banking</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-control"
              placeholder="Add supplementary details..."
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/history')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} />
              <span>{loading ? 'Saving...' : (isEditMode ? 'Update Record' : 'Save Record')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
