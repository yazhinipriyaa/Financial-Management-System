import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('fintrack_token');
    const savedUser = localStorage.getItem('fintrack_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = (authResponse) => {
    const { token: jwt, ...userData } = authResponse;
    localStorage.setItem('fintrack_token', jwt);
    localStorage.setItem('fintrack_user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('fintrack_user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
