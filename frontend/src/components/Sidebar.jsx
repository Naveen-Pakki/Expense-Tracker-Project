import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  BarChart3, 
  User, 
  LogOut,
  Wallet
} from 'lucide-react';
import { logout } from '../services/authService';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Wallet size={28} className="text-primary" />
        <span>ExpenseTracker</span>
      </div>

      <nav className="sidebar-menu">
        <div className="sidebar-item">
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
        </div>

        <div className="sidebar-item">
          <NavLink to="/add-expense" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={20} />
            <span>Add Expense</span>
          </NavLink>
        </div>

        <div className="sidebar-item">
          <NavLink to="/history" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <History size={20} />
            <span>History</span>
          </NavLink>
        </div>

        <div className="sidebar-item">
          <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={20} />
            <span>Reports</span>
          </NavLink>
        </div>

        <div className="sidebar-item">
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <User size={20} />
            <span>Profile & Budgets</span>
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
