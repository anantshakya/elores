'use client';
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "@/app/_lib/router-compat";
import {
  Heart,
  Minus,
  Plus,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  MapPin,
  Check,
  ShoppingBag,
  Share2,
  ChevronDown,
  ChevronUp,
  Award,
  Droplets,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  api,
  JewelleryVisual,
  ProductGrid,
  Reviews,
  SectionHead,
  SEO,
  useStore,
  useToast,
} from "@/app/_components/StorefrontCore.jsx";

const money = (value) => {
  if (value == null) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ProductPage({ initialProduct = null }) {
  const { slug } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState(initialProduct);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState("");
  const [mainImgError, setMainImgError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Accordion state
  const [openSection, setOpenSection] = useState("specs"); // 'desc' | 'specs' | 'care' | 'shipping'

  // Pincode checker state
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState(null);
  const [checkingPin, setCheckingPin] = useState(false);

  // Sticky mobile bar visibility
  const [showStickyBar, setShowStickyBar] = useState(false);

  const { addCart, toggleWish, wishlist } = useStore();
  const toast = useToast();

  useEffect(() => {
    setMounted(true);
    api("/products/" + slug)
      .then((d) => {
        setP(d.data);
        const firstImg = (d.data.images || [])[0] || d.data.image || "";
        setActiveImage(firstImg);
        setMainImgError(false);
        if (Array.isArray(d.data.variants) && d.data.variants.length > 0) {
          setSelectedVariant(d.data.variants[0]);
        } else {
          setSelectedVariant(null);
        }

        // Recent items cache
        const rv = JSON.parse(
          localStorage.getItem("elores_recent") || "[]",
        ).filter((x) => x.id !== d.data.id);
        localStorage.setItem(
          "elores_recent",
          JSON.stringify([d.data, ...rv].slice(0, 8)),
        );

        // Related pieces
        api(
          `/products?category=${encodeURIComponent(d.data.category_name)}&limit=5`,
        )
          .then((x) =>
            setRelated(
              (x.data || []).filter((z) => z.id !== d.data.id).slice(0, 4),
            ),
          )
          .catch(() => {});

        // View analytics
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

  // Scroll listener for sticky mobile buy bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length < 6) {
      toast.show("Please enter a valid 6-digit PIN code", "error");
      return;
    }
    setCheckingPin(true);
    setTimeout(() => {
      setCheckingPin(false);
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      const formatted = deliveryDate.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      setPincodeResult({
        date: formatted,
        eligible: true,
        cod: true,
      });
    }, 400);
  };

  const getCartProduct = () => {
    if (!p) return null;
    return {
      ...p,
      price: price,
      sale_price: activeVariantSalePrice,
      stock: currentStock,
      variant_id: selectedVariant?.id || null,
      variant_title: selectedVariant?.title || null,
      variant_sku: selectedVariant?.sku || null,
    };
  };

  const handleBuyNow = () => {
    const item = getCartProduct();
    if (!item) return;
    addCart(item, qty);
    nav("/checkout");
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: p?.name || "Elores Jewellery",
          text: `Check out ${p?.name} on Elores!`,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.show("Product link copied to clipboard!");
    }
  };

  if (!p) {
    return (
      <div className="productDetailLoading">
        <Sparkles className="loadingIcon" />
        <p>Curating your piece...</p>
      </div>
    );
  }

  const images = (p.images || []).length ? p.images : p.image ? [p.image] : [];
  
  const activeVariantPrice = selectedVariant && selectedVariant.price ? Number(selectedVariant.price) : null;
  const activeVariantSalePrice = selectedVariant && selectedVariant.sale_price ? Number(selectedVariant.sale_price) : null;

  const price = activeVariantSalePrice ?? activeVariantPrice ?? Number(p.sale_price || p.price || 0);
  const originalPrice = activeVariantPrice ?? Number(p.price || 0);
  const currentStock = selectedVariant ? Number(selectedVariant.stock ?? 0) : Number(p.stock ?? 0);

  const hasDiscount = Boolean(p.sale_price && Number(p.sale_price) < originalPrice);
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const isWishlisted = mounted && wishlist.some((x) => Number(x.id) === Number(p.id));

  return (
    <>
      <SEO
        title={p.meta_title || `${p.name} | Elores Fine Jewellery`}
        description={p.meta_description || p.short_description || p.description}
        image={activeImage || p.image || "/elores-logo.png"}
        type="product"
        product={p}
      />

      {/* Breadcrumb Navigation */}
      <nav className="detailBreadcrumbs" aria-label="Breadcrumb">
        <div className="detailBreadcrumbsWrap">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          {p.category_name && (
            <>
              <span>/</span>
              <Link to={`/shop?category=${encodeURIComponent(p.category_name)}`}>
                {p.category_name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="currentBreadcrumb">{p.name}</span>
        </div>
      </nav>

      {/* Main Product Showcase Section */}
      <section className="productShowcaseContainer">
        <div className="productShowcaseGrid">
          {/* LEFT: Product Gallery */}
          <div className="productGalleryCol">
            <div className="productMainPhotoCard">
              {discountPercent > 0 && (
                <div className="gallerySaleBadge">SAVE {discountPercent}%</div>
              )}
              {p.badge && (
                <div className="galleryPromoBadge">{p.badge}</div>
              )}

              <button
                type="button"
                className={`galleryWishBtn ${isWishlisted ? "active" : ""}`}
                onClick={() => {
                  toggleWish(p);
                  toast.show(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
                }}
                aria-label="Add to wishlist"
              >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
              </button>

              <button
                type="button"
                className="galleryShareBtn"
                onClick={handleShare}
                aria-label="Share product"
              >
                <Share2 size={16} />
              </button>

              <div className="mainImageDisplay">
                {activeImage && !mainImgError ? (
                  <img
                    className="mainProductImage"
                    src={activeImage}
                    alt={p.name}
                    onError={() => setMainImgError(true)}
                  />
                ) : (
                  <JewelleryVisual type={p.category_name} seed={p.id} />
                )}
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="galleryThumbnailTrack">
                {images.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    className={`thumbButton ${img === activeImage ? "active" : ""}`}
                    onClick={() => {
                      setActiveImage(img);
                      setMainImgError(false);
                    }}
                  >
                    <img src={img} alt={`${p.name} view ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Micro Highlights strip below photos */}
            <div className="galleryTrustStrip">
              <div className="galleryTrustItem">
                <Sparkles size={16} className="trustGoldIcon" />
                <span>Anti-Tarnish</span>
              </div>
              <div className="galleryTrustItem">
                <Droplets size={16} className="trustGoldIcon" />
                <span>Waterproof</span>
              </div>
              <div className="galleryTrustItem">
                <ShieldCheck size={16} className="trustGoldIcon" />
                <span>Anti-Tarnish</span>
              </div>
              <div className="galleryTrustItem">
                <Award size={16} className="trustGoldIcon" />
                <span>Certified Skin Safe</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Buy Box & Information */}
          <div className="productBuyBoxCol">
            <div className="productCategoryKicker">
              <span>{p.category_name}</span>
              {p.gender && <span className="kickerSep">• {p.gender}</span>}
            </div>

            <h1 className="productMainTitle">{p.name}</h1>

            {/* Star Rating & Reviews Summary */}
            <div className="productRatingRow">
              <div className="starBadge">
                <Star size={13} fill="currentColor" />
                <span>{Number(p.rating_average || 4.8).toFixed(1)}</span>
              </div>
              <span className="reviewCountText">
                ({p.rating_count || 12} Verified Customer Reviews)
              </span>
            </div>

            {/* Price Presentation */}
            <div className="productPricePresentation">
              <div className="priceLine">
                <span className="currentHeroPrice">{money(price)}</span>
                {hasDiscount && (
                  <s className="originalStrikedPrice">{money(originalPrice)}</s>
                )}
                {discountPercent > 0 && (
                  <span className="heroDiscountTag">{discountPercent}% OFF</span>
                )}
              </div>
              <p className="taxInclusiveNote">Inclusive of all applicable taxes • Free shipping pan-India</p>
            </div>

            {/* Short Description */}
            <p className="productExcerpt">
              {p.short_description ||
                p.description ||
                "A statement piece crafted with exquisite precision. Layer it with your daily favorites or let it shine on its own."}
            </p>

            {/* Variant / Option Selector Chips */}
            {Array.isArray(p.variants) && p.variants.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1c1714", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Select Option: <strong style={{ color: "#a57c36" }}>{selectedVariant?.title}</strong>
                  </span>
                  {selectedVariant?.sku && (
                    <span style={{ fontSize: "11px", color: "#888" }}>SKU: {selectedVariant.sku}</span>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {p.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const isOut = Number(v.stock) <= 0;
                    return (
                      <button
                        key={v.id || v.title}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: isSelected ? "2px solid #a57c36" : "1px solid #e2d9cd",
                          background: isSelected ? "#fbf8f3" : "#fff",
                          color: isSelected ? "#a57c36" : "#231f1c",
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: "13px",
                          cursor: isOut ? "not-allowed" : "pointer",
                          opacity: isOut ? 0.5 : 1,
                          textDecoration: isOut ? "line-through" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {v.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="purchaseActionBlock">
              <div className="qtySelectRow">
                <span className="qtyLabel">Quantity:</span>
                <div className="luxuryQtyCounter">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="qtyNumber">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(qty + 1)}
                    disabled={currentStock <= qty}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {currentStock <= 5 && currentStock > 0 && (
                  <span className="stockAlertPill">Only {currentStock} units left!</span>
                )}
              </div>

              {/* Main CTA Buttons */}
              <div className="ctaButtonsGrid">
                <button
                  type="button"
                  className="btnAddToBag"
                  disabled={currentStock <= 0}
                  onClick={() => {
                    const item = getCartProduct();
                    if (item) {
                      addCart(item, qty);
                      toast.show(`Added ${qty} × ${p.name} ${selectedVariant ? `(${selectedVariant.title})` : ""} to your bag!`);
                    }
                  }}
                >
                  <ShoppingBag size={18} />
                  <span>{currentStock > 0 ? "ADD TO BAG" : "OUT OF STOCK"}</span>
                </button>

                <button
                  type="button"
                  className="btnBuyNow"
                  disabled={currentStock <= 0}
                  onClick={handleBuyNow}
                >
                  <span>BUY IT NOW</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Delivery Estimator / Pincode Check */}
            <div className="deliveryCheckCard">
              <div className="checkCardHeader">
                <MapPin size={16} className="pinHeaderIcon" />
                <strong>Check Delivery &amp; Services</strong>
              </div>
              <form onSubmit={handleCheckPincode} className="pincodeCheckForm">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit Pincode"
                />
                <button type="submit" disabled={checkingPin}>
                  {checkingPin ? "..." : "CHECK"}
                </button>
              </form>

              {pincodeResult && (
                <div className="pincodeResultBox">
                  <div className="pinResultLine">
                    <Check size={15} className="pinCheckIcon" />
                    <span>
                      Estimated delivery by <strong>{pincodeResult.date}</strong>
                    </span>
                  </div>
                  <div className="pinBadgesRow">
                    <span className="pinFeature">✦ Cash On Delivery Available</span>
                    <span className="pinFeature">✦ Free Express Dispatch</span>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Luxury Accordions */}
            <div className="productInfoAccordions">
              {/* Accordion 1: Specifications */}
              <div className="accItem">
                <button
                  type="button"
                  className="accHeader"
                  onClick={() => setOpenSection(openSection === "specs" ? "" : "specs")}
                >
                  <span>Product Specifications &amp; Dimensions</span>
                  {openSection === "specs" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openSection === "specs" && (
                  <div className="accContent">
                    <div className="specsTable">
                      <div className="specRow">
                        <span className="specLabel">Base Material</span>
                        <span className="specVal">{p.material || "Premium Stainless Steel (Hypoallergenic)"}</span>
                      </div>
                      <div className="specRow">
                        <span className="specLabel">Plating Finish</span>
                        <span className="specVal">Premium Anti-Tarnish Polish</span>
                      </div>
                      <div className="specRow">
                        <span className="specLabel">Dimensions</span>
                        <span className="specVal">{p.dimensions || "Standard Adjustable Fit"}</span>
                      </div>
                      <div className="specRow">
                        <span className="specLabel">Net Weight</span>
                        <span className="specVal">{p.weight || "Lightweight (~12g)"}</span>
                      </div>
                      <div className="specRow">
                        <span className="specLabel">Skin Compatibility</span>
                        <span className="specVal">100% Nickel-Free, Lead-Free &amp; Waterproof</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Care Guide */}
              <div className="accItem">
                <button
                  type="button"
                  className="accHeader"
                  onClick={() => setOpenSection(openSection === "care" ? "" : "care")}
                >
                  <span>Jewellery Care &amp; Longevity</span>
                  {openSection === "care" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openSection === "care" && (
                  <div className="accContent">
                    <p className="careText">
                      {p.care_instructions ||
                        "Our pieces are water-resistant and anti-tarnish. To preserve peak brilliance, wipe gently with a microfiber cloth after daily wear and store inside your Elores luxury pouch away from direct perfumes and harsh cleaning chemicals."}
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Shipping & Returns */}
              <div className="accItem">
                <button
                  type="button"
                  className="accHeader"
                  onClick={() => setOpenSection(openSection === "shipping" ? "" : "shipping")}
                >
                  <span>Shipping &amp; 15-Day Easy Returns</span>
                  {openSection === "shipping" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openSection === "shipping" && (
                  <div className="accContent">
                    <ul className="shippingList">
                      <li>✦ Dispatched within 24 to 48 hours from our fulfillment hub.</li>
                      <li>✦ Free express delivery pan-India on orders above ₹999.</li>
                      <li>✦ 15-day no-questions-asked replacement or return guarantee.</li>
                      <li>✦ Comes packaged in signature Elores magnetic gift box.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <Reviews product={p} />

      {/* Related Products Carousel */}
      {related.length > 0 && (
        <section className="section soft relatedSection">
          <SectionHead
            kicker="COMPLETE THE LOOK"
            title="You May Also Cherish"
          />
          <ProductGrid products={related} />
        </section>
      )}

      {/* Mobile Sticky Buy Bar */}
      {showStickyBar && (
        <div className="mobileStickyBuyBar">
          <div className="stickyBarInner">
            <div className="stickyBarProduct">
              <img
                src={activeImage || p.image || "/elores-logo.png"}
                alt=""
                className="stickyThumb"
              />
              <div className="stickyText">
                <strong className="stickyTitle">{p.name}</strong>
                <span className="stickyPrice">{money(price)}</span>
              </div>
            </div>
            <button
              type="button"
              className="stickyAddBtn"
              disabled={Number(p.stock) <= 0}
              onClick={() => {
                addCart(p, 1);
                toast.show("Added to bag");
              }}
            >
              {Number(p.stock) > 0 ? "ADD TO BAG" : "SOLD OUT"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
