'use client';
import { Suspense } from 'react';
import UserEditPage from '../[id]/edit/page.jsx';

export default function UserEditWrapper(props) {
  return (
    <Suspense fallback={<div className="adminPanel" style={{ padding: "40px", textAlign: "center" }}>Loading user editor…</div>}>
      <UserEditPage {...props} />
    </Suspense>
  );
}
