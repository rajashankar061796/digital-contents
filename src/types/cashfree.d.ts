declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeInitOptions {
    mode: 'production' | 'sandbox';
  }

  export interface CashfreeCheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: '_self' | '_modal' | '_blank';
  }

  export interface CashfreeInstance {
    checkout(options: CashfreeCheckoutOptions): Promise<void | unknown>;
  }

  export function load(options: CashfreeInitOptions): Promise<CashfreeInstance>;
}
