import { Env, CashfreeCreateOrderResponse } from '../types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Determine site base URL dynamically from current request origin
  // so that return_url always matches the approved whitelisted domain
  const requestUrl = new URL(request.url);
  const siteUrl = requestUrl.origin;

  // Generate unique order ID and customer ID
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const timestamp = Date.now();
  const orderId = `order_${timestamp}_${randomSuffix}`;
  const customerId = `cust_${timestamp}_${randomSuffix}`;

  // Optional: Read customer info if passed from frontend, otherwise default to guest
  let customerPhone = '9999999999';
  let customerEmail = 'buyer@digitalcontents.com';
  let customerName = 'Guest Customer';

  try {
    const body = await request.json() as Record<string, string>;
    if (body?.customerPhone) customerPhone = body.customerPhone;
    if (body?.customerEmail) customerEmail = body.customerEmail;
    if (body?.customerName) customerName = body.customerName;
  } catch {
    // Body is optional
  }

  // ===========================================================================
  // 1. Verify Cashfree Server Credentials
  // ===========================================================================
  if (!env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Cashfree credentials (CASHFREE_APP_ID & CASHFREE_SECRET_KEY) are not configured in Cloudflare environment secrets.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // ===========================================================================
  // 2. Call Cashfree Create Order API Server-Side
  // ===========================================================================
  const isSandbox = env.CASHFREE_ENVIRONMENT === 'sandbox';
  const apiBase = isSandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';
  const apiVersion = env.CASHFREE_API_VERSION || '2023-08-01';

  const orderPayload = {
    order_id: orderId,
    order_amount: 23.00,
    order_currency: 'INR',
    customer_details: {
      customer_id: customerId,
      customer_phone: customerPhone,
      customer_name: customerName,
      customer_email: customerEmail,
    },
    order_meta: {
      return_url: `${siteUrl}/payment-success?order_id={order_id}`,
      notify_url: `${siteUrl}/api/webhook`,
    },
    order_note: 'Purchase: Artificial Intelligence - An brief overview for beginners',
  };

  try {
    const cashfreeRes = await fetch(`${apiBase}/orders`, {
      method: 'POST',
      headers: {
        'x-api-version': apiVersion,
        'x-client-id': env.CASHFREE_APP_ID,
        'x-client-secret': env.CASHFREE_SECRET_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const responseData = (await cashfreeRes.json()) as CashfreeCreateOrderResponse;

    if (!cashfreeRes.ok || !responseData.payment_session_id) {
      console.error('Cashfree Create Order Error:', responseData);
      return new Response(
        JSON.stringify({
          success: false,
          message: responseData.message || 'Failed to create payment session with Cashfree.',
          code: responseData.code,
        }),
        {
          status: cashfreeRes.status || 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: responseData.order_id,
        payment_session_id: responseData.payment_session_id,
        environment: isSandbox ? 'sandbox' : 'production',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error creating Cashfree order:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Network or internal error communicating with Cashfree server.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
