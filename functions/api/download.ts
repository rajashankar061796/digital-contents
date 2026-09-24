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
  // 2. Retrieve PDF from Protected Static Assets or R2 Binding
  // ===========================================================================
  const objectKey = env.PDF_OBJECT_KEY || 'artificial-intelligence-beginners.pdf';

  try {
    // If R2 Bucket binding is configured, use it
    if (env.PDF_BUCKET) {
      const pdfObject = await env.PDF_BUCKET.get(objectKey);
      if (pdfObject) {
        const headers = new Headers();
        pdfObject.writeHttpMetadata(headers);
        headers.set('Content-Type', 'application/pdf');
        headers.set(
          'Content-Disposition',
          'attachment; filename="Artificial-Intelligence-An-brief-overview-for-beginners.pdf"'
        );
        headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
        if (pdfObject.size) headers.set('Content-Length', pdfObject.size.toString());

        return new Response(pdfObject.body, { status: 200, headers });
      }
    }

    // Otherwise, retrieve from protected static assets
    if (env.ASSETS) {
      const assetUrl = new URL(`/private-assets/${objectKey}`, request.url);
      const assetResponse = await env.ASSETS.fetch(new Request(assetUrl.toString()));

      if (assetResponse.ok) {
        const headers = new Headers(assetResponse.headers);
        headers.set('Content-Type', 'application/pdf');
        headers.set(
          'Content-Disposition',
          'attachment; filename="Artificial-Intelligence-An-brief-overview-for-beginners.pdf"'
        );
        headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
        headers.set('Pragma', 'no-cache');
        headers.set('Expires', '0');

        return new Response(assetResponse.body, {
          status: 200,
          headers,
        });
      }
    }

    return new Response(
      JSON.stringify({
        error: 'File Not Found',
        message: `The PDF file ("${objectKey}") could not be located in assets.`,
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Download retrieval error:', error);
    return new Response(
      JSON.stringify({
        error: 'Storage Error',
        message: 'Failed to retrieve the PDF. Please try again or contact support.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
