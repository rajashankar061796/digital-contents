import React from 'react';
import defaultCover from '@/assets/product/default-cover.svg';

// Dynamically check if custom cover files exist in the assets directory
// (User can simply add cover.png, cover.jpg, or cover.webp to src/assets/product/)
const customCovers = import.meta.glob<{ default: string }>(
  '@/assets/product/cover.{png,jpg,jpeg,webp,svg}',
  { eager: true }
);

export const ProductCover: React.FC = () => {
  // Check if user has supplied a custom cover
  const customCoverPath = Object.values(customCovers)[0]?.default;
  const imageSrc = customCoverPath || defaultCover;

  return (
    <div className="product-cover-wrapper">
      <div className="book-container">
        <div className="book-shadow"></div>
        <div className="book-cover">
          <img
            src={imageSrc}
            alt="Artificial Intelligence - An brief overview for beginners Book Cover"
            className="cover-image"
            loading="eager"
          />
          <div className="book-spine-highlight"></div>
        </div>
      </div>
      <div className="format-badge">
        <span className="badge-dot"></span>
        PDF Digital Guide • Instant Download
      </div>
    </div>
  );
};
