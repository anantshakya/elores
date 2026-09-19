'use client';

import { Suspense } from 'react';
import OrderForm from '../_components/OrderForm.jsx';

function OrderEditContent() {
  return <OrderForm />;
}

export default function OrderEditLandingPage() {
  return (
    <Suspense fallback={<div className="adminPanel" style={{ padding: "40px", textAlign: "center" }}>Loading order editor…</div>}>
      <OrderEditContent />
    </Suspense>
  );
}
