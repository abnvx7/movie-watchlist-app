import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WatchlistDashboard from './pages/WatchlistDashboard';
import Navbar from './components/Navbar';

const MainAppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="loading-spinner-wrap">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading CineTrack...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  return (
    <div className="app-layout">
      <Navbar onOpenAddModal={() => setIsModalOpen(true)} />
      <WatchlistDashboard isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
