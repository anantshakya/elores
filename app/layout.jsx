import './globals.css';
import { Suspense } from 'react';
import { Cormorant_Garamond, Poppins, Playfair_Display } from 'next/font/google';
import ClientShell from './_components/ClientShell.jsx';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Elores — Modern Jewellery', template: '%s | Elores' },
  description: 'Shop modern everyday jewellery at Elores. Skin-friendly, anti-tarnish jewellery with Pan-India delivery.',
  applicationName: 'Elores',
  robots: {
    index: true,
    follow: true,
  },
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'Elores', title: 'Elores — Modern Jewellery', description: 'Modern jewellery designed for everyday elegance.', images: ['/elores-logo.png'] },
  twitter: { card: 'summary_large_image', title: 'Elores — Modern Jewellery', description: 'Modern jewellery designed for everyday elegance.', images: ['/elores-logo.png'] },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${poppins.variable} ${playfair.variable}`}>
      <body>
        <Suspense>
          <ClientShell>{children}</ClientShell>
        </Suspense>
      </body>
    </html>
  );
}

