'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminLayout from './_components/AdminLayout.jsx';
import { AdminAuthProvider, useAdminAuth } from './_components/AdminAuth.jsx';
import { AdminToastProvider } from './_components/AdminToast.jsx';

function Gate({ children }) {
  const { user, loading } = useAdminAuth();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If auth check finished and there is no user session, block access and redirect
    if (!loading && !user && path !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [loading, user, path, router]);

  // Login page has its own full split layout
  if (path === '/admin/login') {
    return children;
  }

  // Luxury branded gate loader while verifying session
  if (loading) {
    return (
      <div className="adminGateContainer">
        <div className="adminGateCard">
          <div className="adminGateRingWrap">
            <div className="adminGatePulseOrb" />
            <div className="adminGateRing" />
            <div className="adminGateGemIcon">💎</div>
          </div>
          <strong className="adminGateTitle">ELORES EXECUTIVE SUITE</strong>
          <span className="adminGateSubtitle">Verifying secure admin session…</span>
        </div>
      </div>
    );
  }

  // If unauthenticated on protected route, show redirect message (prevent any admin content leak)
  if (!user) {
    return (
      <div className="adminGateContainer">
        <div className="adminGateCard">
          <strong className="adminGateTitle">Access Restricted</strong>
          <span className="adminGateSubtitle">Authorized session required. Redirecting to sign in…</span>
        </div>
      </div>
    );
  }

  // Authorized: render the complete admin layout and requested page
  return <AdminLayout>{children}</AdminLayout>;
}

export default function Layout({ children }) {
  return (
    <AdminToastProvider>
      <AdminAuthProvider>
        <Gate>{children}</Gate>
      </AdminAuthProvider>
    </AdminToastProvider>
  );
}
