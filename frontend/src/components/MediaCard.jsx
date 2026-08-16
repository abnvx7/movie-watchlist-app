import React, { useState } from 'react';
import { Film, Tv, CheckCircle2, Clock, Trash2, Edit3, MessageSquare, Calendar } from 'lucide-react';
import StarRating from './StarRating';

const MediaCard = ({ media, onRate, onToggleStatus, onEdit, onDelete }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isWatched = media.status === 'Watched';
  const isMovie = media.media_type === 'Movie';

  const handleRate = async (newRating) => {
    setIsUpdating(true);
    await onRate(media.id, newRating);
    setIsUpdating(false);
  };

  const handleToggle = async () => {
    setIsUpdating(true);
    await onToggleStatus(media.id);
    setIsUpdating(false);
  };

  return (
    <article className="media-card" data-id={media.id}>
      {/* Poster / Header image */}
      <div className="card-poster-wrap">
        {media.poster_url ? (
          <img
            src={media.poster_url}
            alt={media.title}
            className="card-poster"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div 
          className="card-poster-placeholder" 
          style={{ display: media.poster_url ? 'none' : 'flex' }}
        >
          {isMovie ? <Film size={36} /> : <Tv size={36} />}
          <span>{media.title}</span>
        </div>

        {/* Overlay Badges */}
        <div className="card-overlay-badges">
          <span className={`badge ${isMovie ? 'badge-movie' : 'badge-tv'}`}>
            {isMovie ? <Film size={12} /> : <Tv size={12} />}
            {media.media_type}
          </span>
          <span className={`badge ${isWatched ? 'badge-watched' : 'badge-unwatched'}`}>
            {isWatched ? <CheckCircle2 size={12} /> : <Clock size={12} />}
            {isWatched ? 'Watched' : 'To Watch'}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="card-body">
        <div className="card-header-info">
          <h3 className="card-title" title={media.title}>{media.title}</h3>
          
          <div className="card-meta-line">
            {media.release_year && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} />
                {media.release_year}
              </span>
            )}
            {media.genre && <span>&bull; {media.genre}</span>}
          </div>
        </div>

        {/* Interactive 5-Star Rating Section */}
        <div className="card-rating-section">
          <div className="rating-header">
            <span>Rating</span>
            {media.rating > 0 && <span style={{ color: 'var(--accent-gold)' }}>{media.rating} / 5</span>}
          </div>
          <StarRating
            rating={media.rating}
            onRate={handleRate}
            disabled={isUpdating}
            size={20}
          />
        </div>

        {/* Optional Notes */}
        {media.notes && (
          <div>
            <button
              type="button"
              className="btn-ghost btn-sm"
              style={{ padding: '0.2rem 0', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setShowNotes(!showNotes)}
            >
              <MessageSquare size={13} />
              {showNotes ? 'Hide Notes' : 'View Notes'}
            </button>
            {showNotes && (
              <p className="card-notes-text">{media.notes}</p>
            )}
          </div>
        )}

        {/* Card Actions Row */}
        <div className="card-actions-row">
          <button
            type="button"
            className={`btn btn-sm ${isWatched ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleToggle}
            disabled={isUpdating}
            title={isWatched ? 'Move back to To-Watch' : 'Mark item as watched'}
          >
            {isWatched ? (
              <>
                <Clock size={14} /> Move to To Watch
              </>
            ) : (
              <>
                <CheckCircle2 size={14} /> Mark as Watched
              </>
            )}
          </button>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-icon-only btn-sm"
              onClick={() => onEdit(media)}
              title="Edit media details"
            >
              <Edit3 size={14} />
            </button>
            <button
              type="button"
              className="btn btn-danger btn-icon-only btn-sm"
              onClick={() => onDelete(media.id)}
              title="Delete item"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MediaCard;
