import { Suspense } from 'react';
import ShopClient from './ShopClient.jsx';

const getApi = () => {
  const env = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '';
  if (env && env.includes('elores_ecom')) return env.replace(/\/+$/, '');
  return 'http://localhost/elores_ecom/elores_backend/api';
};

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop Jewellery',
  description: 'Explore necklaces, bracelets, rings, earrings and modern everyday jewellery from Elores.',
  alternates: { canonical: '/shop' },
};

async function getProducts() {
  const api =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost/elores_ecom/elores_backend/api';
  try {
    const res = await fetch(`${api}/products?limit=60`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    console.error('getProducts error:', e);
    return [];
  }
}

export default async function Page() {
  const products = await getProducts();
  return (
    <Suspense fallback={<div className="section"><p>Loading jewellery...</p></div>}>
      <ShopClient initialProducts={products} />
    </Suspense>
  );
}
