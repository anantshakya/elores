# Elores Next.js + CodeIgniter 4

The storefront has been migrated from Vite/React routing to Next.js App Router. The existing CodeIgniter 4 backend remains in `backend/` and continues to provide the ecommerce/admin APIs.

## Local run
1. Start XAMPP MySQL.
2. Backend: `cd backend` then `C:\xampp\php\php.exe spark serve`.
3. Copy `.env.example` to `.env.local` at the project root.
4. Frontend: `npm install` then `npm run dev`.
5. Storefront: http://localhost:3000 ; Admin: http://localhost:3000/admin

## Production environment
Set:
- `NEXT_PUBLIC_API_URL=https://elores.in/backend/public/api`
- `API_URL=https://elores.in/backend/public/api`
- `NEXT_PUBLIC_SITE_URL=https://elores.in`

Run `npm run build` and `npm start` on a Node.js-capable host. Full SSR/SEO requires a running Node.js Next server; do not deploy this as the old Vite `dist/` static site.

## SEO included
- Server metadata for products and content pages
- Canonical URLs, Open Graph and Twitter cards
- Product JSON-LD with price/availability/rating
- Dynamic sitemap and robots
- Server-rendered product/category content
- noindex for admin/account/cart/checkout/auth/order-success pages
