import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="site-header">
      <div className="container header-container">
        <Link to="/" className="brand-logo" aria-label="Digital Contents Home">
          <div className="logo-icon">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <span className="brand-name">Digital Contents</span>
        </Link>
      </div>
    </header>
  );
};
