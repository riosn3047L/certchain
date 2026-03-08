import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, UploadCloud, ShieldCheck, LogOut, Search, Building } from 'lucide-react';
import './AdminLayout.css';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Moon, Sun } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <ShieldCheck size={28} className="text-primary" />
          <span className="font-bold text-lg">CertChain Admin</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Menu</div>
          <nav className="sidebar-nav">
            <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/admin/issue" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <FileText size={20} /> Issue Certificate
            </NavLink>
            <NavLink to="/admin/bulk" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <UploadCloud size={20} /> Bulk Upload CSV
            </NavLink>
            <NavLink to="/admin/manage" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Search size={20} /> Manage Certificates
            </NavLink>
            <NavLink to="/admin/institutions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Building size={20} /> Institutions
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="nav-item theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <><Sun size={20} /> Light Mode</> : <><Moon size={20} /> Dark Mode</>}
          </button>
          <button className="nav-item text-danger" onClick={() => navigate('/')}>
            <LogOut size={20} /> Back to Home
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-greeting">
            <h2>Institution Admin Portal</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-10 text-primary border border-primary-20 font-mono">
              Local Dev Mode
            </span>
          </div>
        </header>

        <div className="admin-content-area animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
