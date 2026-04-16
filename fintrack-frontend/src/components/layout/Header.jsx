import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Sun, Moon } from 'lucide-react';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="btn-icon mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className="header-greeting">
          {getGreeting()}, <strong>{user?.fullName?.split(' ')[0] || 'User'}</strong> 👋
        </div>
      </div>
      <div className="header-right">
        <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
