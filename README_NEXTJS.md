# Elores Next.js + CodeIgniter 4

Frontend is Next.js App Router only. There is no `src/` frontend tree and no React Router/Vite runtime.

## Local
1. Start XAMPP MySQL.
2. `cd backend` then `C:\xampp\php\php.exe spark serve`
3. Copy `.env.example` to `.env.local` in project root.
4. `npm install`
5. `npm run dev`
6. Store: http://localhost:3000 — Admin: http://localhost:3000/admin — API: http://localhost:8080/api/products

## Environment
`NEXT_PUBLIC_API_URL=http://localhost:8080/api`
`API_URL=http://localhost:8080/api`
`NEXT_PUBLIC_SITE_URL=http://localhost:3000`

Production frontend requires a Node.js runtime for SSR. CI4 remains the API backend.
