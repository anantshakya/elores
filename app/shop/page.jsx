import ShopClient from './ShopClient.jsx';

export const metadata = {
  title: 'Shop Jewellery',
  description: 'Explore necklaces, bracelets, rings, earrings and modern everyday jewellery from Elores.',
  alternates: { canonical: '/shop' },
};

export default function Page() {
  return <ShopClient />;
}
