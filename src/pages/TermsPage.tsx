import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LEGAL_CONFIG } from '@/config/legal';
import { ArrowLeft, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
                <FileText size={28} />
              </div>
              <div>
                <h1 className="legal-title">Terms &amp; Conditions</h1>
                <p className="legal-subtitle">Last updated: {LEGAL_CONFIG.lastUpdated}</p>
              </div>
            </div>

            <div className="legal-content">
              <h2>1. Introduction</h2>
              <p>
                Welcome to <strong>{LEGAL_CONFIG.businessName}</strong>. By accessing or purchasing from our website, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, please do not use our services.
              </p>

              <h2>2. Digital Products &amp; Delivery</h2>
              <p>
                We sell digital educational content, specifically the electronic PDF guide titled <strong>"{LEGAL_CONFIG.productName}"</strong>.
              </p>
              <ul>
                <li><strong>Delivery Method:</strong> Instant digital download upon successful payment verification.</li>
                <li><strong>Delivery Time:</strong> Immediate (typically under 10 seconds following transaction confirmation).</li>
                <li><strong>Format:</strong> Adobe Portable Document Format (.PDF).</li>
              </ul>

              <h2>3. Pricing &amp; Payments</h2>
              <p>
                The product price is clearly stated as <strong>{LEGAL_CONFIG.productPrice} ({LEGAL_CONFIG.currency})</strong> as a one-time purchase.
              </p>
              <p>
                Payments are processed securely through our authorized payment gateway partner, <strong>Cashfree Payments India Private Limited</strong>. We do not store or process your credit/debit card numbers, CVV, or UPI PINs on our servers.
              </p>

              <h2>4. License &amp; Intellectual Property Rights</h2>
              <p>
                Upon purchasing, you are granted a non-exclusive, non-transferable, revocable license for <strong>personal, non-commercial use only</strong>.
              </p>
              <p>You agree NOT to:</p>
              <ul>
                <li>Resell, redistribute, rent, lease, or sub-license the PDF content.</li>
                <li>Upload the file to public file-sharing networks, torrent sites, or unauthorized websites.</li>
                <li>Claim authorship or copyright over any portion of the guide.</li>
              </ul>

              <h2>5. Disclaimer &amp; Limitation of Liability</h2>
              <p>
                The digital contents provided are for educational and informational purposes only. While every effort has been made to ensure the accuracy of the material, {LEGAL_CONFIG.businessName} makes no warranties or representations regarding specific outcomes or results. In no event shall {LEGAL_CONFIG.businessName} be liable for any indirect or consequential damages.
              </p>

              <h2>6. Governing Law &amp; Jurisdiction</h2>
              <p>
                These Terms and Conditions shall be governed by and construed in accordance with the laws of {LEGAL_CONFIG.country}. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in India.
              </p>

              <h2>7. Contact Information</h2>
              <p>
                For questions regarding these Terms, please contact us at: <a href={`mailto:${LEGAL_CONFIG.supportEmail}`}>{LEGAL_CONFIG.supportEmail}</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
