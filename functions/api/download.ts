import { Env } from '../types';
import { verifyDownloadToken } from '../utils/crypto';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  // ===========================================================================
  // 1. Validate Download Authorization Token
  // ===========================================================================
  if (!token || typeof token !== 'string') {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Missing download authorization token. Please access via the verified purchase success page.',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const signingSecret = env.DOWNLOAD_SIGNING_SECRET || env.CASHFREE_SECRET_KEY || 'dev-fallback-secret-key-32chars!';
  const payload = await verifyDownloadToken(token, signingSecret);

  if (!payload) {
    return new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: 'The download link is invalid or has expired. Please revisit your payment confirmation page to generate a fresh download session.',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // ===========================================================================
  // 2. Fetch PDF from Private Cloudflare R2 Bucket Binding
  // ===========================================================================
  const objectKey = env.PDF_OBJECT_KEY || 'artificial-intelligence-beginners.pdf';

  if (!env.PDF_BUCKET) {
    return new Response(
      JSON.stringify({
        error: 'Configuration Error',
        message: 'R2 bucket binding (PDF_BUCKET) is not configured in Cloudflare Pages.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const pdfObject = await env.PDF_BUCKET.get(objectKey);

    if (!pdfObject) {
      return new Response(
        JSON.stringify({
          error: 'File Not Found',
          message: `The PDF file ("${objectKey}") has not been uploaded to the Cloudflare R2 bucket yet. Please upload your PDF to the R2 bucket with object name: "${objectKey}".`,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare response headers for clean, secure PDF attachment delivery
    const headers = new Headers();
    pdfObject.writeHttpMetadata(headers);
    headers.set('Content-Type', 'application/pdf');
    headers.set(
      'Content-Disposition',
      'attachment; filename="Artificial-Intelligence-An-brief-overview-for-beginners.pdf"'
    );
    headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    if (pdfObject.size) {
      headers.set('Content-Length', pdfObject.size.toString());
    }

    return new Response(pdfObject.body, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    console.error('R2 retrieval error:', error);
    return new Response(
      JSON.stringify({
        error: 'Storage Error',
        message: 'Failed to retrieve the PDF from private storage. Please try again or contact support.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
