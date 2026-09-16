'use client';
import React, { useEffect, useState } from "react";
import { Link } from "@/app/_lib/router-compat";
import { Gem, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import {
  api,
  Hero,
  ProductGrid,
  RecentlyViewed,
  SectionHead,
  SEO,
} from "@/app/_components/StorefrontCore.jsx";

export default function HomePage({ initialProducts = [] }) {
  const [products, setProducts] = useState(initialProducts);
  useEffect(() => {
    // Products are server-rendered by app/page.jsx for SEO. Only fetch in the
    // browser when server data was unavailable.
    if (initialProducts.length) return;
    api("/products?limit=8&featured=1")
      .then((d) => setProducts(Array.isArray(d.data) ? d.data : []))
      .catch((error) => console.error("Featured products failed:", error));
  }, [initialProducts.length]);
  useEffect(() => {
    if (!products.length)
      api("/products?limit=8")
        .then((d) => setProducts(d.data || []))
        .catch(() => {});
  }, [products.length]);
  const cats = [
    ["Necklaces", "A little glow, close to heart"],
    ["Bracelets", "Stack your story"],
    ["Rings", "Small details, big energy"],
    ["Earrings", "Made to frame you"],
  ];
  return (
    <>
      <SEO />
      <Hero />
      <section className="trust">
        <span>
          <ShieldCheck /> Skin-friendly
        </span>
        <span>
          <Gem /> Anti-tarnish finish
        </span>
        <span>
          <Truck /> Pan-India delivery
        </span>
        <span>
          <RotateCcw /> Easy returns
        </span>
      </section>
      <section className="section">
        <SectionHead
          kicker="CURATED FOR YOU"
          title="Shop by category"
          link="/shop"
        />
        <div className="catgrid">
          {cats.map((c, i) => (
            <Link
              key={c[0]}
              className={`cat c${i}`}
              to={`/shop?category=${c[0]}`}
            >
              <div className="jewelIcon">{["◯", "⌁", "◇", "✧"][i]}</div>
              <h3>{c[0]}</h3>
              <p>{c[1]}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="section soft">
        <SectionHead kicker="LOVED MOST" title="Bestsellers" link="/shop" />
        <ProductGrid products={products} />
      </section>
      <RecentlyViewed />
      <section className="story">
        <div>
          <small>THE ELORES PROMISE</small>
          <h2>Made for everyday luxury</h2>
          <p>
            Contemporary jewellery with clean silhouettes, wearable finishes and
            thoughtful pricing—designed for real everyday styling.
          </p>
          <Link className="btn dark" to="/page/about">
            Our story
          </Link>
        </div>
        <div className="storyArt">
          <span>EL</span>
        </div>
      </section>
    </>
  );
}
