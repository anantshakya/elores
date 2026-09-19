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

    let json = response.ok ? await response.json() : {};
    let products = Array.isArray(json.data) ? json.data : [];

    // If fewer than 8 featured items exist, top up with latest products
    if (products.length < 8) {
      let allRes = await fetch(`${API}/products?limit=12`, { cache: 'no-store' });
      if (allRes.ok) {
        let allJson = await allRes.json();
        let allProducts = Array.isArray(allJson.data) ? allJson.data : [];
        const existingIds = new Set(products.map((p) => p.id));
        for (const p of allProducts) {
          if (!existingIds.has(p.id)) {
            products.push(p);
            existingIds.add(p.id);
          }
          if (products.length >= 8) break;
        }
      }
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
