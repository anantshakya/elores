import { Suspense } from 'react';

export const metadata = { robots: { index: false, follow: false } };
export default function Layout({ children }) {
	return <Suspense>{children}</Suspense>;
}
