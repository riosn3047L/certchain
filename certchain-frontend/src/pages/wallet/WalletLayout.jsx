import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';
import { ScrollText, Share2, User, Moon, Sun, ArrowLeft, ShieldCheck } from 'lucide-react';
import './WalletLayout.css';
import Button from '../../components/Button.jsx';

export default function WalletLayout() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="wallet-layout">
      {/* Sidebar Navigation */}
      <aside className="wallet-sidebar">
        <div className="sidebar-header" onClick={() => navigate('/')}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={28} className="text-primary" />
            <h2>CertChain</h2>
          </div>
          <div className="text-muted text-xs uppercase tracking-wide mt-2">Graduate Wallet</div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Menu</div>
          <nav className="sidebar-nav">
            <NavLink to="/wallet" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <ScrollText size={20} />
              <span>My Certificates</span>
            </NavLink>
            <NavLink to="/wallet/share" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Share2 size={20} />
              <span>Share Profile</span>
            </NavLink>
            <NavLink to="/wallet/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <User size={20} />
              <span>Profile Settings</span>
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          <Button variant="ghost" className="w-full flex justify-start gap-3" onClick={() => navigate('/')}>
            <ArrowLeft size={18} /> Exit Wallet
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="wallet-main">
        {/* Top Header */}
        <header className="wallet-header">
          <div className="flex flex-col">
            <span className="text-muted text-xs uppercase tracking-wide">Connected Account</span>
            <span className="font-mono text-sm font-medium">0x8B3...4E2</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="wallet-content-area animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
