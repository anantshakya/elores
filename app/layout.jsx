import './globals.css';
import { Suspense } from 'react';
import ClientShell from './_components/ClientShell.jsx';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://elores.in'),
  title: { default: 'Elores — Modern Jewellery', template: '%s | Elores' },
  description: 'Shop modern everyday jewellery at Elores. Skin-friendly, anti-tarnish jewellery with Pan-India delivery.',
  applicationName: 'Elores',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'Elores', title: 'Elores — Modern Jewellery', description: 'Modern jewellery designed for everyday elegance.', images: ['/elores-logo.png'] },
  twitter: { card: 'summary_large_image', title: 'Elores — Modern Jewellery', description: 'Modern jewellery designed for everyday elegance.', images: ['/elores-logo.png'] },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><Suspense><ClientShell>{children}</ClientShell></Suspense></body></html>;
}
