'use client';
import React, { useState, useEffect } from "react";
import {
  Empty,
  ProductGrid,
  SEO,
  useStore,
} from "@/app/_components/StorefrontCore.jsx";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const { wishlist, isLoaded } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || (isLoaded !== undefined && !isLoaded)) {
    return (
      <section className="section">
        <SEO title="Wishlist | Elores" />
        <div className="shopTitle">
          <small>YOUR PICKS</small>
          <h1>Wishlist</h1>
        </div>
        <div style={{ minHeight: "220px", display: "flex", alignItems: "center", justifyContent: "center", color: "#8C8279" }}>
          <p>Loading your wishlist...</p>
        </div>
      </section>
    );
  }

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
