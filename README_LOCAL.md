# Elores - Local Windows Run Guide

## Requirements
- XAMPP with PHP 8.2+
- MySQL/MariaDB running
- Composer
- Node.js/npm

## 1. Put project here
`C:\xampp\htdocs\elores`

The folder containing `package.json` is the React frontend root. `backend` is CodeIgniter 4.

## 2. Create database
Open `http://localhost/phpmyadmin`, create database `elores_db` with utf8mb4 collation.

## 3. Backend configuration
`backend/.env` is already configured for local XAMPP:
- URL: `http://localhost:8080/`
- DB: `elores_db`
- User: `root`
- Password: blank

## 4. First setup
Double-click `setup-local-windows.bat` or run in PowerShell:

```powershell
cd C:\xampp\htdocs\elores
& "C:\xampp\php\php.exe" backend\spark migrate --all
& "C:\xampp\php\php.exe" backend\spark db:seed EloresSeeder
npm.cmd install
```

If the seeder reports duplicate data after it has already been run, do not run it again.

## 5. Run backend
PowerShell window 1:
```powershell
cd C:\xampp\htdocs\elores\backend
& "C:\xampp\php\php.exe" spark serve
```
API: `http://localhost:8080/api/products`

## 6. Run frontend
PowerShell window 2:
```powershell
cd C:\xampp\htdocs\elores
npm.cmd run dev
```
Website: `http://localhost:5173`
Admin: `http://localhost:5173/admin`

Admin demo login:
- Email: `admin@elores.local`
- Password: `Admin@123`

Forgot-password demo OTP: `123456`.

## 7. Verify before live
Test homepage, mobile menu, search/filters, product details, wishlist, cart, coupon, checkout, registration/login/forgot-password, account addresses/order history, contact form, all policy pages and every admin menu.

## Live later
Copy `.env.production.example` to `.env.production`, build with `npm.cmd run build`, and upload only `dist` contents plus the backend. Use `backend/.env.live.example` as the live backend template.

## 2026-09-13 feature update
After extracting this version, run migrations again before starting the backend:

```powershell
cd C:\xampp\htdocs\elores\backend
& "C:\xampp\php\php.exe" spark migrate --all
```

Then start backend:

```powershell
& "C:\xampp\php\php.exe" spark serve
```

In a second PowerShell window:

```powershell
cd C:\xampp\htdocs\elores
npm.cmd install
npm.cmd run dev
```

Storefront: http://localhost:5173
Admin: http://localhost:5173/admin
Track order: http://localhost:5173/track-order

Product image rule: 1–5 images, each <= 2MB.
Customer review image: optional, <= 2MB.
