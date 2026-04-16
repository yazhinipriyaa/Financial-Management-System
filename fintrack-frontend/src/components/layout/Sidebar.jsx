import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, Tag, Target,
  FileText, Settings, LogOut, Menu, X
} from 'lucide-react';
import '../../styles/sidebar.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/budgets', icon: Target, label: 'Budgets' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>💎 FinTrack</h1>
          <span>Personal Finance Manager</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
              end={item.to === '/'}
              onClick={onClose}
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="name">{user?.fullName || 'User'}</div>
              <div className="email">{user?.email || ''}</div>
            </div>
          </div>
          <button className="nav-item" onClick={logout} style={{ marginTop: 4, width: '100%' }}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
