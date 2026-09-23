import { Env } from '../types';
import { verifyCashfreeWebhookSignature } from '../utils/crypto';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Retrieve Cashfree signature headers
  const signature = request.headers.get('x-webhook-signature');
  const timestamp = request.headers.get('x-webhook-timestamp');

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to read request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ===========================================================================
  // 1. Signature Verification
  // ===========================================================================
  const secretKey = env.CASHFREE_WEBHOOK_SECRET || env.CASHFREE_SECRET_KEY;

  if (secretKey && signature && timestamp) {
    const isValid = await verifyCashfreeWebhookSignature(
      rawBody,
      timestamp,
      signature,
      secretKey
    );

    if (!isValid) {
      console.warn('Cashfree webhook signature verification failed.');
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // ===========================================================================
  // 2. Parse Event & Acknowledge
  // ===========================================================================
  try {
    const event = JSON.parse(rawBody);
    const eventType = event.type || event.event;
    const orderId = event.data?.order?.order_id || event.data?.order_id;

    console.log(`[Cashfree Webhook Received] Type: ${eventType}, Order ID: ${orderId}`);

    // Return 200 OK to Cashfree to confirm successful receipt
    return new Response(
      JSON.stringify({
        status: 'OK',
        received: true,
        type: eventType,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    // If not JSON, still return 200 to prevent unnecessary Cashfree retries if signature was valid
    return new Response(
      JSON.stringify({ status: 'OK' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
