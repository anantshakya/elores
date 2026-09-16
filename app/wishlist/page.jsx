'use client';
import React from "react";
import {
  Empty,
  ProductGrid,
  SEO,
  useStore,
} from "@/app/_components/StorefrontCore.jsx";

export default function WishlistPage() {
  const { wishlist } = useStore();
  return (
    <section className="section">
      <SEO title="Wishlist | Elores" />
      <div className="shopTitle">
        <small>YOUR PICKS</small>
        <h1>Wishlist</h1>
      </div>
      {wishlist.length ? (
        <ProductGrid products={wishlist} />
      ) : (
        <Empty text="Your wishlist is waiting for a little sparkle." />
      )}
    </section>
  );
}
