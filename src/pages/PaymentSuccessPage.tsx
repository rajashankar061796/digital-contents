import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Loader2, 
  ArrowLeft, 
  RefreshCw, 
  ShieldAlert
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PRODUCT_CONFIG } from '@/config/payment';

type VerificationState = 'verifying' | 'success' | 'pending' | 'failed' | 'invalid';

interface VerifyResponse {
  success: boolean;
  orderId?: string;
  orderStatus?: string;
  downloadToken?: string;
  expiresIn?: number;
  message?: string;
}

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Cashfree standard query parameters on return
  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || searchParams.get('cf_id');
  const paymentStatus = searchParams.get('payment_status') || searchParams.get('status');

  const [status, setStatus] = useState<VerificationState>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [downloadToken, setDownloadToken] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const autoDownloadTriggered = useRef<boolean>(false);

  const performVerification = useCallback(async () => {
    if (!orderId) {
      setStatus('invalid');
      setErrorMessage(
        'No order identifier was found in the URL. If you completed a payment, please check your confirmation email or return to the store.'
      );
      return;
    }

    setStatus('verifying');
    setErrorMessage('');

    try {
      // Server-side payment verification call via Cloudflare Pages Function
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, clientStatus: paymentStatus }),
      });

      const data: VerifyResponse = await response.json();

      if (!response.ok || !data.success) {
        if (data.orderStatus === 'PENDING' || data.orderStatus === 'ACTIVE') {
          setStatus('pending');
          setErrorMessage(data.message || 'Payment is currently processing with your bank/UPI. Please wait a moment and refresh.');
        } else if (data.orderStatus === 'FAILED' || data.orderStatus === 'CANCELLED' || data.orderStatus === 'USER_DROPPED') {
          setStatus('failed');
          setErrorMessage(data.message || 'The payment was not completed or was cancelled.');
        } else {
          setStatus('failed');
          setErrorMessage(data.message || 'Payment verification could not be completed. Please contact support.');
        }
        return;
      }

      // Successful verification
      if (data.downloadToken) {
        setDownloadToken(data.downloadToken);
        setStatus('success');
      } else {
        setStatus('failed');
        setErrorMessage('Verification succeeded but no download authorization token was issued.');
      }
    } catch (err: unknown) {
      // In local dev without Cloudflare Worker running, show clear informative message
      console.error('Verification error:', err);
      setStatus('failed');
      setErrorMessage(
        'Unable to connect to the verification server. Ensure Cloudflare Functions are running (or test with mock parameters).'
      );
    }
  }, [orderId, paymentStatus]);

  useEffect(() => {
    performVerification();
  }, [performVerification]);

  // Handle PDF Download
  const triggerDownload = useCallback((token: string) => {
    if (!token) return;
    setIsDownloading(true);

    const downloadUrl = `/api/download?token=${encodeURIComponent(token)}`;
    
    // Create hidden anchor element to trigger clean file download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'Artificial-Intelligence-An-brief-overview-for-beginners.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  }, []);

  // Automatic download attempt on verification success
  useEffect(() => {
    if (status === 'success' && downloadToken && !autoDownloadTriggered.current) {
      autoDownloadTriggered.current = true;
      // Slight delay to allow DOM to render before auto-download attempt
      const timer = setTimeout(() => {
        triggerDownload(downloadToken);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [status, downloadToken, triggerDownload]);

  return (
    <div className="landing-layout">
      <Header />

      <main className="success-page">
        <div className="container success-container">
          
          {/* VERIFYING STATE */}
          {status === 'verifying' && (
            <div className="status-card state-verifying">
              <div className="status-icon-wrapper icon-verifying">
                <Loader2 size={36} className="spinner" />
              </div>
              <h1 className="status-title">Verifying Payment...</h1>
              <p className="status-subtitle">
                Please wait while we verify your transaction securely with Cashfree.
              </p>
              {orderId && (
                <div className="order-details-box">
                  <div className="detail-row">
                    <span className="detail-label">Order ID:</span>
                    <span className="detail-value">{orderId}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === 'success' && (
            <div className="status-card state-success">
              <div className="status-icon-wrapper icon-success">
                <CheckCircle2 size={40} />
              </div>
              
              <h1 className="status-title">Payment Successful 🎉</h1>
              <p className="status-subtitle">
                Thank you for your purchase. Your digital copy of <strong>"{PRODUCT_CONFIG.title}"</strong> is ready.
              </p>

              <div className="order-details-box">
                <div className="detail-row">
                  <span className="detail-label">Product:</span>
                  <span className="detail-value">{PRODUCT_CONFIG.title}</span>
                </div>
                {orderId && (
                  <div className="detail-row">
                    <span className="detail-label">Order ID:</span>
                    <span className="detail-value">{orderId}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Price Paid:</span>
                  <span className="detail-value">{PRODUCT_CONFIG.priceDisplay}</span>
                </div>
              </div>

              <div className="action-buttons-group">
                <button
                  type="button"
                  id="download-pdf-btn"
                  onClick={() => triggerDownload(downloadToken)}
                  disabled={isDownloading}
                  className={`download-button ${isDownloading ? 'downloading' : ''}`}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 size={20} className="spinner" />
                      <span>Downloading PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
                <p className="download-auto-notice">
                  If your automatic download did not start, click the button above.
                </p>
              </div>
            </div>
          )}

          {/* PENDING STATE */}
          {status === 'pending' && (
            <div className="status-card state-pending">
              <div className="status-icon-wrapper icon-pending">
                <AlertTriangle size={36} />
              </div>
              <h1 className="status-title">Payment Processing</h1>
              <p className="status-subtitle">
                Your payment is currently being confirmed by the banking network. This usually completes in a few moments.
              </p>
              {errorMessage && <div className="error-message-box">{errorMessage}</div>}
              <div className="action-buttons-group">
                <button
                  type="button"
                  onClick={performVerification}
                  className="download-button"
                >
                  <RefreshCw size={18} />
                  <span>Check Status Again</span>
                </button>
                <Link to="/" className="secondary-button">
                  <ArrowLeft size={16} />
                  <span>Return to Home</span>
                </Link>
              </div>
            </div>
          )}

          {/* FAILED STATE */}
          {status === 'failed' && (
            <div className="status-card state-failed">
              <div className="status-icon-wrapper icon-failed">
                <XCircle size={36} />
              </div>
              <h1 className="status-title">Payment Not Completed</h1>
              <p className="status-subtitle">
                We could not verify a successful transaction for this order.
              </p>
              {errorMessage && <div className="error-message-box">{errorMessage}</div>}
              <div className="action-buttons-group">
                <button
                  type="button"
                  onClick={performVerification}
                  className="secondary-button"
                >
                  <RefreshCw size={16} />
                  <span>Retry Verification</span>
                </button>
                <Link to="/" className="download-button" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                  <ArrowLeft size={18} />
                  <span>Return to Product Page</span>
                </Link>
              </div>
            </div>
          )}

          {/* INVALID / DIRECT ACCESS STATE */}
          {status === 'invalid' && (
            <div className="status-card state-failed">
              <div className="status-icon-wrapper icon-failed">
                <ShieldAlert size={36} />
              </div>
              <h1 className="status-title">Access Restricted</h1>
              <p className="status-subtitle">
                This page can only be accessed after completing a verified purchase via Cashfree.
              </p>
              <div className="error-message-box">
                {errorMessage || 'Direct access without a valid purchase session is prohibited.'}
              </div>
              <div className="action-buttons-group">
                <Link to="/" className="download-button" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                  <ArrowLeft size={18} />
                  <span>Visit Product Page</span>
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};
