import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loader-container" style={{ minHeight: '100vh' }}>
        <div className="loader" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="categories" element={<Categories />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-glass)',
                borderRadius: '12px',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
