'use client';
import React, { useEffect, useState } from "react";
import { useLocation } from "@/app/_lib/router-compat";
import {
  api,
  ProductGrid,
  SearchBox,
  SEO,
} from "@/app/_components/StorefrontCore.jsx";

export default function ShopPage({ initialProducts = [] }) {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const [products, setProducts] = useState(initialProducts);
  const [q, setQ] = useState(params.get("q") || "");
  const [sort, setSort] = useState("newest");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [material, setMaterial] = useState("");
  const category = params.get("category") || "",
    gender = params.get("gender") || "";
  useEffect(() => {
    setQ(params.get("q") || "");
  }, [loc.search]);
  useEffect(() => {
    const p = new URLSearchParams({ limit: "60", sort });
    if (q) p.set("q", q);
    if (category) p.set("category", category);
    if (gender) p.set("gender", gender);
    if (min) p.set("min_price", min);
    if (max) p.set("max_price", max);
    if (material) p.set("material", material);
    api("/products?" + p)
      .then((d) => setProducts(d.data || []))
      .catch(() => setProducts([]));
  }, [q, sort, category, gender, min, max, material]);
  return (
    <section className="section shop">
      <SEO
        title={`${category || gender || "All Jewellery"} | Elores`}
        description="Browse rings, necklaces, bracelets, earrings and modern jewellery by Elores."
      />
      <div className="shopTitle">
        <small>ELORES COLLECTION</small>
        <h1>{category || gender || "All Jewellery"}</h1>
        <p>Find your new everyday favourite.</p>
      </div>
      <div className="filters">
        <SearchBox q={q} setQ={setQ} />
        <input
          className="smallInput"
          type="number"
          placeholder="Min ₹"
          value={min}
          onChange={(e) => setMin(e.target.value)}
        />
        <input
          className="smallInput"
          type="number"
          placeholder="Max ₹"
          value={max}
          onChange={(e) => setMax(e.target.value)}
        />
        <input
          className="smallInput"
          placeholder="Material"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="name">Name</option>
        </select>
      </div>
      {(() => {
        const displayProducts = (products && products.length > 0) ? products : initialProducts;
        return (
          <>
            <p className="count">{displayProducts.length} products</p>
            <ProductGrid products={displayProducts} />
          </>
        );
      })()}
    </section>
  );
}
