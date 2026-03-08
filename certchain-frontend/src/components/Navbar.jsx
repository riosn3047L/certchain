import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import Button from './Button.jsx';
import { Moon, Sun, ShieldCheck } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <ShieldCheck size={28} className="logo-icon" />
          <span>CertChain</span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/verify" className="nav-link">Verify</Link>
          <Link to="/admin" className="nav-link">Institutions</Link>
          <Link to="/wallet" className="nav-link">Graduates</Link>
          
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <Button variant="primary" onClick={() => navigate('/admin')}>
            Connect Wallet
          </Button>
        </div>
      </div>
    </nav>
  );
}
