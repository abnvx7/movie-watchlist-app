/**
 * CineTrack GitHub REST & Git Data API Service
 * Enables client-side direct pushing to GitHub via GitHub Git Database API.
 */

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Validate GitHub Personal Access Token and retrieve user profile & scopes
 */
export async function validateGitHubToken(token) {
  if (!token || !token.trim()) {
    throw new Error('Please enter a GitHub Personal Access Token (PAT).');
  }

  const cleanToken = token.trim();
  const res = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `token ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Invalid or expired GitHub token. Please check your token and permissions.');
    }
    if (res.status === 403) {
      throw new Error('GitHub API rate limit exceeded or access forbidden.');
    }
    throw new Error(`GitHub API Error: ${res.statusText} (${res.status})`);
  }

  const userData = await res.json();
  const scopesHeader = res.headers.get('x-oauth-scopes') || '';
  const scopes = scopesHeader.split(',').map((s) => s.trim()).filter(Boolean);

  return {
    user: userData,
    scopes,
    hasRepoScope: scopes.length === 0 || scopes.includes('repo') || scopes.includes('public_repo'),
  };
}

/**
 * Fetch repositories owned or accessible by the authenticated user
 */
export async function fetchUserRepos(token) {
  const cleanToken = token.trim();
  const res = await fetch(`${GITHUB_API_BASE}/user/repos?sort=updated&per_page=100&type=all`, {
    headers: {
      Authorization: `token ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch repositories: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Create a new repository on GitHub for the authenticated user
 */
export async function createGitHubRepo(token, { name, description = '', isPrivate = false, autoInit = false }) {
  const cleanToken = token.trim();
  const res = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    method: 'POST',
    headers: {
      Authorization: `token ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name.trim(),
      description: description.trim() || 'CineTrack - Full-Stack Movie & TV Show Watchlist with Vercel Deployment',
      private: isPrivate,
      auto_init: autoInit,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message = errData.message || res.statusText;
    if (res.status === 422 && message.includes('name already exists')) {
      throw new Error(`A repository named "${name}" already exists on your GitHub account.`);
    }
    throw new Error(`Failed to create repository: ${message}`);
  }

  return await res.json();
}

/**
 * Helper to encode UTF-8 string to base64 safely in browser
 */
function utf8ToBase64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

/**
 * Push full project files to a GitHub repository using Git Database REST API
 * (Blobs -> Trees -> Commits -> Refs)
 */
export async function pushProjectToGitHub(token, {
  owner,
  repo,
  branch = 'main',
  commitMessage = 'feat: CineTrack Movie & TV Watchlist with Vercel Deploy',
  files = [],
  onProgress = () => {},
}) {
  const cleanToken = token.trim();
  const headers = {
    Authorization: `token ${cleanToken}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  const log = (msg, level = 'info') => {
    onProgress({ message: msg, level, timestamp: new Date().toLocaleTimeString() });
  };

  log(`Connecting to repository https://github.com/${owner}/${repo}...`);

  // Step 1: Check repository and branch reference
  let parentCommitSha = null;
  let baseTreeSha = null;
  let isNewBranch = false;

  try {
    const refRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
      headers,
    });

    if (refRes.ok) {
      const refData = await refRes.json();
      parentCommitSha = refData.object.sha;
      log(`Found existing branch "${branch}" at commit ${parentCommitSha.substring(0, 7)}.`);

      // Get commit tree
      const commitRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits/${parentCommitSha}`, {
        headers,
      });
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree.sha;
      }
    } else if (refRes.status === 404) {
      log(`Branch "${branch}" does not exist yet. Checking repository default branch...`);
      // Check if repo has any commits at all
      const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers });
      if (repoRes.ok) {
        const repoData = await repoRes.json();
        const defaultBranch = repoData.default_branch || 'main';
        const defaultRefRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`, { headers });
        if (defaultRefRes.ok) {
          const defaultRefData = await defaultRefRes.json();
          parentCommitSha = defaultRefData.object.sha;
          log(`Using default branch "${defaultBranch}" as base (commit ${parentCommitSha.substring(0, 7)}).`);
        } else {
          isNewBranch = true;
          log(`Repository is empty. Initializing brand new Git tree on branch "${branch}".`);
        }
      }
    }
  } catch (err) {
    log(`Notice during branch lookup: ${err.message}`, 'warning');
  }

  // Step 2: Create Blobs for each file
  log(`Preparing ${files.length} project files for upload...`);
  const treeItems = [];
  let uploadedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const blobRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: utf8ToBase64(file.content),
          encoding: 'base64',
        }),
      });

      if (!blobRes.ok) {
        const err = await blobRes.json().catch(() => ({}));
        throw new Error(`Failed to create blob for ${file.path}: ${err.message || blobRes.statusText}`);
      }

      const blobData = await blobRes.json();
      treeItems.push({
        path: file.path,
        mode: file.mode || '100644',
        type: 'blob',
        sha: blobData.sha,
      });

      uploadedCount++;
      if (uploadedCount % 5 === 0 || uploadedCount === files.length) {
        log(`Created Git Blobs: ${uploadedCount}/${files.length} files processed...`);
      }
    } catch (fileErr) {
      log(`Error uploading ${file.path}: ${fileErr.message}`, 'error');
      throw fileErr;
    }
  }

  // Step 3: Create Git Tree
  log('Constructing Git tree with project directory hierarchy...');
  const treePayload = {
    tree: treeItems,
  };
  // If baseTreeSha exists and we want to keep previous unmanaged files, include it
  if (baseTreeSha) {
    treePayload.base_tree = baseTreeSha;
  }

  const createTreeRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify(treePayload),
  });

  if (!createTreeRes.ok) {
    const treeErr = await createTreeRes.json().catch(() => ({}));
    throw new Error(`Failed to create Git tree: ${treeErr.message || createTreeRes.statusText}`);
  }

  const newTree = await createTreeRes.json();
  log(`Git tree created successfully (SHA: ${newTree.sha.substring(0, 7)}).`);

  // Step 4: Create Git Commit
  log(`Creating Git commit with message: "${commitMessage}"...`);
  const commitPayload = {
    message: commitMessage,
    tree: newTree.sha,
    parents: parentCommitSha ? [parentCommitSha] : [],
  };

  const createCommitRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify(commitPayload),
  });

  if (!createCommitRes.ok) {
    const commitErr = await createCommitRes.json().catch(() => ({}));
    throw new Error(`Failed to create Git commit: ${commitErr.message || createCommitRes.statusText}`);
  }

  const newCommit = await createCommitRes.json();
  log(`Git commit created successfully (SHA: ${newCommit.sha.substring(0, 7)}).`);

  // Step 5: Update or create branch reference
  log(`Updating branch reference "refs/heads/${branch}"...`);
  let updateRefRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      sha: newCommit.sha,
      force: true,
    }),
  });

  if (!updateRefRes.ok && updateRefRes.status === 404) {
    // Reference doesn't exist yet, create it
    log(`Branch reference "refs/heads/${branch}" not found. Creating new reference...`);
    updateRefRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: newCommit.sha,
      }),
    });
  }

  if (!updateRefRes.ok) {
    const refErr = await updateRefRes.json().catch(() => ({}));
    throw new Error(`Failed to update branch reference: ${refErr.message || updateRefRes.statusText}`);
  }

  const repoUrl = `https://github.com/${owner}/${repo}`;
  const commitUrl = `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`;
  const vercelDeployUrl = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(repoUrl)}`;

  log(`🎉 SUCCESS! Code pushed directly to GitHub repository: ${repoUrl}`, 'success');
  log(`Branch "${branch}" is now at commit ${newCommit.sha.substring(0, 7)}.`, 'success');

  return {
    success: true,
    owner,
    repo,
    branch,
    commitSha: newCommit.sha,
    commitUrl,
    repoUrl,
    vercelDeployUrl,
  };
}
