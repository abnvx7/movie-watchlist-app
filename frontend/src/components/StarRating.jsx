import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RATING_LABELS = {
  0: 'Unrated',
  1: '1 - Poor',
  2: '2 - Fair',
  3: '3 - Good',
  4: '4 - Great',
  5: '5 - Masterpiece',
};

const StarRating = ({ rating = 0, onRate, disabled = false, size = 18, showLabel = true }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const activeRating = hoverRating > 0 ? hoverRating : rating;

  const handleClick = (starValue, e) => {
    e.stopPropagation();
    if (disabled || !onRate) return;
    // If clicking the current rating, allow clearing to 0, otherwise set starValue
    const newRating = starValue === rating ? 0 : starValue;
    onRate(newRating);
  };

  return (
    <div className="star-rating-wrapper">
      <div 
        className="star-rating-container" 
        onMouseLeave={() => setHoverRating(0)}
        role="radiogroup" 
        aria-label="Star Rating"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;
          const isHovered = hoverRating > 0 && star <= hoverRating;

          return (
            <button
              key={star}
              type="button"
              className={`star-button ${isFilled ? 'filled' : ''} ${isHovered ? 'hover-preview' : ''}`}
              onClick={(e) => handleClick(star, e)}
              onMouseEnter={() => !disabled && setHoverRating(star)}
              disabled={disabled}
              title={RATING_LABELS[star]}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                size={size}
                fill={isFilled ? 'currentColor' : 'none'}
                strokeWidth={isFilled ? 1.5 : 1.75}
              />
            </button>
          );
        })}
      </div>
      {showLabel && (
        <span className="rating-hint-text">
          {RATING_LABELS[activeRating] || ''}
        </span>
      )}
    </div>
  );
};

export default StarRating;
