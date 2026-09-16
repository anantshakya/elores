# Elores update — 13 Sep 2026

Implemented for local testing before live deployment:

## Admin
- Fixed sidebar and fixed topbar.
- Colored Edit/Delete/Invoice action buttons.
- Global toast notifications for common create/update/delete/upload actions.
- Product multi-image upload: minimum 1, maximum 5 images, maximum 2MB each.
- Product image gallery storage via `product_images` table.
- Order invoice screen with Print / Save PDF support.
- Order status, payment status and tracking number management.
- Coupon, carousel, category, product, review, page and settings actions improved with toast feedback.

## Storefront
- Footer redesigned and Track Order added.
- Carousel no longer uses the Elores logo as the fallback background; a jewellery-inspired animated fallback is used.
- “Add to Bag” changed to “Add to Cart”.
- Product detail supports multiple product images.
- Customer reviews support optional image upload (max 2MB).
- Checkout order insertion made safer so auxiliary notification/cart tables cannot silently block the order.
- 6-digit Indian pincode lookup auto-fills city/state using PostalPincode API when available.
- Coupon is validated/applied when Place Order is clicked.
- Public order tracking page added using order number + phone number.
- Customer account links orders to Track Order.
- Responsive improvements for storefront, footer, tracking, invoice and admin.

## Database
New migration:
`backend/app/Database/Migrations/2026-09-13-000004_OrderMediaInvoiceTracking.php`

Run:

```powershell
cd C:\xampp\htdocs\elores\backend
& "C:\xampp\php\php.exe" spark migrate --all
```

This creates/updates product images, review image support and invoice numbering.
