import React, { useState, useEffect } from 'react';
import { X, Film, Tv, Sparkles } from 'lucide-react';
import StarRating from './StarRating';

const POSTER_PRESETS = [
  { label: 'Sci-Fi Space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80' },
  { label: 'Cinema Neon', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80' },
  { label: 'Action Night', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80' },
  { label: 'Mystery Drama', url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&q=80' },
  { label: 'Desert Epic', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
];

const MediaModal = ({ isOpen, onClose, onSave, editingItem = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    media_type: 'Movie',
    status: 'Unwatched',
    rating: 0,
    genre: '',
    release_year: '',
    poster_url: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        media_type: editingItem.media_type || 'Movie',
        status: editingItem.status || 'Unwatched',
        rating: editingItem.rating || 0,
        genre: editingItem.genre || '',
        release_year: editingItem.release_year || '',
        poster_url: editingItem.poster_url || '',
        notes: editingItem.notes || '',
      });
    } else {
      setFormData({
        title: '',
        media_type: 'Movie',
        status: 'Unwatched',
        rating: 0,
        genre: '',
        release_year: new Date().getFullYear(),
        poster_url: '',
        notes: '',
      });
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const payload = {
      ...formData,
      release_year: formData.release_year ? parseInt(formData.release_year, 10) : null,
      rating: parseInt(formData.rating, 10) || 0,
    };

    const result = await onSave(payload, editingItem?.id);
    setIsSubmitting(false);

    if (result && result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingItem ? 'Edit Media Item' : 'Add to Watchlist'}</h2>
          <button type="button" className="btn btn-ghost btn-icon-only" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-error">{error}</div>}

            {/* Media Type Picker */}
            <div className="form-group">
              <label>Media Type</label>
              <div className="type-selector-group">
                <button
                  type="button"
                  className={`type-option-card ${formData.media_type === 'Movie' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, media_type: 'Movie' })}
                >
                  <Film size={18} />
                  <span>Movie</span>
                </button>
                <button
                  type="button"
                  className={`type-option-card ${formData.media_type === 'TV' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, media_type: 'TV' })}
                >
                  <Tv size={18} />
                  <span>TV Show</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label htmlFor="modal-title">Title *</label>
              <input
                id="modal-title"
                type="text"
                className="form-control"
                placeholder="e.g. Inception, Breaking Bad..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                autoFocus
              />
            </div>

            {/* Status & Rating */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="modal-status">Status</label>
                <select
                  id="modal-status"
                  className="select-control"
                  style={{ width: '100%' }}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Unwatched">To Watch</option>
                  <option value="Watched">Watched</option>
                </select>
              </div>

              <div className="form-group">
                <label>Rating (1-5 stars)</label>
                <div style={{ paddingTop: '4px' }}>
                  <StarRating
                    rating={formData.rating}
                    onRate={(val) => {
                      setFormData({
                        ...formData,
                        rating: val,
                        // Auto set to watched if user rates >= 1 star
                        status: val > 0 ? 'Watched' : formData.status
                      });
                    }}
                    size={22}
                  />
                </div>
              </div>
            </div>

            {/* Genre & Year */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="modal-genre">Genre</label>
                <input
                  id="modal-genre"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sci-Fi, Drama"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-year">Release Year</label>
                <input
                  id="modal-year"
                  type="number"
                  className="form-control"
                  placeholder="e.g. 2024"
                  min="1900"
                  max="2100"
                  value={formData.release_year}
                  onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
                />
              </div>
            </div>

            {/* Poster URL */}
            <div className="form-group">
              <label htmlFor="modal-poster">Poster Image URL (Optional)</label>
              <input
                id="modal-poster"
                type="url"
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={formData.poster_url}
                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
              />
              <div style={{ marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Sparkles size={12} /> Quick Poster Presets:
                </span>
                <div className="poster-suggestions-grid">
                  {POSTER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`poster-thumbnail-btn ${formData.poster_url === preset.url ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, poster_url: preset.url })}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="modal-notes">Personal Review / Notes (Optional)</label>
              <textarea
                id="modal-notes"
                className="form-control"
                rows="3"
                placeholder="What did you think? Why do you want to watch this?"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add to Watchlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaModal;
