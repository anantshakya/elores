'use client';
import { Suspense } from 'react';
import CategoryEditPage from '../[id]/edit/page.jsx';

export default function CategoryEditWrapper(props) {
  return (
    <Suspense fallback={<div className="adminPanel" style={{ padding: "40px", textAlign: "center" }}>Loading category editor…</div>}>
      <CategoryEditPage {...props} />
    </Suspense>
  );
}
