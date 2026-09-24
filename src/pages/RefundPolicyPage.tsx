import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LEGAL_CONFIG } from '@/config/legal';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
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
                <RefreshCw size={28} />
              </div>
              <div>
                <h1 className="legal-title">Refund &amp; Cancellation Policy</h1>
                <p className="legal-subtitle">Last updated: {LEGAL_CONFIG.lastUpdated}</p>
              </div>
            </div>

            <div className="legal-content">
              <h2>1. Nature of Digital Products</h2>
              <p>
                All products sold on <strong>{LEGAL_CONFIG.businessName}</strong> are intangible digital goods (PDF eBooks / guides) that are delivered electronically immediately upon payment confirmation.
              </p>

              <h2>2. Refund Eligibility</h2>
              <p>
                Due to the immediate delivery and downloadable nature of digital content, <strong>all sales are generally final and non-refundable once the download link is accessed</strong>.
              </p>
              <p>However, we provide a full refund in the following exceptional circumstances:</p>
              <ul>
                <li><strong>Duplicate Payment:</strong> If you were accidentally charged twice for the same order due to a network glitch or payment gateway retry.</li>
                <li><strong>Delivery Failure:</strong> If your payment was deducted but the server was unable to generate your download authorization and our support team is unable to deliver the file within 24 hours of reporting.</li>
                <li><strong>Corrupted File:</strong> If the downloaded PDF file is corrupted/unreadable and a replacement cannot be provided.</li>
              </ul>

              <h2>3. Cancellation Policy</h2>
              <p>
                Because digital goods are delivered instantly, orders cannot be cancelled once the payment is completed and the transaction status is marked as successful.
              </p>

              <h2>4. How to Request a Refund</h2>
              <p>To request a refund for an eligible duplicate or failed transaction:</p>
              <ol>
                <li>Send an email to <strong><a href={`mailto:${LEGAL_CONFIG.supportEmail}`}>{LEGAL_CONFIG.supportEmail}</a></strong> within <strong>7 days</strong> of the transaction.</li>
                <li>Include your <strong>Cashfree Order ID</strong> or payment reference number.</li>
                <li>Include the payment receipt or transaction screenshot from your bank/UPI app.</li>
              </ol>

              <h2>5. Refund Processing Timeline</h2>
              <p>
                Once approved, refunds will be initiated through Cashfree to the original payment method (Bank Account, UPI, or Card).
              </p>
              <ul>
                <li><strong>UPI / Netbanking:</strong> Usually credited within 2 to 4 business days.</li>
                <li><strong>Credit / Debit Cards:</strong> Usually reflected within 5 to 7 business days, depending on your card issuer.</li>
              </ul>

              <h2>6. Support Contact</h2>
              <p>
                For any payment disputes or billing questions, reach us at: <a href={`mailto:${LEGAL_CONFIG.supportEmail}`}>{LEGAL_CONFIG.supportEmail}</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
