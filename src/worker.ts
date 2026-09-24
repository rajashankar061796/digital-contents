import { onRequestPost as handleCreateOrder } from '../functions/api/create-order';
import { 
  onRequestPost as handleVerifyPayment, 
  onRequestGet as handleVerifyPaymentGet 
} from '../functions/api/verify-payment';
import { onRequestGet as handleDownload } from '../functions/api/download';
import { onRequestPost as handleWebhook } from '../functions/api/webhook';
import { Env as BaseEnv } from '../functions/types';

export interface WorkerEnv extends BaseEnv {
  ASSETS?: Fetcher;
}

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const eventContext = {
      request,
      env,
      params: {},
      waitUntil: (promise: Promise<any>) => ctx.waitUntil(promise),
      next: () => (env.ASSETS ? env.ASSETS.fetch(request) : fetch(request)),
      data: {},
      functionPath: path,
    };

    // Route API endpoints
    if (path === '/api/create-order' && request.method === 'POST') {
      return handleCreateOrder(eventContext as any);
    }
    if (path === '/api/verify-payment') {
      if (request.method === 'POST') return handleVerifyPayment(eventContext as any);
      if (request.method === 'GET') return handleVerifyPaymentGet(eventContext as any);
    }
    if (path === '/api/download' && request.method === 'GET') {
      return handleDownload(eventContext as any);
    }
    if (path === '/api/webhook' && request.method === 'POST') {
      return handleWebhook(eventContext as any);
    }

    // -------------------------------------------------------------------------
    // SECURITY: Block direct public access to private assets
    // (Only authorized requests passing through /api/download can access the PDF)
    // -------------------------------------------------------------------------
    if (path.startsWith('/private-assets/')) {
      return new Response(
        JSON.stringify({
          error: 'Forbidden',
          message: 'Direct access to protected digital contents is prohibited. Please purchase via checkout.',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Serve frontend static assets (Vite React app in dist)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
