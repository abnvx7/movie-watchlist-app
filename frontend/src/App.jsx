import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WatchlistDashboard from './pages/WatchlistDashboard';
import Navbar from './components/Navbar';
import GitHubDeployModal from './components/GitHubDeployModal';
import { GitHubIcon } from './components/Icons';
import { UploadCloud } from 'lucide-react';

const MainAppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

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

  return (
    <>
      {!isAuthenticated ? (
        <div className="auth-wrapper-with-tools">
          <div className="auth-top-bar">
            <button
              type="button"
              className="btn btn-secondary btn-sm nav-deploy-btn"
              onClick={() => setIsDeployModalOpen(true)}
              id="auth-deploy-btn"
            >
              <GitHubIcon size={15} />
              <span>Direct Push to GitHub</span>
              <span className="nav-vercel-pill">▲ Vercel</span>
            </button>
          </div>

          {authView === 'register' ? (
            <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
          ) : (
            <LoginPage onSwitchToRegister={() => setAuthView('register')} />
          )}
        </div>
      ) : (
        <div className="app-layout">
          <Navbar
            onOpenAddModal={() => setIsModalOpen(true)}
            onOpenDeployModal={() => setIsDeployModalOpen(true)}
          />
          <WatchlistDashboard
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            onOpenDeployModal={() => setIsDeployModalOpen(true)}
          />
        </div>
      )}

      {/* Direct GitHub & Vercel Deploy Modal */}
      <GitHubDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </>
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
