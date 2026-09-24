import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LEGAL_CONFIG } from '@/config/legal';
import { ArrowLeft, Mail, Clock, ShieldAlert } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="landing-layout">
      <Header />

      <main className="legal-page">
        <div className="container legal-container">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Store</span>
          </Link>

          <div className="legal-card">
            <div className="legal-header">
              <div className="legal-icon-box">
                <Mail size={28} />
              </div>
              <div>
                <h1 className="legal-title">Contact Us</h1>
                <p className="legal-subtitle">We are here to help with any product or payment queries.</p>
              </div>
            </div>

            <div className="legal-content">
              <p>
                If you have questions about the guide, experienced an issue during checkout, or need support with your digital download, please reach out to our dedicated support team using the information below:
              </p>

              <div className="contact-grid">
                <div className="contact-card">
                  <div className="contact-icon">
                    <Mail size={22} />
                  </div>
                  <div className="contact-details">
                    <h3>Email Support</h3>
                    <p className="contact-value">
                      <a href={`mailto:${LEGAL_CONFIG.supportEmail}`}>{LEGAL_CONFIG.supportEmail}</a>
                    </p>
                    <span className="contact-note">Turnaround time: Within 24 hours</span>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-icon">
                    <Clock size={22} />
                  </div>
                  <div className="contact-details">
                    <h3>Support Hours</h3>
                    <p className="contact-value">{LEGAL_CONFIG.supportHours}</p>
                    <span className="contact-note">Standard Indian Time (IST)</span>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-icon">
                    <ShieldAlert size={22} />
                  </div>
                  <div className="contact-details">
                    <h3>Payment Assistance</h3>
                    <p className="contact-value">Instant Resolution</p>
                    <span className="contact-note">Include your Cashfree Order ID in your email for priority assistance.</span>
                  </div>
                </div>
              </div>

              <h2>Business Details</h2>
              <ul>
                <li><strong>Merchant / Brand:</strong> {LEGAL_CONFIG.businessName}</li>
                <li><strong>Category:</strong> Digital Educational Contents &amp; Publications</li>
                <li><strong>Operating Location:</strong> Tamil Nadu, India</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
