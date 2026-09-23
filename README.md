# Digital Contents - Single Digital Product Website

A fast, modern, and secure single digital-product website built to sell the PDF guide:
**"Artificial Intelligence - An brief overview for beginners"**

Powered by **React + TypeScript + Vite + SCSS**, deployed on **Cloudflare Pages** with **Cloudflare Pages Functions** for server-side Cashfree Hosted Checkout order creation, payment verification, and **Cloudflare R2** for private, token-authorized PDF delivery.

---

## 📋 Table of Contents
1. [The 2 Things You Need to Provide Manually](#1-the-2-things-you-need-to-provide-manually)
2. [Architecture Overview (Database-Free Hosted Checkout)](#2-architecture-overview)
3. [Project Structure](#3-project-structure)
4. [Local Development](#4-local-development)
5. [Cashfree Setup (Hosted Checkout)](#5-cashfree-setup)
6. [Cloudflare R2 Bucket Setup (Private PDF Storage)](#6-cloudflare-r2-bucket-setup)
7. [Cloudflare Pages Deployment Step-by-Step](#7-cloudflare-pages-deployment-step-by-step)
8. [End-to-End Testing Flow](#8-end-to-end-testing-flow)

---

## 1. The 2 Things You Need to Provide Manually

The codebase is fully implemented with automated Hosted Checkout order creation. You only need to provide:

### 1. Product Cover Image
* **File location:** Place your image in [`src/assets/product/`](file:///c:/Users/RajaShankar/digital-contents/src/assets/product/)
* **Filename:** `cover.png` or `cover.jpg` (or `.webp`)
* *Note:* If no image is placed, a high-quality stylized SVG book cover placeholder will automatically be used.

### 2. PDF in Cloudflare R2
* **Bucket name:** `digital-contents-pdf` (private)
* **Object Key / Filename in R2:** `artificial-intelligence-beginners.pdf`
* *Note:* Upload your PDF to the R2 bucket using this exact object name.

---

## 2. Architecture Overview

```
1. Customer visits Landing Page
      │
      ▼ (Customer clicks "Buy & Download – ₹25")
2. React calls POST /api/create-order
      │
      ▼ (Cloudflare Pages Function calls Cashfree API)
3. Cashfree Create Order API (Server-Side)
      │  - Amount: 25 INR
      │  - Generates unique order_id
      │  - Sets return_url to ${SITE_URL}/payment-success?order_id={order_id}
      │  - Returns payment_session_id
      ▼
4. Cashfree JS SDK launches Hosted Checkout
      │  - Customer enters their payment/contact details on Cashfree
      │  - Customer completes ₹25 payment
      ▼
5. Cashfree redirects to: /payment-success?order_id=...
      │
      ▼ (React calls POST /api/verify-payment with order_id)
6. Cloudflare Pages Function (Backend)
      │  - Calls Cashfree Get Order API (GET /pg/orders/{order_id})
      │  - Verifies: status === "PAID", amount === 25, currency === "INR"
      │  - Issues signed HMAC-SHA256 download token (15-min validity)
      ▼
7. Secure PDF Download (GET /api/download?token=...)
      │  - Cloudflare Function validates HMAC token
      │  - Streams private PDF directly from R2 binding (PDF_BUCKET)
      ▼
8. Automatic Download Initiated + Manual Fallback Button
```

### Why No Database is Needed:
1. **Source of Truth:** Cashfree's official Order API (`/pg/orders/{order_id}`) acts as the verifiable source of truth for payment status.
2. **Cryptographic Tokens:** When the server verifies the payment status is `PAID`, it generates a short-lived (15 minutes), HMAC-SHA256 signed token.
3. **Zero Tampering:** The user cannot fake the token because it requires the server's private secret key to sign.
4. **Private Storage:** The R2 bucket is never exposed publicly; only the Cloudflare Pages Function with valid token authorization can access it.

---

## 3. Project Structure

```
digital-contents/
├── functions/                    # Cloudflare Pages Functions (Serverless Backend)
│   ├── api/
│   │   ├── create-order.ts      # Server-side Cashfree Order Creation (returns payment_session_id)
│   │   ├── verify-payment.ts    # Server-side Cashfree payment status verification & token generation
│   │   ├── download.ts          # Token-authorized private R2 PDF streaming endpoint
│   │   └── webhook.ts           # Cashfree webhook signature verification & receiver
│   ├── types.ts                 # TypeScript types for Cloudflare bindings & Cashfree API
│   └── utils/
│       └── crypto.ts            # Web Crypto HMAC-SHA256 signing and verification
│
├── src/                         # React Frontend
│   ├── assets/
│   │   └── product/             # Place cover.png or cover.jpg here
│   │       ├── default-cover.svg
│   │       └── README.md
│   ├── components/
│   │   ├── Header.tsx           # Minimal "Digital Contents" header
│   │   └── ProductCover.tsx     # 3D Book presentation with automatic cover discovery
│   ├── config/
│   │   └── payment.ts           # Product details configuration
│   ├── pages/
│   │   ├── HomePage.tsx         # Product hero, curriculum, ₹25 pricing, Hosted Checkout CTA
│   │   ├── PaymentSuccessPage.tsx # Automated verification, auto-download & manual fallback
│   │   └── NotFoundPage.tsx     # 404 handler
│   ├── styles/
│   │   ├── _variables.scss      # Design tokens, modern color palette
│   │   ├── _base.scss           # Base layout, typography
│   │   ├── _product.scss        # Hero grid, book shadow, curriculum, buy button, loader
│   │   ├── _success.scss        # Verification states, spinner, download buttons
│   │   └── main.scss            # Main SCSS entry point
│   ├── App.tsx                  # React Router routes
│   └── main.tsx                 # React DOM mount
│
├── public/
│   └── favicon.svg              # Site favicon
├── wrangler.toml                # Cloudflare Pages / Workers & R2 binding configuration
├── vite.config.ts               # Vite configuration with modern Sass compiler
├── tsconfig.json                # TypeScript configuration
├── .env.example                 # Environment variables reference
└── package.json                 # Project dependencies & scripts
```

---

## 4. Local Development

### Prerequisites
* Node.js v18+ or v20+
* NPM

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Vite Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Typecheck
```bash
npm run build
```

---

## 5. Cashfree Setup

### Step 1: Get Your Cashfree API Keys
1. Log in to your [Cashfree Dashboard](https://merchant.cashfree.com/).
2. Navigate to **Developers** > **API Keys**.
3. Copy your **App ID** (`CASHFREE_APP_ID`) and **Secret Key** (`CASHFREE_SECRET_KEY`).
4. *(These will be added to Cloudflare Secrets in Section 7 — NEVER put them in frontend code).*

### Step 2: (Optional) Set Webhook URL in Cashfree
1. In Cashfree Dashboard, go to **Developers** > **Webhooks**.
2. Add Webhook Endpoint:
   ```
   https://<your-cloudflare-pages-domain>/api/webhook
   ```
3. Enable events for **Payment Success**.

---

## 6. Cloudflare R2 Bucket Setup (Private PDF Storage)

### Step 1: Create the R2 Bucket
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left sidebar, click **R2** > **Overview**.
3. Click **Create bucket**.
4. Name the bucket:
   ```
   digital-contents-pdf
   ```
5. Click **Create Bucket**.
6. **IMPORTANT:** Keep the bucket **PRIVATE**. Do NOT enable Public Access or connect custom domains to the R2 bucket. Access is handled securely through the Worker binding.

### Step 2: Upload Your PDF
1. Open your `digital-contents-pdf` bucket in the Cloudflare Dashboard.
2. Click **Upload** > **Upload files**.
3. Select your PDF file and set the Object Key / Name to:
   ```
   artificial-intelligence-beginners.pdf
   ```
4. Click **Upload**.

---

## 7. Cloudflare Pages Deployment Step-by-Step

### Step 1: Push Code to GitHub
Push this repository to your GitHub account:
```bash
git add .
git commit -m "Cashfree Hosted Checkout implementation"
git branch -M main
git push -u origin main
```

### Step 2: Create a Cloudflare Pages Project
1. In the Cloudflare Dashboard, go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your `digital-contents` repository.
3. Configure the build settings:
   * **Framework preset:** `Vite`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
   * **Deploy command:** *(Leave empty / default for Pages. If your CI or dashboard requires one, use `npx wrangler pages deploy dist` — DO NOT use `npx wrangler deploy`).*
4. Click **Save and Deploy**.

### Step 3: Bind the Private R2 Bucket to Cloudflare Pages
1. In Cloudflare Dashboard, select your `digital-contents` Pages project.
2. Navigate to **Settings** > **Functions**.
3. Scroll to **R2 bucket bindings** and click **Add binding**:
   * **Variable name:** `PDF_BUCKET`
   * **R2 bucket:** `digital-contents-pdf`
4. Click **Save**.

### Step 4: Add Environment Variables and Secrets in Cloudflare
1. Go to **Settings** > **Environment variables**.
2. Add the following variables:

| Variable Name | Type | Value / Description |
| :--- | :--- | :--- |
| `CASHFREE_APP_ID` | Secret | Your Cashfree Merchant App ID |
| `CASHFREE_SECRET_KEY` | Secret | Your Cashfree Secret Key |
| `CASHFREE_ENVIRONMENT` | Variable | `production` (or `sandbox` if testing) |
| `CASHFREE_API_VERSION` | Variable | `2023-08-01` |
| `SITE_URL` | Variable | `https://<your-pages-subdomain>.pages.dev` (your public URL) |
| `PDF_OBJECT_KEY` | Variable | `artificial-intelligence-beginners.pdf` |
| `CASHFREE_WEBHOOK_SECRET` | Secret | *(Optional)* Dedicated webhook secret if configured. |
| `DOWNLOAD_SIGNING_SECRET` | Secret | *(Optional)* A random 32-character string for HMAC signing. |

3. Click **Save**.
4. Trigger a new deployment (or go to **Deployments** > **Retry deployment**) to apply the bindings and variables.

---

## 8. End-to-End Testing Flow

Once deployed:

1. **Visit Landing Page:** Navigate to `https://<your-pages-subdomain>.pages.dev`.
2. **Click "Buy & Download – ₹25":** React calls `/api/create-order` server-side, receives the `payment_session_id`, and opens the Cashfree Hosted Checkout.
3. **Customer Checkout:** The customer enters their payment and contact details directly on Cashfree.
4. **Auto-Redirect:** Cashfree returns the user to `/payment-success?order_id=...`.
5. **Server Verification:** Cloudflare Pages Function calls Cashfree API to strictly verify:
   - `order_status === "PAID"`
   - `order_amount === 25`
   - `order_currency === "INR"`
6. **Instant Download:** A signed 15-minute token is generated and the PDF download initiates automatically, with a fallback **[ Download PDF ]** button.
7. **Security Check:** If someone tries to open `/payment-success` without a valid order ID or with an unpaid order, access is denied and no PDF is streamed.

---

## 🛡️ Security Summary

* **No Leaked Secrets:** Secret keys (`CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`) exist strictly within Cloudflare serverless environment variables.
* **No Direct File Access:** The PDF is not located in `public/` and the R2 bucket is private.
* **No Unverified Downloads:** PDF downloads are protected by server-side Cashfree API verification and HMAC-SHA256 signed tokens.
* **Database-Free Simplicity:** Complete serverless flow with zero ongoing database maintenance or hosting costs.
