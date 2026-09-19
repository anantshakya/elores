'use client';
import { Suspense } from 'react';
import PageEditComponent from '../[id]/edit/page.jsx';

export default function PageEditWrapper(props) {
  return (
    <Suspense fallback={<div className="adminPanel" style={{ padding: "40px", textAlign: "center" }}>Loading page editor…</div>}>
      <PageEditComponent {...props} />
    </Suspense>
  );
}
