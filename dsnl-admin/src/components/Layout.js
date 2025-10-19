import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>DSNL Admin</h2>
          <p>Content Management</p>
        </div>
        
        <div className="nav-menu">
          <Link 
            to="/" 
            className={`nav-item ${isActiveRoute('/') ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          
          <Link 
            to="/upload" 
            className={`nav-item ${isActiveRoute('/upload') ? 'active' : ''}`}
          >
            <span className="nav-icon">📤</span>
            Upload Content
          </Link>
          
          <Link 
            to="/content" 
            className={`nav-item ${isActiveRoute('/content') ? 'active' : ''}`}
          >
            <span className="nav-icon">📚</span>
            Manage Content
          </Link>
        </div>
      </nav>

      <div className="main-content">
        <header className="top-header">
          <div className="header-left">
            <h1>DSNL Publications - Admin Panel</h1>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">Welcome, {user?.username}</span>
              <button 
                onClick={handleLogout} 
                className="logout-button"
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;