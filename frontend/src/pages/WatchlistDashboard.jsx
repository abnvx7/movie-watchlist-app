import React, { useState, useEffect, useCallback } from 'react';
import { 
  Film, 
  Tv, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import apiClient from '../api/axios';
import MediaCard from '../components/MediaCard';
import MediaModal from '../components/MediaModal';
import StatsBar from '../components/StatsBar';

const WatchlistDashboard = ({ isModalOpen, setIsModalOpen }) => {
  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab State: 'To Watch' (Unwatched) or 'Watched'
  const [activeTab, setActiveTab] = useState('To Watch');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'Movie' | 'TV'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'rating' | 'year' | 'title'

  // Modal State for Editing
  const [editingMedia, setEditingMedia] = useState(null);

  // Fetch Media Items from Backend
  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/media/');
      setMediaList(response.data);
    } catch (err) {
      console.error('Failed to load media items:', err);
      setError('Could not connect to backend server. Please verify backend is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Optimistic 5-Star Rating Update
  const handleRate = async (mediaId, newRating) => {
    // Optimistically update local state
    setMediaList((prev) =>
      prev.map((item) => {
        if (item.id === mediaId) {
          return {
            ...item,
            rating: newRating,
            // If user rates >= 1 star and item was unwatched, automatically mark as watched
            status: newRating > 0 && item.status === 'Unwatched' ? 'Watched' : item.status,
          };
        }
        return item;
      })
    );

    try {
      const response = await apiClient.patch(`/media/${mediaId}/rate/`, { rating: newRating });
      // Update with server returned data
      setMediaList((prev) =>
        prev.map((item) => (item.id === mediaId ? response.data : item))
      );
    } catch (err) {
      console.error('Failed to update rating:', err);
      // Rollback on error
      fetchMedia();
    }
  };

  // Optimistic Status Toggle (Watched <-> To Watch)
  const handleToggleStatus = async (mediaId) => {
    setMediaList((prev) =>
      prev.map((item) => {
        if (item.id === mediaId) {
          const newStatus = item.status === 'Watched' ? 'Unwatched' : 'Watched';
          return { ...item, status: newStatus };
        }
        return item;
      })
    );

    try {
      const response = await apiClient.patch(`/media/${mediaId}/toggle-status/`);
      setMediaList((prev) =>
        prev.map((item) => (item.id === mediaId ? response.data : item))
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
      fetchMedia();
    }
  };

  // Save (Create or Update)
  const handleSaveMedia = async (formData, editingId) => {
    try {
      if (editingId) {
        const res = await apiClient.put(`/media/${editingId}/`, formData);
        setMediaList((prev) =>
          prev.map((item) => (item.id === editingId ? res.data : item))
        );
      } else {
        const res = await apiClient.post('/media/', formData);
        setMediaList((prev) => [res.data, ...prev]);
        // Switch tab to the newly created item's status
        setActiveTab(res.data.status === 'Watched' ? 'Watched' : 'To Watch');
      }
      setEditingMedia(null);
      return { success: true };
    } catch (err) {
      console.error('Failed to save media:', err);
      return { error: 'Failed to save item. Please check the inputs.' };
    }
  };

  // Delete Media Item
  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this title from your watchlist?')) {
      return;
    }

    setMediaList((prev) => prev.filter((item) => item.id !== mediaId));

    try {
      await apiClient.delete(`/media/${mediaId}/`);
    } catch (err) {
      console.error('Failed to delete media:', err);
      fetchMedia();
    }
  };

  // Seed sample data for current user
  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/seed/');
      await fetchMedia();
    } catch (err) {
      console.error('Failed to seed sample items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter & Sort Logic
  const toWatchCount = mediaList.filter((m) => m.status === 'Unwatched').length;
  const watchedCount = mediaList.filter((m) => m.status === 'Watched').length;

  const currentTabStatus = activeTab === 'To Watch' ? 'Unwatched' : 'Watched';

  const filteredItems = mediaList
    .filter((item) => item.status === currentTabStatus)
    .filter((item) => {
      if (typeFilter === 'ALL') return true;
      return item.media_type === typeFilter;
    })
    .filter((item) => {
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        (item.genre && item.genre.toLowerCase().includes(query)) ||
        (item.notes && item.notes.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'year') return (b.release_year || 0) - (a.release_year || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <main className="main-content">
      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-row">
          <div>
            <h1>
              <Film size={28} color="var(--accent-gold)" />
              My Watchlist
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Track what to watch next and rate your favorite cinema & series.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => {
              setEditingMedia(null);
              setIsModalOpen(true);
            }}
            id="main-add-btn"
          >
            <Plus size={18} />
            <span>Add Movie / TV Show</span>
          </button>
        </div>

        {/* Global Statistics */}
        <StatsBar mediaList={mediaList} />
      </div>

      {/* Watchlist Controls (Tabs + Search + Filter + Sort) */}
      <section className="watchlist-controls" aria-label="Watchlist Navigation and Filters">
        {/* Two Main Tabs: "To Watch" & "Watched" */}
        <div className="tabs-container">
          <div className="tabs-pill-group" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'To Watch'}
              className={`tab-pill to-watch ${activeTab === 'To Watch' ? 'active' : ''}`}
              onClick={() => setActiveTab('To Watch')}
              id="tab-to-watch"
            >
              <Clock size={16} />
              <span>To Watch</span>
              <span className="tab-count">{toWatchCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'Watched'}
              className={`tab-pill watched ${activeTab === 'Watched' ? 'active' : ''}`}
              onClick={() => setActiveTab('Watched')}
              id="tab-watched"
            >
              <CheckCircle2 size={16} />
              <span>Watched</span>
              <span className="tab-count">{watchedCount}</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchMedia}
            title="Refresh Watchlist"
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? 'spinner' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Toolbar: Search, Type Filter, Sorting */}
        <div className="toolbar-row">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by title, genre, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-actions">
            {/* Filter by Type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                className="select-control"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter by type"
              >
                <option value="ALL">All Formats</option>
                <option value="Movie">Movies Only</option>
                <option value="TV">TV Shows Only</option>
              </select>
            </div>

            {/* Sort by */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowUpDown size={14} color="var(--text-muted)" />
              <select
                className="select-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort items"
              >
                <option value="newest">Recently Added</option>
                <option value="rating">Highest Rating</option>
                <option value="year">Release Year</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div className="alert-error" style={{ marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="loading-spinner-wrap">
          <div className="spinner"></div>
          <p>Syncing watchlist...</p>
        </div>
      )}

      {/* Media Cards Grid */}
      {!isLoading && filteredItems.length > 0 && (
        <div className="media-grid">
          {filteredItems.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              onRate={handleRate}
              onToggleStatus={handleToggleStatus}
              onEdit={(item) => {
                setEditingMedia(item);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteMedia}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="empty-state-box">
          <div className="empty-state-icon">
            {activeTab === 'To Watch' ? <Clock size={32} /> : <CheckCircle2 size={32} />}
          </div>
          <h3>
            {searchTerm
              ? `No ${activeTab.toLowerCase()} titles match "${searchTerm}"`
              : activeTab === 'To Watch'
              ? 'Your "To Watch" list is empty'
              : 'You haven\'t marked any titles as watched yet'}
          </h3>
          <p>
            {activeTab === 'To Watch'
              ? 'Discover something great and add it to your watchlist to start tracking.'
              : 'Rate movies or click "Mark as Watched" on your watchlist to build your personal filmography.'}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingMedia(null);
                setIsModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>Add Your First Title</span>
            </button>

            {mediaList.length === 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSeedData}
              >
                <Sparkles size={16} color="var(--accent-gold)" />
                <span>Load Sample Curated Titles</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Media Modal */}
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMedia(null);
        }}
        onSave={handleSaveMedia}
        editingItem={editingMedia}
      />
    </main>
  );
};

export default WatchlistDashboard;
