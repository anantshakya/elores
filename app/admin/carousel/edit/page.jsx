'use client';
import { Suspense } from 'react';
import CarouselEditPage from '../[id]/edit/page.jsx';

export default function CarouselEditWrapper(props) {
  return (
    <Suspense fallback={<div className="adminPanel" style={{ padding: "40px", textAlign: "center" }}>Loading banner editor…</div>}>
      <CarouselEditPage {...props} />
    </Suspense>
  );
}
