# LUXE Client - Premium E-Commerce Storefront

This is the Next.js frontend application for **LUXE**, built with modern design aesthetics, dynamic transitions, and optimized server interfaces.

## Technology Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS & custom Vanilla CSS layout rules
- **Notifications**: Sonner toasts
- **Icons**: SVG custom paths
- **Network Requests**: Standard Fetch API communicating with the backend REST endpoints

---

## Key Features

### 1. Storefront & Collections Page
- **Dynamic Category Filtering**: Dynamically fetches and crawls published database products, generating matching checkbox filters on-the-fly.
- **Interactive Shimmer Skeletons**: Renders custom shimmer placeholders during async database fetches to prevent layout shifts.
- **Recently Viewed Products**: Tracks visited product details inside a localStorage stack, displaying history items at the bottom of the collections page with direct product detail link bindings.
- **Lazy Initialization State**: Resolves React cascading render warnings by loading localized data synchronously inside `useState(() => { ... })` rendering cycles instead of effects.

### 2. Admin Dashboard Console
- **Transactions Audit Logs**: Computes gross volume indicators, success rates based on historical data, and pending payouts processing logs. Supports full text-based customer search and status/method filters.
- **Orders Manager**: Features full offset pagination, order state toggling, fulfillment tracking, and status Pills.
- **Product Uploads Gallery**: Supports multiple product image uploads, Cloudinary media sync, and preview image grid galleries.

---

## Development and Building

### Bootstrapping Dev Server
Ensure your environment variables are configured inside `.env.local` pointing to the backend API:
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api/v1"
```

To boot up the Next.js dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront application.

### Build and Type Safety Checks
To verify typescript types and compile the production bundle:
```bash
npx tsc --noEmit
npm run build
```

To run lint checks:
```bash
npm run lint
```
