
'use client';
import AdminLayout from './_components/AdminLayout.jsx';
import { AdminAuthProvider, useAdminAuth } from './_components/AdminAuth.jsx';
import { AdminToastProvider } from './_components/AdminToast.jsx';
import { usePathname } from 'next/navigation';

function Gate({children}) {
 const {user,loading}=useAdminAuth(); const path=usePathname();
 if(path==='/admin/login') return children;
 if(loading) return <div className="adminLoading">Loading admin...</div>;
 if(!user){ if(typeof window!=='undefined') window.location.href='/admin/login'; return null; }
 return <AdminLayout>{children}</AdminLayout>;
}
export default function Layout({children}) {
 return <AdminToastProvider><AdminAuthProvider><Gate>{children}</Gate></AdminAuthProvider></AdminToastProvider>;
}
