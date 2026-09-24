import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  FileText, 
  BookOpen,
  Sparkles,
  Lock,
  Globe,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { load } from '@cashfreepayments/cashfree-js';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCover } from '@/components/ProductCover';
import { PRODUCT_CONFIG } from '@/config/payment';

interface CreateOrderResponse {
  success: boolean;
  order_id?: string;
  payment_session_id?: string;
  environment?: 'production' | 'sandbox';
  message?: string;
}

export const HomePage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleCheckout = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // 1. Call serverless backend endpoint to create Cashfree order
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: CreateOrderResponse = await response.json();

      if (!response.ok || !data.success || !data.payment_session_id) {
        throw new Error(data.message || 'Failed to initiate payment session with Cashfree.');
      }

      // 2. Initialize official Cashfree JS SDK
      const cashfree = await load({
        mode: data.environment === 'sandbox' ? 'sandbox' : 'production',
      });

      // 3. Open Cashfree Hosted Checkout (Modal popup)
      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: '_modal',
      });
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setErrorMessage(message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="landing-layout">
      <Header />

      <main className="product-page">
        <div className="container">
          <div className="product-hero-grid">
            
            {/* Left Column: Product Cover & 3D Book Graphic */}
            <div className="product-cover-column">
              <ProductCover />
            </div>

            {/* Right Column: Title, Description, Curriculum, Price & Buy Button */}
            <div className="product-details-column">
              
              {/* Product Header */}
              <div className="product-header-section">
                <div className="category-tag">
                  <Sparkles size={14} />
                  <span>Beginner's Digital Guide</span>
                </div>

                {/* IMPORTANT: Title is intentionally verbatim as required */}
                <h1 className="product-title">
                  {PRODUCT_CONFIG.title}
                </h1>

                <p className="product-description">
                  {PRODUCT_CONFIG.subtitle} An approachable, jargon-free guide designed to give you a clear and structured understanding of how modern artificial intelligence works, its real-world applications, and what lies ahead.
                </p>
              </div>

              {/* What You'll Learn Section (6 Core Topics) */}
              <section className="learning-card" aria-labelledby="learning-heading">
                <h2 id="learning-heading" className="card-title">
                  <BookOpen size={20} className="title-icon" />
                  What you'll learn
                </h2>
                <div className="learning-grid">
                  {PRODUCT_CONFIG.whatYouWillLearn.map((item) => (
                    <div key={item.number} className="learning-card-item">
                      <div className="learning-number-badge">{item.number}</div>
                      <div className="learning-content">
                        <h3 className="learning-item-title">{item.title}</h3>
                        <p className="learning-item-desc">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Pricing & Purchase Box */}
              <div className="purchase-card">
                <div className="price-row">
                  <div className="price-value-box">
                    <span className="currency-price">{PRODUCT_CONFIG.priceDisplay}</span>
                    <span className="price-type">/ {PRODUCT_CONFIG.pricingType}</span>
                  </div>
                  <span className="deal-badge">Instant Delivery</span>
                </div>

                {/* Purchase Button */}
                <button
                  type="button"
                  id="buy-product-btn"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className={`buy-button ${isProcessing ? 'button-loading' : ''}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="spinner" />
                      <span>Preparing Secure Checkout...</span>
                    </>
                  ) : (
                    <>
                      <span>{PRODUCT_CONFIG.buttonText}</span>
                      <ArrowRight size={20} className="btn-icon" />
                    </>
                  )}
                </button>

                {errorMessage && (
                  <div className="checkout-error-banner">
                    <AlertCircle size={18} className="error-icon" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="guarantee-row">
                  <div className="guarantee-item">
                    <Lock size={14} />
                    <span>Secure Cashfree Hosted Checkout</span>
                  </div>
                  <div className="guarantee-item">
                    <Zap size={14} />
                    <span>Instant PDF Download</span>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              <div className="product-specs-grid">
                <div className="spec-item">
                  <div className="spec-icon-box">
                    <FileText size={20} />
                  </div>
                  <div className="spec-text">
                    <span className="spec-label">Format</span>
                    <span className="spec-value">{PRODUCT_CONFIG.format}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <div className="spec-icon-box">
                    <Globe size={20} />
                  </div>
                  <div className="spec-text">
                    <span className="spec-label">Language</span>
                    <span className="spec-value">{PRODUCT_CONFIG.language}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <div className="spec-icon-box">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="spec-text">
                    <span className="spec-label">Access</span>
                    <span className="spec-value">{PRODUCT_CONFIG.delivery}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
