/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  async redirects() {
    return [
      {
        source: '/admin/product/:path*',
        destination: '/admin/products/:path*',
        permanent: false,
      },
      {
        source: '/admin/order/:path*',
        destination: '/admin/orders/:path*',
        permanent: false,
      },
      {
        source: '/admin/category/:path*',
        destination: '/admin/categories/:path*',
        permanent: false,
      },
      {
        source: '/admin/coupon/:path*',
        destination: '/admin/coupons/:path*',
        permanent: false,
      },
      {
        source: '/admin/user/:path*',
        destination: '/admin/users/:path*',
        permanent: false,
      },
      {
        source: '/admin/banner/:path*',
        destination: '/admin/carousel/:path*',
        permanent: false,
      },
      {
        source: '/admin/banners/:path*',
        destination: '/admin/carousel/:path*',
        permanent: false,
      },
    ];
  },
};
export default nextConfig;
