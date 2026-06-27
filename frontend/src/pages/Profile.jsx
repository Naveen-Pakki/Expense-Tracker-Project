import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/authService';
import { getAllCategories, createCategory, deleteCategory } from '../services/categoryService';
import { getBudgets, createOrUpdateBudget, deleteBudget } from '../services/budgetService';
import { User, Settings, ShieldAlert, Plus, Trash2, HelpCircle, Check, AlertCircle } from 'lucide-react';

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const Profile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Category management states
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [catError, setCatError] = useState('');
  const [catSuccess, setCatSuccess] = useState('');

  // Budget management states
  const [budgets, setBudgets] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetMonth, setBudgetMonth] = useState(new Date().getMonth() + 1);
  const [budgetYear, setBudgetYear] = useState(new Date().getFullYear());
  const [budgetError, setBudgetError] = useState('');
  const [budgetSuccess, setBudgetSuccess] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    fetchCategories();
    fetchBudgets();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchBudgets = async () => {
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (err) {
      console.error('Failed to load budgets', err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setCatError('');
    setCatSuccess('');

    if (!newCategoryName.trim()) {
      setCatError('Category name is required.');
      return;
    }

    try {
      await createCategory({ categoryName: newCategoryName.trim() });
      setNewCategoryName('');
      setCatSuccess('Category created successfully!');
      fetchCategories();
    } catch (err) {
      setCatError(err.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete this custom category? All associated expenses will remain, but the category mapping will clear.')) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete category.');
      }
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setBudgetError('');
    setBudgetSuccess('');

    if (!selectedCategoryId || !budgetAmount || !budgetMonth || !budgetYear) {
      setBudgetError('Please complete all budget fields.');
      return;
    }

    try {
      await createOrUpdateBudget({
        categoryId: parseInt(selectedCategoryId),
        amount: parseFloat(budgetAmount),
        month: parseInt(budgetMonth),
        year: parseInt(budgetYear)
      });
      setBudgetAmount('');
      setBudgetSuccess('Budget saved successfully!');
      fetchBudgets();
    } catch (err) {
      setBudgetError(err.response?.data?.message || 'Failed to save budget.');
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Delete this monthly budget?')) {
      try {
        await deleteBudget(id);
        fetchBudgets();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete budget.');
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
      
      {/* Left panel: Profile info & Custom Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* User Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <User style={{ color: 'var(--primary)' }} />
            <h3>User Information</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Name</span>
              <p style={{ fontWeight: '600' }}>{currentUser?.name}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</span>
              <p style={{ fontWeight: '600' }}>{currentUser?.email}</p>
            </div>
          </div>
        </div>

        {/* Custom Categories Creator & List */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <Settings style={{ color: 'var(--primary)' }} />
            <h3>Category Configurations</h3>
          </div>

          {/* Form */}
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Subscriptions"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
              <Plus size={18} />
            </button>
          </form>

          {catError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '12px' }}>{catError}</p>}
          {catSuccess && <p style={{ color: 'var(--success)', fontSize: '0.8rem', marginBottom: '12px' }}>{catSuccess}</p>}

          {/* Categories List */}
          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
            {categories.map(cat => (
              <div key={cat.categoryId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{cat.categoryName}</span>
                {cat.isDefault ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Default</span>
                ) : (
                  <button className="btn btn-secondary" style={{ padding: '6px 8px', borderRadius: '6px' }} onClick={() => handleDeleteCategory(cat.categoryId)}>
                    <Trash2 size={12} style={{ color: 'var(--danger)' }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right panel: Budgets configuration */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <ShieldAlert style={{ color: 'var(--warning)' }} />
          <h3>Monthly Budget Caps</h3>
        </div>

        {/* Set Budget Form */}
        <form onSubmit={handleSaveBudget} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-glass)' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Monthly Limit Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-control"
              placeholder="0.00"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Month</label>
              <select
                className="form-control"
                value={budgetMonth}
                onChange={(e) => setBudgetMonth(e.target.value)}
                required
              >
                {MONTHS.map((m, idx) => (
                  <option key={idx} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Year</label>
              <select
                className="form-control"
                value={budgetYear}
                onChange={(e) => setBudgetYear(e.target.value)}
                required
              >
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
              </select>
            </div>
          </div>

          {budgetError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{budgetError}</p>}
          {budgetSuccess && <p style={{ color: 'var(--success)', fontSize: '0.8rem' }}>{budgetSuccess}</p>}

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', width: '120px' }}>
            Save Cap
          </button>
        </form>

        {/* Existing budgets list */}
        <h4 style={{ marginBottom: '14px', fontSize: '0.95rem' }}>Active Budget Caps List</h4>
        {budgets.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No budget caps configured.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
            {budgets.map(b => (
              <div key={b.budgetId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{b.categoryName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Limit: ₹{b.amount.toFixed(2)} | {MONTHS[b.month - 1]} {b.year}
                  </p>
                </div>
                <button className="btn btn-secondary" style={{ padding: '6px 8px', borderRadius: '6px' }} onClick={() => handleDeleteBudget(b.budgetId)}>
                  <Trash2 size={12} style={{ color: 'var(--danger)' }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
