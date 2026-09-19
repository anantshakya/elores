'use client';
import { usePathname } from 'next/navigation';
import { StoreProvider, ToastProvider, StoreLayout } from './StorefrontCore.jsx';
import { AuthModalProvider } from './AuthModal.jsx';

export default function ClientShell({ children }) {
  const path = usePathname() || '/';
  if (path.startsWith('/admin')) return children;
  return (
    <ToastProvider>
      <StoreProvider>
        <AuthModalProvider>
          <StoreLayout>{children}</StoreLayout>
        </AuthModalProvider>
      </StoreProvider>
    </ToastProvider>
  );
}

