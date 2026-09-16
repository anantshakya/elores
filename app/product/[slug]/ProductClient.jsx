'use client';
import React, { useEffect, useState } from "react";
import { useParams } from "@/app/_lib/router-compat";
import { Heart, Minus, Plus, Star } from "lucide-react";
import {
  api,
  JewelleryVisual,
  ProductGrid,
  Reviews,
  SectionHead,
  SEO,
  Spec,
  useStore,
  useToast,
} from "@/app/_components/StorefrontCore.jsx";
const money = (value) => {
  if (value == null) return '';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
};


export default function ProductPage({ initialProduct = null }) {
  const { slug } = useParams();
  const [p, setP] = useState(initialProduct),
    [qty, setQty] = useState(1),
    [related, setRelated] = useState([]),
    [activeImage, setActiveImage] = useState(""),
    [mounted, setMounted] = useState(false);
  const { addCart, toggleWish, wishlist } = useStore();
  const toast = useToast();
  useEffect(() => {
    setMounted(true);
    api("/products/" + slug)
      .then((d) => {
        setP(d.data);
        setActiveImage((d.data.images || [])[0] || d.data.image || "");
        const rv = JSON.parse(
          localStorage.getItem("elores_recent") || "[]",
        ).filter((x) => x.id !== d.data.id);
        localStorage.setItem(
          "elores_recent",
          JSON.stringify([d.data, ...rv].slice(0, 8)),
        );
        api(
          `/products?category=${encodeURIComponent(d.data.category_name)}&limit=5`,
        )
          .then((x) =>
            setRelated(
              (x.data || []).filter((z) => z.id !== d.data.id).slice(0, 4),
            ),
          )
          .catch(() => {});
        api("/analytics", {
          method: "POST",
          body: JSON.stringify({
            event_name: "product_view",
            product_id: d.data.id,
            path: location.pathname,
          }),
        }).catch(() => {});
      })
      .catch(() => {});
  }, [slug]);
  if (!p) return <div className="loading">Loading piece…</div>;
  const images = (p.images || []).length ? p.images : p.image ? [p.image] : [];
  return (
    <>
      <SEO
        title={p.meta_title || `${p.name} | Elores`}
        description={p.meta_description || p.short_description || p.description}
        image={activeImage || p.image || "/elores-logo.png"}
        type="product"
        product={p}
      />
      <section className="detail">
        <div className="productGallery">
          <div className="detailImg">
            {activeImage ? (
              <img
                className="productPhoto detailPhoto"
                src={activeImage}
                alt={p.name}
              />
            ) : (
              <JewelleryVisual type={p.category_name} seed={p.id} />
            )}
          </div>
          {images.length > 1 && (
            <div className="galleryThumbs">
              {images.map((img, i) => (
                <button
                  key={img + i}
                  className={img === activeImage ? "active" : ""}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`${p.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detailInfo">
          <small>
            {p.category_name} · {p.gender}
          </small>
          <h1>{p.name}</h1>
          <div className="ratingLine">
            <Star fill="currentColor" /> {p.rating_average || 0}{" "}
            <span>({p.rating_count || 0} reviews)</span>
          </div>
          <div className="price big">
            <b>{money(p.sale_price || p.price)}</b>
            {p.sale_price && <s>{money(p.price)}</s>}
          </div>
          <p className="muted">Inclusive of all taxes</p>
          <div className="pillrow">
            <span>Anti-tarnish</span>
            <span>Skin-friendly</span>
            <span>Gift-ready</span>
          </div>
          <p>{p.short_description || p.description}</p>
          <div className="qty">
            <button onClick={() => setQty(Math.max(1, qty - 1))}>
              <Minus />
            </button>
            <span>{qty}</span>
            <button onClick={() => setQty(qty + 1)}>
              <Plus />
            </button>
          </div>
          <button
            className="btn dark full"
            disabled={Number(p.stock) <= 0}
            onClick={() => {
              addCart(p, qty);
              toast.show("Product added to cart");
            }}
          >
            {Number(p.stock) > 0 ? "ADD TO CART" : "OUT OF STOCK"}
          </button>
          <button
            className="btn light full"
            onClick={() => {
              toggleWish(p);
              toast.show(
                wishlist.some((x) => x.id === p.id)
                  ? "Removed from wishlist"
                  : "Saved to wishlist",
              );
            }}
          >
            <Heart
              fill={
                mounted && wishlist.some((x) => x.id === p.id) ? "currentColor" : "none"
              }
            />{" "}
            {mounted && wishlist.some((x) => x.id === p.id)
              ? "SAVED TO WISHLIST"
              : "ADD TO WISHLIST"}
          </button>
          <Spec label="Material" value={p.material} />
          <Spec label="Dimensions" value={p.dimensions} />
          <Spec label="Weight" value={p.weight} />
          <Spec
            label="Care"
            value={p.care_instructions || "Keep dry and store separately."}
          />
          <Spec
            label="Delivery"
            value="Usually dispatched in 1–2 business days"
          />
        </div>
      </section>
      <Reviews product={p} />
      {related.length > 0 && (
        <section className="section soft">
          <SectionHead kicker="YOU MAY ALSO LIKE" title="Related pieces" />
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}
