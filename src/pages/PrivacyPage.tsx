import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LEGAL_CONFIG } from '@/config/legal';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
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
                <Shield size={28} />
              </div>
              <div>
                <h1 className="legal-title">Privacy Policy</h1>
                <p className="legal-subtitle">Last updated: {LEGAL_CONFIG.lastUpdated}</p>
              </div>
            </div>

            <div className="legal-content">
              <h2>1. Overview</h2>
              <p>
                <strong>{LEGAL_CONFIG.businessName}</strong> respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how your information is collected, used, and safeguarded when you purchase our digital products.
              </p>

              <h2>2. Information We Collect</h2>
              <p>When you place an order on our website, we may collect the following details:</p>
              <ul>
                <li><strong>Contact Information:</strong> Full name, email address, and phone number provided during checkout.</li>
                <li><strong>Transaction Details:</strong> Order ID, payment timestamp, payment status, and amount paid.</li>
                <li><strong>Technical Information:</strong> IP address, browser type, and device information for security and fraud prevention.</li>
              </ul>
              <p>
                <strong>Financial Data:</strong> We do NOT collect or store your credit/debit card numbers, CVV, netbanking passwords, or UPI PINs. All payment transactions are processed directly by our PCI-DSS Level 1 compliant payment processor, <strong>Cashfree</strong>.
              </p>

              <h2>3. How We Use Your Information</h2>
              <p>We use your information solely for the following purposes:</p>
              <ul>
                <li>Fulfilling your digital order and delivering the PDF download link.</li>
                <li>Verifying legitimate payment transactions and preventing fraudulent activity.</li>
                <li>Providing customer support and responding to inquiries.</li>
                <li>Complying with statutory accounting and tax obligations.</li>
              </ul>

              <h2>4. Information Sharing &amp; Third Parties</h2>
              <p>
                We do NOT sell, trade, or rent your personal data to third parties for marketing purposes. We share data only with trusted service providers strictly necessary to fulfill our service:
              </p>
              <ul>
                <li><strong>Cashfree Payments:</strong> To securely process and verify payments.</li>
                <li><strong>Cloudflare:</strong> For secure website hosting and content delivery.</li>
              </ul>

              <h2>5. Data Security</h2>
              <p>
                We implement industry-standard 256-bit SSL encryption, HMAC-SHA256 signed download authorization tokens, and secure cloud infrastructure to ensure your data remains protected against unauthorized access.
              </p>

              <h2>6. Your Rights</h2>
              <p>
                You have the right to request access to or deletion of your contact data stored for customer support. To exercise these rights, please contact our support team.
              </p>

              <h2>7. Contact Us</h2>
              <p>
                If you have any questions or concerns regarding our privacy practices, please contact us at: <a href={`mailto:${LEGAL_CONFIG.supportEmail}`}>{LEGAL_CONFIG.supportEmail}</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
