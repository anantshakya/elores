'use client';
import { Suspense } from 'react';
import CouponEditPage from '../[id]/edit/page.jsx';

export default function CouponEditWrapper(props) {
  return (
    <Suspense fallback={<div className="adminPanel" style={{ padding: "40px", textAlign: "center" }}>Loading coupon editor…</div>}>
      <CouponEditPage {...props} />
    </Suspense>
  );
}
