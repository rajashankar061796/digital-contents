# Private Assets Directory (Protected PDF Storage)

This directory stores your protected digital product PDF:

- File: `artificial-intelligence-beginners.pdf`
- Path: `public/private-assets/artificial-intelligence-beginners.pdf`

### Security Protection
Direct access to `/private-assets/*` via browser URLs is strictly blocked with `403 Forbidden` by the Cloudflare Worker.
The PDF can ONLY be downloaded through the `/api/download?token=...` endpoint after a verified Cashfree purchase.
