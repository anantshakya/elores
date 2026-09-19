'use client';
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "@/app/_lib/router-compat";
import {
  Gem,
  Droplets,
  Sparkles,
  Award,
  Truck,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  api,
  Hero,
  ProductGrid,
  RecentlyViewed,
  SectionHead,
  SEO,
} from "@/app/_components/StorefrontCore.jsx";

function CategoryBubbleItem({ cat }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link
      to={`/shop${cat.query ? `?${cat.query}` : ""}`}
      className="bubbleItem"
    >
      <div className="bubbleCircle">
        {cat.image && !imgErr ? (
          <img
            src={cat.image}
            alt=""
            onError={() => setImgErr(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        ) : (
          <span className="bubbleIcon">{cat.icon || "✦"}</span>
        )}
      </div>
      <span className="bubbleTitle">{cat.title}</span>
    </Link>
  );
}

export default function HomePage({ initialProducts = [] }) {
  const [products, setProducts] = useState(initialProducts);
  const [under999, setUnder999] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    if (!initialProducts.length) {
      api("/products?limit=8&featured=1")
        .then((d) => {
          let list = Array.isArray(d.data) ? [...d.data] : [];
          if (list.length < 8) {
            api("/products?limit=12")
              .then((all) => {
                let allList = Array.isArray(all.data) ? all.data : [];
                const ids = new Set(list.map((x) => x.id));
                for (const p of allList) {
                  if (!ids.has(p.id)) {
                    list.push(p);
                    ids.add(p.id);
                  }
                  if (list.length >= 8) break;
                }
                setProducts([...list]);
              })
              .catch(() => setProducts(list));
          } else {
            setProducts(list);
          }
        })
        .catch(() => {
          api("/products?limit=8")
            .then((d) => setProducts(d.data || []))
            .catch(() => {});
        });
    }

    // Fetch dynamic categories with images
    api("/categories")
      .then((d) => setDbCategories(d.data || []))
      .catch(() => {});
  }, [initialProducts.length]);

  useEffect(() => {
    if (products.length > 0 && products.length < 8) {
      api("/products?limit=12")
        .then((all) => {
          let allList = Array.isArray(all.data) ? all.data : [];
          const list = [...products];
          const ids = new Set(list.map((x) => x.id));
          let added = false;
          for (const p of allList) {
            if (!ids.has(p.id)) {
              list.push(p);
              ids.add(p.id);
              added = true;
            }
            if (list.length >= 8) break;
          }
          if (added) setProducts(list);
        })
        .catch(() => {});
    }

    // Fetch under ₹999 collection for curated showcase
    api("/products?limit=4&max_price=999")
      .then((d) => setUnder999(d.data || []))
      .catch(() => {});
  }, [products.length]);

  // Combine DB categories with images or fallback to default list
  const categoryBubbles = useMemo(() => {
    if (dbCategories && dbCategories.length > 0) {
      return dbCategories.slice(0, 6).map((c) => ({
        title: c.name.toUpperCase(),
        icon: "✦",
        query: `category=${encodeURIComponent(c.name)}`,
        image: c.image || "",
      }));
    }
    return [
      { title: "RINGS", icon: "◇", query: "category=Rings", desc: "Stacking & Solitaire", image: "" },
      { title: "NECKLACES", icon: "◯", query: "category=Necklaces", desc: "Pendants & Chains", image: "" },
      { title: "EARRINGS", icon: "✧", query: "category=Earrings", desc: "Hoops & Huggies", image: "" },
      { title: "BRACELETS", icon: "⌁", query: "category=Bracelets", desc: "Cuffs & Tennis", image: "" },
      { title: "ALL JEWELS", icon: "✦", query: "", desc: "Explore Catalog", image: "" },
    ];
  }, [dbCategories]);

  return (
    <>
      <SEO
        title="Elores — Modern Everyday Luxury Jewellery"
        description="Shop waterproof, anti-tarnish artificial jewellery designed for everyday elegance. Free shipping above ₹999 & Pan-India COD."
      />

      <Hero />

      {/* Swashaa-Inspired 5-Pillar Trust Ribbon */}
      <section className="swashaaTrust">
        <div className="trustItem">
          <Gem className="trustIcon" size={22} />
          <div>
            <strong>ANTI-TARNISH</strong>
            <span>Premium Finish</span>
          </div>
        </div>
        <div className="trustItem">
          <Droplets className="trustIcon" size={22} />
          <div>
            <strong>WATERPROOF</strong>
            <span>Sweat & Perfume Proof</span>
          </div>
        </div>
        <div className="trustItem">
          <Sparkles className="trustIcon" size={22} />
          <div>
            <strong>SKIN-FRIENDLY</strong>
            <span>100% Hypoallergenic</span>
          </div>
        </div>
        <div className="trustItem">
          <Award className="trustIcon" size={22} />
          <div>
            <strong>6-MONTH WARRANTY</strong>
            <span>Polish Guarantee</span>
          </div>
        </div>
        <div className="trustItem">
          <Truck className="trustIcon" size={22} />
          <div>
            <strong>FREE SHIPPING & COD</strong>
            <span>Orders Above ₹999</span>
          </div>
        </div>
      </section>

      {/* Swashaa Circular Category Story Bubbles */}
      <section className="bubbleSection">
        <div className="bubbleContainer">
          <div className="categoryBubbles">
            {categoryBubbles.map((cat) => (
              <CategoryBubbleItem key={cat.title} cat={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Now / Bestsellers */}
      <section className="section">
        <SectionHead
          kicker="TRENDING THIS WEEK"
          title="Everyday Bestsellers"
          link="/shop"
        />
        <ProductGrid products={products.slice(0, 8)} />
      </section>

      {/* Editorial High-Impact Brand Showcase Banner */}
      <section className="editorialBanner">
        <div className="editorialBackdrop" />
        <div className="editorialContent">
          <small className="editorialKicker">THE ELORES QUALITY PROMISE</small>
          <h2>Designed to be lived in, never taken off.</h2>
          <p>
            Shower, sweat, sleep, and swim. Elores artificial jewellery is crafted
            with skin-friendly finishes and anti-tarnish polishes designed for effortless
            everyday luxury.
          </p>
          <div className="editorialActions">
            <Link to="/shop" className="btn dark pillBtn">
              <span>EXPLORE ALL JEWELLERY</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Curated Under ₹999 Showcase */}
      <section className="section soft">
        <SectionHead
          kicker="ACCESSIBLE LUXURY"
          title="Curated Under ₹999"
          link="/shop?max_price=999"
        />
        <ProductGrid
          products={under999.length ? under999 : products.slice(0, 4)}
        />
      </section>

      <RecentlyViewed />

      {/* Brand Story Section */}
      <section className="story">
        <div className="storyText">
          <small className="storyKicker">THE ELORES ATELIER</small>
          <h2>Modern aesthetics, honest craftsmanship</h2>
          <p>
            We believe fine design should accompany you daily without the luxury
            markup. Every Elores piece begins with high-grade anti-tarnish stainless
            steel, hand-polished and coated in rich champagne gold that stays radiant.
          </p>
          <Link className="btn dark pillBtn" to="/page/about">
            OUR DESIGN STORY
          </Link>
        </div>
        <div className="storyArt">
          <div className="storyRingGlow" />
          <span className="storyMonogram">EL</span>
        </div>
      </section>
    </>
  );
}
