'use client';
import React from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function Link({ to, href, children, ...props }) {
  return <NextLink href={to || href || '/'} {...props}>{children}</NextLink>;
}
export function NavLink({ to, href, children, className, end, ...props }) {
  const pathname = usePathname();
  const target = to || href || '/';
  const active = pathname === target.split('?')[0];
  const cls = typeof className === 'function' ? className({ isActive: active }) : className;
  return <NextLink href={target} className={cls} {...props}>{children}</NextLink>;
}
export function useNavigate() {
  const router = useRouter();
  const nav = (to, options={}) => options?.replace ? router.replace(to) : router.push(to);
  nav.replace = router.replace;
  return nav;
}
export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
  return { pathname, search };
}
export { useParams } from 'next/navigation';
export function Navigate({to, replace=false}) { const router=useRouter(); React.useEffect(()=>{ replace ? router.replace(to) : router.push(to); },[to,replace,router]); return null; }
export function Outlet(){ return null; }
