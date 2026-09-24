/**
 * Cloudflare Pages Functions Environment Bindings & Types
 */

export interface Env {
  // Optional R2 Bucket Binding (if R2 is used; otherwise static protected assets are used)
  PDF_BUCKET?: R2Bucket;

  // Filename / Object key for the PDF
  PDF_OBJECT_KEY?: string;

  // Static Assets fetcher
  ASSETS?: Fetcher;

  // Cashfree API Credentials
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;

  // Cashfree Environment ("production" or "sandbox")
  CASHFREE_ENVIRONMENT?: 'production' | 'sandbox';

  // Cashfree API Version
  CASHFREE_API_VERSION?: string;

  // Public Site Base URL (e.g. "https://digital-contents.pages.dev")
  SITE_URL?: string;

  // Optional Webhook Secret
  CASHFREE_WEBHOOK_SECRET?: string;

  // Optional signing secret for HMAC download tokens (falls back to CASHFREE_SECRET_KEY)
  DOWNLOAD_SIGNING_SECRET?: string;
}

export interface DownloadTokenPayload {
  orderId: string;
  iat: number; // Issued at (timestamp in ms)
  exp: number; // Expires at (timestamp in ms)
}

export interface CashfreeCreateOrderResponse {
  cf_order_id?: number | string;
  order_id: string;
  order_status: string;
  order_amount: number;
  order_currency: string;
  payment_session_id: string;
  order_meta?: {
    return_url?: string;
    notify_url?: string;
    payment_methods?: string;
  };
  message?: string;
  code?: string;
  type?: string;
}

export interface CashfreeOrderResponse {
  cf_order_id?: number | string;
  order_id: string;
  order_status: 'PAID' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'CANCELLED';
  order_amount: number;
  order_currency: string;
  payment_session_id?: string;
  order_note?: string;
  customer_details?: {
    customer_id?: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
  };
}
