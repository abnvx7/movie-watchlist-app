import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  FolderGit2,
  Terminal,
  ShieldCheck,
  LogOut,
  PlusCircle,
  Layers,
  ArrowUpRight,
  X,
  Code2,
  Cpu,
  Radio
} from 'lucide-react';
import { GitHubIcon, VercelIcon } from './Icons';
import {
  validateGitHubToken,
  fetchUserRepos,
  createGitHubRepo,
  pushProjectToGitHub,
} from '../utils/githubApi';
import { getProjectFiles, PROJECT_METADATA } from '../utils/projectManifest';
import apiClient from '../api/axios';

const STORAGE_TOKEN_KEY = 'cinetrack_github_pat';

const GitHubDeployModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('direct_push'); // 'direct_push' | 'vercel' | 'terminal'
  
  // GitHub Auth State
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY) || '');
  const [githubUser, setGithubUser] = useState(null);
  const [tokenScopes, setTokenScopes] = useState([]);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [authError, setAuthError] = useState('');

  // Repositories State
  const [userRepos, setUserRepos] = useState([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repoMode, setRepoMode] = useState('existing'); // 'existing' | 'new'
  const [selectedRepo, setSelectedRepo] = useState('');
  const [newRepoName, setNewRepoName] = useState('movie-watchlist-app');
  const [newRepoDesc, setNewRepoDesc] = useState('CineTrack - Full-Stack Movie & TV Show Watchlist with Vercel Deployment');
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  
  // Git Options
  const [targetBranch, setTargetBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('feat: CineTrack Movie & TV Watchlist with Vercel Deploy');
  const [showFileInspector, setShowFileInspector] = useState(false);

  // Push Execution State
  const [isPushing, setIsPushing] = useState(false);
  const [pushLogs, setPushLogs] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [pushResult, setPushResult] = useState(null);
  const [pushError, setPushError] = useState('');

  // Local Backend Sync State
  const [localGitInfo, setLocalGitInfo] = useState(null);
  const [isCheckingLocalGit, setIsCheckingLocalGit] = useState(false);

  // Copy state
  const [copiedKey, setCopiedKey] = useState(null);

  const logsEndRef = useRef(null);

  // Auto-validate token on mount if stored
  useEffect(() => {
    if (token && !githubUser && isOpen) {
      handleValidateToken(token);
    }
  }, [isOpen]);

  // Scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight;
    }
  }, [pushLogs]);

  if (!isOpen) return null;

  const handleValidateToken = async (patToValidate = token) => {
    if (!patToValidate.trim()) {
      setAuthError('Please enter a GitHub Personal Access Token');
      return;
    }

    setIsValidatingToken(true);
    setAuthError('');
    try {
      const result = await validateGitHubToken(patToValidate);
      setGithubUser(result.user);
      setTokenScopes(result.scopes);
      localStorage.setItem(STORAGE_TOKEN_KEY, patToValidate.trim());

      // Auto-fetch repositories
      loadUserRepositories(patToValidate.trim(), result.user.login);
    } catch (err) {
      setAuthError(err.message || 'Failed to authenticate with GitHub');
      setGithubUser(null);
    } finally {
      setIsValidatingToken(false);
    }
  };

  const loadUserRepositories = async (pat, username) => {
    setIsLoadingRepos(true);
    try {
      const repos = await fetchUserRepos(pat);
      setUserRepos(repos);
      // Auto-select existing watchlist repo if exists
      const match = repos.find(
        (r) =>
          r.name.toLowerCase().includes('watchlist') ||
          r.name.toLowerCase().includes('cinetrack') ||
          r.name.toLowerCase().includes('movie')
      );
      if (match) {
        setSelectedRepo(match.name);
      } else if (repos.length > 0) {
        setSelectedRepo(repos[0].name);
      }
    } catch (err) {
      console.warn('Could not load user repos:', err);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleDisconnectGitHub = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    setToken('');
    setGithubUser(null);
    setUserRepos([]);
    setSelectedRepo('');
    setPushResult(null);
    setPushLogs([]);
  };

  const handlePushToGitHub = async () => {
    if (!githubUser) {
      setPushError('Please connect your GitHub account first.');
      return;
    }

    let targetRepoName = selectedRepo;
    if (repoMode === 'new') {
      if (!newRepoName.trim()) {
        setPushError('Please enter a name for the new GitHub repository.');
        return;
      }
      targetRepoName = newRepoName.trim().replace(/\s+/g, '-');
    }

    if (!targetRepoName) {
      setPushError('Please select or enter a repository name.');
      return;
    }

    setIsPushing(true);
    setPushError('');
    setPushResult(null);
    setPushLogs([]);
    setProgressPercent(5);

    const appendLog = (logObj) => {
      setPushLogs((prev) => [...prev, logObj]);
    };

    try {
      // Step A: If new repo mode, create the repository on GitHub
      if (repoMode === 'new') {
        appendLog({
          message: `Creating new repository "${targetRepoName}" on GitHub...`,
          level: 'info',
          timestamp: new Date().toLocaleTimeString(),
        });
        setProgressPercent(15);

        const newRepo = await createGitHubRepo(token, {
          name: targetRepoName,
          description: newRepoDesc,
          isPrivate: isPrivateRepo,
          autoInit: false,
        });
        appendLog({
          message: `Repository created: https://github.com/${githubUser.login}/${targetRepoName}`,
          level: 'success',
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      // Step B: Direct Git Push via Git Database API
      setProgressPercent(30);
      const projectFiles = getProjectFiles();

      appendLog({
        message: `Gathered ${projectFiles.length} project files for commit. Starting Git sync...`,
        level: 'info',
        timestamp: new Date().toLocaleTimeString(),
      });

      const result = await pushProjectToGitHub(token, {
        owner: githubUser.login,
        repo: targetRepoName,
        branch: targetBranch.trim() || 'main',
        commitMessage: commitMessage.trim() || 'feat: CineTrack Movie & TV Watchlist with Vercel Deploy',
        files: projectFiles,
        onProgress: (prog) => {
          appendLog(prog);
          setProgressPercent((prev) => Math.min(prev + 4, 95));
        },
      });

      setProgressPercent(100);
      setPushResult(result);

      // Refresh repos list
      loadUserRepositories(token, githubUser.login);
    } catch (err) {
      setPushError(err.message || 'Push failed. Please check your token permissions and try again.');
      appendLog({
        message: `Push Failed: ${err.message}`,
        level: 'error',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const checkLocalGit = async () => {
    setIsCheckingLocalGit(true);
    try {
      const res = await apiClient.get('/github/push/');
      setLocalGitInfo(res.data);
    } catch (err) {
      setLocalGitInfo({
        git_available: false,
        message: 'Backend server is offline or not running locally.',
      });
    } finally {
      setIsCheckingLocalGit(false);
    }
  };

  const projectFiles = getProjectFiles();

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container github-deploy-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-title-wrap">
            <div className="deploy-header-icon-badge">
              <GitHubIcon size={20} className="icon-github" />
              <div className="deploy-icon-divider"></div>
              <VercelIcon size={16} className="icon-vercel" />
            </div>
            <div>
              <h2 className="modal-title">GitHub Sync & Vercel Deploy Hub</h2>
              <p className="modal-subtitle">Push codebase directly to GitHub & launch with Vercel</p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-icon-only btn-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="deploy-tabs">
          <button
            type="button"
            className={`deploy-tab ${activeTab === 'direct_push' ? 'active' : ''}`}
            onClick={() => setActiveTab('direct_push')}
          >
            <UploadCloud size={16} />
            <span>Direct Push to GitHub</span>
          </button>
          <button
            type="button"
            className={`deploy-tab ${activeTab === 'vercel' ? 'active' : ''}`}
            onClick={() => setActiveTab('vercel')}
          >
            <Globe size={16} />
            <span>Vercel Deploy & Status</span>
          </button>
          <button
            type="button"
            className={`deploy-tab ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('terminal');
              checkLocalGit();
            }}
          >
            <Terminal size={16} />
            <span>Terminal / Local CLI</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="modal-body deploy-modal-body">
          {/* ======================================================== */}
          {/* TAB 1: DIRECT PUSH TO GITHUB */}
          {/* ======================================================== */}
          {activeTab === 'direct_push' && (
            <div className="deploy-section-stack">
              {/* Step 1: GitHub Auth / Connection */}
              <div className="deploy-card">
                <div className="deploy-card-header">
                  <div className="deploy-card-title-wrap">
                    <ShieldCheck size={18} className="text-gold" />
                    <span className="deploy-step-label">Step 1</span>
                    <span className="deploy-card-title">GitHub Authentication</span>
                  </div>
                  {githubUser && (
                    <span className="badge badge-emerald">
                      <CheckCircle2 size={12} /> Connected
                    </span>
                  )}
                </div>

                {!githubUser ? (
                  <div className="deploy-auth-form">
                    <p className="deploy-instruction">
                      Enter your GitHub <strong>Personal Access Token (classic or fine-grained)</strong> with{' '}
                      <code>repo</code> permissions to push directly from your browser.
                    </p>

                    <div className="deploy-token-input-group">
                      <input
                        type="password"
                        className="form-input"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_..."
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleValidateToken(token)}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={isValidatingToken || !token.trim()}
                        onClick={() => handleValidateToken(token)}
                      >
                        {isValidatingToken ? (
                          <>
                            <div className="spinner spinner-sm"></div>
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <GitHubIcon size={16} />
                            <span>Connect GitHub</span>
                          </>
                        )}
                      </button>
                    </div>

                    {authError && (
                      <div className="auth-error-alert" style={{ marginTop: '10px' }}>
                        <AlertCircle size={15} />
                        <span>{authError}</span>
                      </div>
                    )}

                    <div className="deploy-token-help">
                      <span>Don't have a token?</span>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo,read:user,user:email&description=CineTrack%20Direct%20Push%20Web%20Deployer"
                        target="_blank"
                        rel="noreferrer"
                        className="deploy-link"
                      >
                        Generate Token on GitHub <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="deploy-user-profile">
                    <img
                      src={githubUser.avatar_url}
                      alt={githubUser.login}
                      className="deploy-user-avatar"
                    />
                    <div className="deploy-user-details">
                      <div className="deploy-user-name-wrap">
                        <span className="deploy-user-name">{githubUser.name || githubUser.login}</span>
                        <span className="deploy-user-handle">@{githubUser.login}</span>
                      </div>
                      <div className="deploy-user-meta">
                        <span>{githubUser.public_repos} Public Repositories</span>
                        <span>&bull;</span>
                        <span>Scopes: {tokenScopes.join(', ') || 'repo (access)'}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleDisconnectGitHub}
                      title="Disconnect GitHub account"
                    >
                      <LogOut size={14} />
                      <span>Disconnect</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Target Repository & Options */}
              {githubUser && (
                <div className="deploy-card">
                  <div className="deploy-card-header">
                    <div className="deploy-card-title-wrap">
                      <FolderGit2 size={18} className="text-gold" />
                      <span className="deploy-step-label">Step 2</span>
                      <span className="deploy-card-title">Repository & Git Configuration</span>
                    </div>

                    <div className="deploy-mode-toggle">
                      <button
                        type="button"
                        className={`deploy-mode-btn ${repoMode === 'existing' ? 'active' : ''}`}
                        onClick={() => setRepoMode('existing')}
                      >
                        Existing Repo
                      </button>
                      <button
                        type="button"
                        className={`deploy-mode-btn ${repoMode === 'new' ? 'active' : ''}`}
                        onClick={() => setRepoMode('new')}
                      >
                        <PlusCircle size={13} />
                        New Repo
                      </button>
                    </div>
                  </div>

                  {repoMode === 'existing' ? (
                    <div className="form-group">
                      <label className="form-label" htmlFor="select-repo">
                        Select Destination Repository on GitHub
                      </label>
                      <div className="deploy-repo-select-wrap">
                        <select
                          id="select-repo"
                          className="form-input"
                          value={selectedRepo}
                          onChange={(e) => setSelectedRepo(e.target.value)}
                        >
                          {userRepos.length === 0 ? (
                            <option value="">No repositories found</option>
                          ) : (
                            userRepos.map((r) => (
                              <option key={r.id} value={r.name}>
                                {r.full_name} {r.private ? '(Private)' : '(Public)'}
                              </option>
                            ))
                          )}
                        </select>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon-only"
                          title="Refresh Repositories"
                          onClick={() => loadUserRepositories(token, githubUser.login)}
                        >
                          <RefreshCw size={14} className={isLoadingRepos ? 'spin' : ''} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="deploy-new-repo-grid">
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-repo-name">
                          New Repository Name
                        </label>
                        <input
                          id="new-repo-name"
                          type="text"
                          className="form-input"
                          placeholder="movie-watchlist-app"
                          value={newRepoName}
                          onChange={(e) => setNewRepoName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-repo-desc">
                          Description
                        </label>
                        <input
                          id="new-repo-desc"
                          type="text"
                          className="form-input"
                          placeholder="CineTrack Movie Watchlist"
                          value={newRepoDesc}
                          onChange={(e) => setNewRepoDesc(e.target.value)}
                        />
                      </div>
                      <div className="deploy-privacy-row">
                        <label className="deploy-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isPrivateRepo}
                            onChange={(e) => setIsPrivateRepo(e.target.checked)}
                          />
                          <span>Make this repository Private</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Branch & Commit Message */}
                  <div className="deploy-commit-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="target-branch">
                        Target Branch
                      </label>
                      <input
                        id="target-branch"
                        type="text"
                        className="form-input"
                        placeholder="main"
                        value={targetBranch}
                        onChange={(e) => setTargetBranch(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 2 }}>
                      <label className="form-label" htmlFor="commit-msg">
                        Commit Message
                      </label>
                      <input
                        id="commit-msg"
                        type="text"
                        className="form-input"
                        placeholder="feat: CineTrack Movie & TV Watchlist with Vercel Deploy"
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* File Bundle Inspector Toggle */}
                  <div className="deploy-bundle-bar">
                    <div className="deploy-bundle-info">
                      <Layers size={15} className="text-gold" />
                      <span>
                        <strong>{projectFiles.length} Project Files</strong> bundled (Frontend, Backend, Docker, Vercel, Configs)
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowFileInspector(!showFileInspector)}
                    >
                      <Code2 size={14} />
                      <span>{showFileInspector ? 'Hide Files' : 'Inspect Files'}</span>
                    </button>
                  </div>

                  {showFileInspector && (
                    <div className="deploy-file-tree">
                      {projectFiles.map((file, idx) => (
                        <div key={idx} className="deploy-file-item">
                          <span className="deploy-file-path">{file.path}</span>
                          <span className="badge badge-subtle">{file.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Execute Direct Push & Live Terminal */}
              {githubUser && (
                <div className="deploy-card">
                  <div className="deploy-card-header">
                    <div className="deploy-card-title-wrap">
                      <Cpu size={18} className="text-gold" />
                      <span className="deploy-step-label">Step 3</span>
                      <span className="deploy-card-title">Push Engine & Live Terminal</span>
                    </div>
                  </div>

                  {pushError && (
                    <div className="auth-error-alert" style={{ marginBottom: '12px' }}>
                      <AlertCircle size={15} />
                      <span>{pushError}</span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {isPushing && (
                    <div className="deploy-progress-container">
                      <div
                        className="deploy-progress-bar"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Push Action Button */}
                  <div className="deploy-action-row">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg deploy-submit-btn"
                      disabled={isPushing}
                      onClick={handlePushToGitHub}
                    >
                      {isPushing ? (
                        <>
                          <div className="spinner"></div>
                          <span>Pushing to GitHub ({progressPercent}%)...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={20} />
                          <span>Direct Push to GitHub Now</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Live Terminal Output */}
                  {pushLogs.length > 0 && (
                    <div className="deploy-terminal" ref={logsEndRef}>
                      <div className="deploy-terminal-header">
                        <div className="deploy-terminal-dots">
                          <span className="dot dot-red"></span>
                          <span className="dot dot-yellow"></span>
                          <span className="dot dot-green"></span>
                        </div>
                        <span className="deploy-terminal-title">cinetrack-git-engine &bull; REST API Stream</span>
                      </div>
                      <div className="deploy-terminal-body">
                        {pushLogs.map((log, idx) => (
                          <div key={idx} className={`log-line log-${log.level || 'info'}`}>
                            <span className="log-time">[{log.timestamp}]</span>
                            <span className="log-msg">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Success Result Banner */}
                  {pushResult && (
                    <div className="deploy-success-card">
                      <div className="deploy-success-header">
                        <CheckCircle2 size={24} className="text-emerald" />
                        <div>
                          <h4 className="deploy-success-title">Code Pushed to GitHub Successfully!</h4>
                          <p className="deploy-success-sub">
                            Repository is live on branch <code>{pushResult.branch}</code>.
                          </p>
                        </div>
                      </div>

                      <div className="deploy-success-actions">
                        <a
                          href={pushResult.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          <GitHubIcon size={16} />
                          <span>View on GitHub</span>
                          <ArrowUpRight size={14} />
                        </a>

                        <a
                          href={pushResult.vercelDeployUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          <VercelIcon size={14} />
                          <span>Deploy on Vercel (1-Click)</span>
                          <ArrowUpRight size={14} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: VERCEL DEPLOY & STATUS */}
          {/* ======================================================== */}
          {activeTab === 'vercel' && (
            <div className="deploy-section-stack">
              {/* Production Live Status Card */}
              <div className="deploy-card highlight-card">
                <div className="deploy-card-header">
                  <div className="deploy-card-title-wrap">
                    <Globe size={20} className="text-gold" />
                    <span className="deploy-card-title">Vercel Production Deployment</span>
                  </div>
                  <span className="badge badge-emerald">
                    <Radio size={12} className="spin-slow" /> Ready for Production
                  </span>
                </div>

                <p className="deploy-instruction">
                  CineTrack is configured for Vercel deployment with single-page application (SPA) routing,
                  Vite build pipelines, and environment variable API routing.
                </p>

                <div className="deploy-vercel-button-row">
                  <a
                    href="https://vercel.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-lg"
                  >
                    <VercelIcon size={18} />
                    <span>Import to Vercel (1-Click)</span>
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>

              {/* 3-Step Vercel Setup Guide */}
              <div className="deploy-card">
                <h3 className="deploy-section-heading">How to Deploy with Vercel in 3 Steps</h3>

                <div className="deploy-steps-list">
                  <div className="deploy-guide-step">
                    <div className="step-num">1</div>
                    <div className="step-content">
                      <h4>Push your code to GitHub</h4>
                      <p>
                        Use the <strong>"Direct Push to GitHub"</strong> tab above or push via Git CLI.
                      </p>
                    </div>
                  </div>

                  <div className="deploy-guide-step">
                    <div className="step-num">2</div>
                    <div className="step-content">
                      <h4>Import to Vercel</h4>
                      <p>
                        Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="deploy-link">vercel.com/new</a> and select your GitHub repository.
                      </p>
                      <div className="deploy-code-snippet">
                        <span>Root Directory:</span> <code>frontend</code> (or workspace root with <code>vercel.json</code>)
                        <br />
                        <span>Framework Preset:</span> <code>Vite</code>
                      </div>
                    </div>
                  </div>

                  <div className="deploy-guide-step">
                    <div className="step-num">3</div>
                    <div className="step-content">
                      <h4>Add Environment Variables & Deploy</h4>
                      <p>Under <strong>Environment Variables</strong> in Vercel, set:</p>
                      <div className="deploy-code-snippet">
                        <code>VITE_API_URL</code> = <code>https://&lt;your-backend-api&gt;.onrender.com/api</code>
                      </div>
                      <p style={{ marginTop: '8px' }}>
                        Click <strong>Deploy</strong> — your cinema watchlist will go live worldwide!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: TERMINAL & LOCAL CLI */}
          {/* ======================================================== */}
          {activeTab === 'terminal' && (
            <div className="deploy-section-stack">
              <div className="deploy-card">
                <div className="deploy-card-header">
                  <div className="deploy-card-title-wrap">
                    <Terminal size={18} className="text-gold" />
                    <span className="deploy-card-title">Quick Copy Commands</span>
                  </div>
                </div>

                <p className="deploy-instruction">
                  If you prefer pushing via your local command prompt or PowerShell:
                </p>

                {/* PowerShell Command */}
                <div className="deploy-cli-box">
                  <div className="deploy-cli-header">
                    <span>PowerShell / CMD</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() =>
                        handleCopy(
                          `git add .\ngit commit -m "feat: CineTrack Movie & TV Watchlist with Vercel Deploy"\ngit push origin main`,
                          'ps_commands'
                        )
                      }
                    >
                      {copiedKey === 'ps_commands' ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedKey === 'ps_commands' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="deploy-cli-code">
{`git add .
git commit -m "feat: CineTrack Movie & TV Watchlist with Vercel Deploy"
git push origin main`}
                  </pre>
                </div>

                {/* Local Script */}
                <div className="deploy-cli-box" style={{ marginTop: '12px' }}>
                  <div className="deploy-cli-header">
                    <span>1-Click Windows Automation Script</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleCopy('.\\push_to_github.bat', 'bat_script')}
                    >
                      {copiedKey === 'bat_script' ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedKey === 'bat_script' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="deploy-cli-code">
{`.\\push_to_github.bat`}
                  </pre>
                </div>
              </div>

              {/* Local Django Git Status */}
              <div className="deploy-card">
                <div className="deploy-card-header">
                  <div className="deploy-card-title-wrap">
                    <FolderGit2 size={18} className="text-gold" />
                    <span className="deploy-card-title">Local Backend Git Connection</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={checkLocalGit}
                    disabled={isCheckingLocalGit}
                  >
                    <RefreshCw size={13} className={isCheckingLocalGit ? 'spin' : ''} />
                    <span>Check Status</span>
                  </button>
                </div>

                {localGitInfo ? (
                  localGitInfo.git_available ? (
                    <div className="deploy-local-git-details">
                      <div className="deploy-git-stat-row">
                        <span className="stat-label">Current Branch:</span>
                        <code className="stat-value">{localGitInfo.branch || 'main'}</code>
                      </div>
                      <div className="deploy-git-stat-row">
                        <span className="stat-label">Configured Remotes:</span>
                        <pre className="deploy-git-remotes-text">{localGitInfo.remotes || 'None'}</pre>
                      </div>
                    </div>
                  ) : (
                    <p className="deploy-instruction text-muted">
                      Local Django API is currently offline or unreachable. Using Direct Browser API Push instead.
                    </p>
                  )
                ) : (
                  <p className="deploy-instruction text-muted">
                    Click "Check Status" to query local backend git status.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer deploy-modal-footer">
          <div className="deploy-footer-branding">
            <span>CineTrack Deploy v{PROJECT_METADATA.version}</span>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GitHubDeployModal;
