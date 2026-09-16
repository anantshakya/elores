import HomeClient from './_components/HomeClient.jsx';

const API =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8080/api';

export const metadata = {
  title: 'Modern Jewellery for Everyday Elegance',
  description:
    'Shop modern, skin-friendly and anti-tarnish jewellery at Elores with Pan-India delivery.',
  alternates: { canonical: '/' },
};

async function getHomeProducts() {
  try {
    let response = await fetch(`${API}/products?limit=8&featured=1`, {
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`Products API returned ${response.status}`);
    let json = await response.json();
    let products = Array.isArray(json.data) ? json.data : [];

    // A fresh catalogue may not have featured flags yet. Show normal products
    // instead of rendering an empty homepage.
    if (!products.length) {
      response = await fetch(`${API}/products?limit=8`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Products API returned ${response.status}`);
      json = await response.json();
      products = Array.isArray(json.data) ? json.data : [];
    }

    return products;
  } catch (error) {
    console.error('Homepage product fetch failed:', error);
    return [];
  }
}

export default async function Page() {
  const products = await getHomeProducts();
  return <HomeClient initialProducts={products} />;
}
