import React from 'react';
import { Film, Clock, CheckCircle2, Star } from 'lucide-react';

const StatsBar = ({ mediaList = [] }) => {
  const total = mediaList.length;
  const toWatch = mediaList.filter((m) => m.status === 'Unwatched').length;
  const watched = mediaList.filter((m) => m.status === 'Watched').length;

  const ratedItems = mediaList.filter((m) => m.rating > 0);
  const avgRating = ratedItems.length > 0
    ? (ratedItems.reduce((sum, m) => sum + m.rating, 0) / ratedItems.length).toFixed(1)
    : '0.0';

  return (
    <section className="stats-grid" aria-label="Watchlist Statistics">
      <div className="stat-card">
        <div className="stat-icon gold">
          <Film size={22} />
        </div>
        <div className="stat-details">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total Titles</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon blue">
          <Clock size={22} />
        </div>
        <div className="stat-details">
          <span className="stat-value">{toWatch}</span>
          <span className="stat-label">To Watch</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon emerald">
          <CheckCircle2 size={22} />
        </div>
        <div className="stat-details">
          <span className="stat-value">{watched}</span>
          <span className="stat-label">Watched</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon gold">
          <Star size={22} />
        </div>
        <div className="stat-details">
          <span className="stat-value">{avgRating} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 5</span></span>
          <span className="stat-label">Avg Rating ({ratedItems.length})</span>
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
