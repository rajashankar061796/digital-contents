import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="landing-layout">
      <Header />
      <main className="success-page">
        <div className="container success-container">
          <div className="status-card">
            <div className="status-icon-wrapper icon-verifying">
              <FileQuestion size={36} />
            </div>
            <h1 className="status-title">Page Not Found</h1>
            <p className="status-subtitle">
              The page you are looking for does not exist or has been moved.
            </p>
            <div className="action-buttons-group">
              <Link to="/" className="download-button" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                <ArrowLeft size={18} />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
