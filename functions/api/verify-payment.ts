import { Env, CashfreeOrderResponse } from '../types';
import { signDownloadToken } from '../utils/crypto';

interface VerifyRequestBody {
  orderId?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return handleVerification(context);
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return handleVerification(context);
};

async function handleVerification(context: EventContext<Env, any, any>): Promise<Response> {
  const { request, env } = context;

  // Extract orderId from POST JSON body or GET search query
  let orderId: string | undefined;

  if (request.method === 'POST') {
    try {
      const body = (await request.json()) as VerifyRequestBody;
      orderId = body?.orderId;
    } catch {
      // Body may not be JSON
    }
  }

  if (!orderId) {
    const url = new URL(request.url);
    orderId = url.searchParams.get('order_id') || url.searchParams.get('orderId') || undefined;
  }

  if (!orderId || typeof orderId !== 'string' || orderId.trim().length === 0) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid request: "orderId" parameter is required for payment verification.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const cleanOrderId = orderId.trim();
  const signingSecret = env.DOWNLOAD_SIGNING_SECRET || env.CASHFREE_SECRET_KEY || 'dev-fallback-secret-key-32chars!';

  // ===========================================================================
  // 1. Check Cashfree Server Credentials
  // ===========================================================================
  if (!env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) {
    return new Response(
      JSON.stringify({
        success: false,
        orderId: cleanOrderId,
        message: 'Cashfree server credentials (CASHFREE_APP_ID & CASHFREE_SECRET_KEY) are not configured in Cloudflare environment secrets.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // ===========================================================================
  // 2. Query Cashfree Official Order Status API Server-Side
  // ===========================================================================
  const isSandbox = env.CASHFREE_ENVIRONMENT === 'sandbox';
  const apiBase = isSandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';
  const apiVersion = env.CASHFREE_API_VERSION || '2023-08-01';

  try {
    const cashfreeRes = await fetch(`${apiBase}/orders/${encodeURIComponent(cleanOrderId)}`, {
      method: 'GET',
      headers: {
        'x-api-version': apiVersion,
        'x-client-id': env.CASHFREE_APP_ID,
        'x-client-secret': env.CASHFREE_SECRET_KEY,
        'Accept': 'application/json',
      },
    });

    if (!cashfreeRes.ok) {
      const errorText = await cashfreeRes.text();
      console.error(`Cashfree API Get Order Error [${cashfreeRes.status}]:`, errorText);

      return new Response(
        JSON.stringify({
          success: false,
          orderId: cleanOrderId,
          message: 'Order not found or payment session invalid on Cashfree.',
        }),
        {
          status: cashfreeRes.status === 404 ? 404 : 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const orderData = (await cashfreeRes.json()) as CashfreeOrderResponse;

    // =========================================================================
    // 3. Strict Server-Side Validation:
    //    - order_status === "PAID"
    //    - order_amount === 23 (or previous test amounts 1 / 25)
    //    - order_currency === "INR"
    // =========================================================================
    const isStatusPaid = orderData.order_status === 'PAID';
    const isAmountValid = 
      Math.abs(Number(orderData.order_amount) - 23) < 0.01 || 
      Math.abs(Number(orderData.order_amount) - 1) < 0.01 || 
      Math.abs(Number(orderData.order_amount) - 25) < 0.01;
    const isCurrencyValid = orderData.order_currency?.toUpperCase() === 'INR';

    if (isStatusPaid && isAmountValid && isCurrencyValid) {
      // Issue HMAC-signed download authorization token (15 minutes validity)
      const downloadToken = await signDownloadToken(cleanOrderId, signingSecret, 15);

      return new Response(
        JSON.stringify({
          success: true,
          orderId: cleanOrderId,
          orderStatus: 'PAID',
          orderAmount: orderData.order_amount,
          orderCurrency: orderData.order_currency,
          downloadToken,
          expiresIn: 900,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Pending / In-progress payment status
    if (orderData.order_status === 'ACTIVE') {
      return new Response(
        JSON.stringify({
          success: false,
          orderId: cleanOrderId,
          orderStatus: 'ACTIVE',
          message: 'Payment is active or currently processing. Please complete payment or refresh if you already paid.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Amount/currency mismatch or failed status
    return new Response(
      JSON.stringify({
        success: false,
        orderId: cleanOrderId,
        orderStatus: orderData.order_status,
        message: !isAmountValid || !isCurrencyValid
          ? 'Payment verification failed: Order amount or currency mismatch.'
          : `Order status is ${orderData.order_status}.`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    console.error('Server payment verification error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        orderId: cleanOrderId,
        message: 'An unexpected error occurred while communicating with the payment processor.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
