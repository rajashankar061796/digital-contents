import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { LEGAL_CONFIG } from '@/config/legal';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-links">
          <Link to="/terms">Terms &amp; Conditions</Link>
          <span className="footer-separator">•</span>
          <Link to="/privacy">Privacy Policy</Link>
          <span className="footer-separator">•</span>
          <Link to="/refund-policy">Refund &amp; Cancellation Policy</Link>
          <span className="footer-separator">•</span>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="footer-badges">
          <div className="footer-badge-item">
            <Lock size={14} />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
          <div className="footer-badge-item">
            <ShieldCheck size={14} />
            <span>PCI-DSS Compliant Payments by Cashfree</span>
          </div>
          <div className="footer-badge-item">
            <Mail size={14} />
            <span>Support: {LEGAL_CONFIG.supportEmail}</span>
          </div>
        </div>

        <div className="footer-copyright">
          <p>© {new Date().getFullYear()} {LEGAL_CONFIG.businessName}. All rights reserved.</p>
          <p className="footer-disclaimer">
            Delivery: {LEGAL_CONFIG.deliveryMode} after payment confirmation. All prices in INR ({LEGAL_CONFIG.currency}).
          </p>
        </div>
      </div>
    </footer>
  );
};
