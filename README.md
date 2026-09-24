# Digital Contents - Single Digital Product Website

A fast, modern, and secure single digital-product website built to sell the PDF guide:
**"Artificial Intelligence - An brief overview for beginners"**

Powered by **React + TypeScript + Vite + SCSS**, deployed on **Cloudflare** with **Cloudflare Workers** for server-side Cashfree Hosted Checkout order creation, payment verification, and token-authorized protected PDF delivery with **zero billing/credit card requirements**.

---

## 📋 Table of Contents
1. [The 2 Files You Can Customize](#1-the-2-files-you-can-customize)
2. [Architecture Overview (Database-Free & Card-Free)](#2-architecture-overview)
3. [Project Structure](#3-project-structure)
4. [Local Development](#4-local-development)
5. [Cashfree Setup (Hosted Checkout)](#5-cashfree-setup)
6. [Protected PDF Asset Location](#6-protected-pdf-asset-location)
7. [Cloudflare Deployment Step-by-Step](#7-cloudflare-deployment-step-by-step)
8. [End-to-End Testing Flow](#8-end-to-end-testing-flow)

---

## 1. The 2 Files You Can Customize

The codebase is fully implemented with automated Hosted Checkout order creation.

### 1. Product Cover Image
* **File location:** [`src/assets/product/cover.jpg`](file:///c:/Users/RajaShankar/digital-contents/src/assets/product/cover.jpg)
* *The provided AI & LLM Learning Roadmap cover is already placed and bundled.*

### 2. Digital PDF File
* **File location:** [`public/private-assets/artificial-intelligence-beginners.pdf`](file:///c:/Users/RajaShankar/digital-contents/public/private-assets/artificial-intelligence-beginners.pdf)
* *A starter PDF is already placed. You can replace this file with your final PDF at any time without changing any code.*

---

## 2. Architecture Overview

```
1. Customer visits Landing Page
      │
      ▼ (Customer clicks "Buy & Download – ₹25")
2. React calls POST /api/create-order
      │
      ▼ (Cloudflare Worker calls Cashfree API server-side)
3. Cashfree Create Order API
      │  - Amount: 25 INR
      │  - Generates unique order_id
      │  - Sets return_url to ${SITE_URL}/payment-success?order_id={order_id}
      │  - Returns payment_session_id
      ▼
4. Cashfree JS SDK launches Hosted Checkout
      │  - Customer enters their payment and contact details on Cashfree
      │  - Customer completes ₹25 payment
      ▼
5. Cashfree redirects to: /payment-success?order_id=...
      │
      ▼ (React calls POST /api/verify-payment with order_id)
6. Cloudflare Worker (Backend Verification)
      │  - Calls Cashfree Get Order API (GET /pg/orders/{order_id})
      │  - Verifies: status === "PAID", amount === 25, currency === "INR"
      │  - Issues signed HMAC-SHA256 download token (15-min validity)
      ▼
7. Secure PDF Download (GET /api/download?token=...)
      │  - Worker verifies HMAC signature & expiration
      │  - Serves PDF attachment securely
      │  - NOTE: Direct URL access to /private-assets/* is blocked with 403 Forbidden
      ▼
8. Automatic Download Initiated + Manual Fallback Button
```

---

## 3. Project Structure

```
digital-contents/
├── functions/                    # Serverless APIs
│   ├── api/
│   │   ├── create-order.ts      # Server-side Cashfree Order Creation (returns payment_session_id)
│   │   ├── verify-payment.ts    # Server-side Cashfree payment status verification & token generation
│   │   ├── download.ts          # Token-authorized PDF streaming endpoint
│   │   └── webhook.ts           # Cashfree webhook signature verification & receiver
│   ├── types.ts                 # TypeScript types
│   └── utils/
│       └── crypto.ts            # Web Crypto HMAC-SHA256 signing and verification
│
├── public/
│   ├── favicon.svg              # Favicon
│   └── private-assets/          # Protected PDF Storage (Direct URL access blocked with 403)
│       └── artificial-intelligence-beginners.pdf
│
├── src/                         # React Frontend
│   ├── assets/
│   │   └── product/             # cover.jpg
│   ├── components/
│   │   ├── Header.tsx           # Minimal "Digital Contents" header
│   │   └── ProductCover.tsx     # 3D Book presentation
│   ├── config/
│   │   └── payment.ts           # Product details & 6 roadmap topics
│   ├── pages/
│   │   ├── HomePage.tsx         # Product hero, 6 topics, ₹25 price, Hosted Checkout CTA
│   │   ├── PaymentSuccessPage.tsx # Automated verification, auto-download & manual fallback
│   │   └── NotFoundPage.tsx     # 404 handler
│   ├── styles/
│   │   ├── _variables.scss      # Design tokens
│   │   ├── _base.scss           # Base layout, typography
│   │   ├── _product.scss        # Hero grid, book shadow, 6 topics, buy button
│   │   ├── _success.scss        # Verification states, spinner, download buttons
│   │   └── main.scss            # Main SCSS entry point
│   ├── App.tsx                  # React Router routes
│   ├── main.tsx                 # React DOM mount
│   └── worker.ts                # Cloudflare Worker entry point with static asset routing & security
│
├── wrangler.toml                # Cloudflare Worker & Static Assets configuration (No R2 required)
├── vite.config.ts               # Vite configuration with modern Sass compiler
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Project dependencies & scripts
```

---

## 4. Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build and typecheck
npm run build
```

---

## 5. Cashfree Setup

1. Log in to your [Cashfree Dashboard](https://merchant.cashfree.com/).
2. Go to **Developers** > **API Keys**.
3. Copy your **App ID** (`CASHFREE_APP_ID`) and **Secret Key** (`CASHFREE_SECRET_KEY`).
4. *(These will be added as Cloudflare Secrets in Section 7 — NEVER put them in frontend code).*

---

## 6. Protected PDF Asset Location

The PDF is stored in:
```
public/private-assets/artificial-intelligence-beginners.pdf
```
When built with Vite, this file is placed in `dist/private-assets/`.
* **Security:** The Cloudflare Worker explicitly intercepts and blocks any direct browser requests to `/private-assets/*` with `403 Forbidden`.
* **Access:** The file is only served through `/api/download?token=...` after Cashfree verifies payment status as `PAID`.

---

## 7. Cloudflare Deployment Step-by-Step

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Deploy digital contents website"
git push -u origin main
```

### Step 2: Cloudflare Build Configuration
In your Cloudflare Dashboard project settings:
* **Build command:** `npm run build`
* **Deploy command:** `npx wrangler deploy`

### Step 3: Add Secrets in Cloudflare
Go to **Settings** > **Variables and Secrets** (or **Environment variables**) and add:

| Variable Name | Type | Value / Description |
| :--- | :--- | :--- |
| `CASHFREE_APP_ID` | Secret | Your Cashfree Merchant App ID |
| `CASHFREE_SECRET_KEY` | Secret | Your Cashfree Secret Key |
| `CASHFREE_ENVIRONMENT` | Variable | `production` (or `sandbox` if testing) |
| `CASHFREE_API_VERSION` | Variable | `2023-08-01` |
| `SITE_URL` | Variable | `https://<your-domain>.pages.dev` (or custom domain) |
| `PDF_OBJECT_KEY` | Variable | `artificial-intelligence-beginners.pdf` |
| `CASHFREE_WEBHOOK_SECRET` | Secret | *(Optional)* Dedicated webhook secret if configured. |
| `DOWNLOAD_SIGNING_SECRET` | Secret | *(Optional)* Random 32-character string for token signing. |

Trigger a new deployment or push a commit, and Cloudflare will deploy immediately without requiring any credit card or billing activation.
