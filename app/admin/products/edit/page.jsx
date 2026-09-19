'use client';

import { Suspense } from 'react';
import ProductForm from '../_components/ProductForm.jsx';

function ProductEditContent() {
  return <ProductForm />;
}

export default function ProductEditPage() {
  return (
    <Suspense fallback={<div className="adminPanel" style={{ padding: "40px", textAlign: "center" }}>Loading product editor…</div>}>
      <ProductEditContent />
    </Suspense>
  );
}
