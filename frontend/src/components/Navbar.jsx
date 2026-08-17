import React from 'react';
import { Clapperboard, Plus, LogOut, UploadCloud } from 'lucide-react';
import { GitHubIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenAddModal, onOpenDeployModal }) => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="brand-logo">
          <div className="brand-icon-wrap">
            <Clapperboard size={20} />
          </div>
          <span>CineTrack</span>
          <span className="brand-badge">Watchlist</span>
        </div>

        <div className="navbar-actions">
          {/* Direct GitHub & Vercel Deploy Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm nav-deploy-btn"
            onClick={onOpenDeployModal}
            id="nav-deploy-modal-btn"
            title="Push to GitHub & Deploy on Vercel"
          >
            <GitHubIcon size={15} />
            <span>Push to GitHub</span>
            <span className="nav-vercel-pill">▲ Vercel</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onOpenAddModal}
            id="nav-add-media-btn"
          >
            <Plus size={16} />
            <span>Add Title</span>
          </button>

          {user && (
            <div className="user-chip">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span>{user.username}</span>
            </div>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-icon-only btn-sm"
            onClick={logout}
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

