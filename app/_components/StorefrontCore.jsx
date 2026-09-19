'use client';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
  Outlet,
} from "@/app/_lib/router-compat";
import { useAuthModal } from "./AuthModal.jsx";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Minus,
  Plus,
  Trash2,
  Package,
  LayoutDashboard,
  Gem,
  Tags,
  LogOut,
  Settings,
  Users,
  Image as ImageIcon,
  TicketPercent,
  Star,
  FileText,
  MessageSquare,
  BarChart3,
  Upload,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Printer,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Droplets,
} from "lucide-react";

const getApiUrl = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    if (host === 'localhost' || host === '127.0.0.1' || /^(\d+\.){3}\d+$/.test(host)) {
      return `${protocol}//${host}/elores_ecom/elores_backend/api`;
    }
  }
  const env = process.env.NEXT_PUBLIC_API_URL || "";
  if (env && env.includes('elores_ecom')) return env.replace(/\/+$/, "");
  return "http://localhost/elores_ecom/elores_backend/api";
};

const API = getApiUrl();
const api = async (path, options = {}) => {
  const currentApi = getApiUrl();
  // Storefront requests always use the customer token. Admin has its own
  // helper in app/admin/_lib/api.js. The old code referenced an undefined
  // `admin` variable, which caused every storefront API call to fail before
  // fetch() was executed.
  const token = typeof window !== "undefined"
    ? localStorage.getItem("elores_customer_token")
    : null;
  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const cleanApi = currentApi.replace(/\/+$/, "");
  const res = await fetch(`${cleanApi}${cleanPath}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};
const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const StoreCtx = createContext();
const ToastCtx = createContext({ show: () => { } });
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="toastStack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === "success" ? <CheckCircle2 /> : <AlertCircle />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);
const sessionKey = () => {
  if (typeof window === "undefined") return "";
  let k = localStorage.getItem("elores_session_key");
  if (!k) {
    k = "EL-" + Date.now() + "-" + Math.random().toString(36).slice(2);
    localStorage.setItem("elores_session_key", k);
  }
  return k;
};
function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Load from localStorage safely on mount to prevent SSR hydration mismatch
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("elores_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) { }

    try {
      const savedWish = localStorage.getItem("elores_wishlist");
      if (savedWish) setWishlist(JSON.parse(savedWish));
    } catch (e) { }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("elores_cart", JSON.stringify(cart));
      } catch (e) { }
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("elores_wishlist", JSON.stringify(wishlist));
      } catch (e) { }
    }
  }, [wishlist, isLoaded]);
  useEffect(() => {
    if (cart.length) {
      const total = cart.reduce(
        (s, x) => s + Number(x.sale_price || x.price) * x.qty,
        0,
      );
      const t = setTimeout(
        () =>
          api("/cart/save", {
            method: "POST",
            body: JSON.stringify({ session_key: sessionKey(), cart, total }),
          }).catch(() => { }),
        800,
      );
      return () => clearTimeout(t);
    }
  }, [cart]);
  const toast = useToast();
  const authModal = useAuthModal();

  const addCart = (p, qty = 1) => {
    if (typeof window !== "undefined" && !localStorage.getItem("elores_customer_token")) {
      toast.show("Please sign in to add items to your cart", "error");
      if (authModal?.openAuth) {
        authModal.openAuth("login");
      }
      return;
    }
    setCart((c) => {
      const hit = c.find((x) => x.id === p.id);
      return hit
        ? c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + qty } : x))
        : [...c, { ...p, qty }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id, qty) =>
    setCart((c) =>
      qty <= 0
        ? c.filter((x) => x.id !== id)
        : c.map((x) => (x.id === id ? { ...x, qty } : x)),
    );

  const toggleWish = (p) => {
    if (typeof window !== "undefined" && !localStorage.getItem("elores_customer_token")) {
      toast.show("Please sign in to add items to your wishlist", "error");
      if (authModal?.openAuth) {
        authModal.openAuth("login");
      }
      return;
    }
    setWishlist((w) =>
      w.some((x) => x.id === p.id) ? w.filter((x) => x.id !== p.id) : [...w, p],
    );
  };
  return (
    <StoreCtx.Provider
      value={{
        cart,
        wishlist,
        isLoaded,
        addCart,
        updateQty,
        toggleWish,
        setCart,
        cartCount: cart.reduce((s, x) => s + x.qty, 0),
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </StoreCtx.Provider>
  );
}
const useStore = () => useContext(StoreCtx);
function SEO({
  title = "Elores — Modern Jewellery",
  description = "Shop modern everyday jewellery at Elores.",
  image = "/elores-logo.png",
  type = "website",
  product,
}) {
  const loc = useLocation();
  useEffect(() => {
    document.title = title;
    const set = (sel, attr, val) => {
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement("meta");
        Object.entries(attr).forEach(([k, v]) => el.setAttribute(k, v));
        document.head.appendChild(el);
      }
      el.setAttribute("content", val);
    };
    set('meta[name="description"]', { name: "description" }, description);
    set('meta[property="og:title"]', { property: "og:title" }, title);
    set(
      'meta[property="og:description"]',
      { property: "og:description" },
      description,
    );
    set('meta[property="og:type"]', { property: "og:type" }, type);
    set('meta[property="og:image"]', { property: "og:image" }, image);
    let c = document.querySelector('link[rel="canonical"]');
    if (!c) {
      c = document.createElement("link");
      c.rel = "canonical";
      document.head.appendChild(c);
    }
    c.href = window.location.origin + loc.pathname;
    document.getElementById("elores-jsonld")?.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "elores-jsonld";
    script.textContent = JSON.stringify(
      product
        ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          image: [product.image || image],
          description: product.description,
          sku: product.sku,
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: product.sale_price || product.price,
            availability:
              Number(product.stock) > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        }
        : {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Elores",
          url: window.location.origin,
          logo: window.location.origin + "/elores-logo.png",
        },
    );
    document.head.appendChild(script);
    api("/analytics", {
      method: "POST",
      body: JSON.stringify({ event_name: "page_view", path: loc.pathname }),
    }).catch(() => { });
    return () => script.remove();
  }, [title, description, image, type, loc.pathname]);
  return null;
}


function CartDrawer() {
  const { cart, updateQty, isCartOpen, closeCart } = useStore();
  const nav = useNavigate();

  const subtotal = cart.reduce(
    (sum, x) => sum + Number(x.sale_price || x.price) * x.qty,
    0
  );
  const freeThreshold = 999;
  const remaining = Math.max(0, freeThreshold - subtotal);
  const progress = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="cartDrawerOverlay" onClick={closeCart}>
      <div
        className="cartDrawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Bag"
      >
        <div className="cartDrawerHeader">
          <div className="cartDrawerTitle">
            <ShoppingBag size={18} />
            <h3>YOUR SHOPPING BAG</h3>
            <span className="cartDrawerCount">
              {cart.reduce((s, x) => s + x.qty, 0)}
            </span>
          </div>
          <button
            type="button"
            className="cartDrawerClose"
            onClick={closeCart}
            aria-label="Close Bag"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="shippingProgressBox">
          <div className="shippingProgressMsg">
            {remaining === 0 ? (
              <span>🎉 Congratulations! You have unlocked <strong>FREE Delivery</strong></span>
            ) : (
              <span>Add <strong>{money(remaining)}</strong> more to unlock <strong>FREE Delivery</strong></span>
            )}
          </div>
          <div className="shippingProgressBar">
            <div
              className="shippingProgressFill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="cartDrawerItems">
          {cart.length === 0 ? (
            <div className="cartDrawerEmpty">
              <div className="emptyIconRing">
                <Gem size={28} />
              </div>
              <h4>Your bag is empty</h4>
              <p>Explore our trending jewellery pieces designed for everyday elegance.</p>
              <button
                type="button"
                className="btn dark pillBtn"
                onClick={() => {
                  closeCart();
                  nav("/shop");
                }}
              >
                DISCOVER BESTSELLERS
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const itemPrice = Number(item.sale_price || item.price);
              const originalPrice = Number(item.price);
              return (
                <div key={item.id} className="cartDrawerItem">
                  <Link
                    to={`/product/${item.slug}`}
                    className="cartItemThumb"
                    onClick={closeCart}
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="cartThumbFallback">
                        <Gem size={18} />
                      </div>
                    )}
                  </Link>

                  <div className="cartItemDetails">
                    <div className="cartItemTop">
                      <Link
                        to={`/product/${item.slug}`}
                        className="cartItemName"
                        onClick={closeCart}
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        className="cartItemRemove"
                        onClick={() => updateQty(item.id, 0)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="cartItemPricing">
                      <strong>{money(itemPrice)}</strong>
                      {item.sale_price && originalPrice > itemPrice && (
                        <s>{money(originalPrice)}</s>
                      )}
                    </div>

                    <div className="cartItemBottom">
                      <div className="qtyStepper">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span>{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="cartItemLineTotal">
                        {money(itemPrice * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Subtotal & Checkout */}
        {cart.length > 0 && (
          <div className="cartDrawerFooter">
            <div className="cartDrawerTotals">
              <div className="cartTotalRow">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <div className="cartTotalRow subtle">
                <span>Estimated Shipping</span>
                <span>{subtotal >= freeThreshold ? "FREE" : "Calculated at checkout"}</span>
              </div>
              <small className="taxesNote">Taxes and shipping calculated at checkout</small>
            </div>

            <button
              type="button"
              className="btn dark full pillBtn checkoutBtn"
              onClick={() => {
                closeCart();
                nav("/checkout");
              }}
            >
              <span>PROCEED TO CHECKOUT</span>
              <span>•</span>
              <strong>{money(subtotal)}</strong>
            </button>

            <div className="cartDrawerLinks">
              <button
                type="button"
                className="viewBagLink"
                onClick={() => {
                  closeCart();
                  nav("/cart");
                }}
              >
                View Full Bag & Apply Coupon
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      className="scrollTopBtn"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ChevronUp size={22} />
    </button>
  );
}

function StoreLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState({
    logo: "/elores-logo.png",
    announcement:
      "FREE SHIPPING ABOVE ₹999 • COD AVAILABLE • EASY 7-DAY RETURNS",
  });
  const [categories, setCategories] = useState([]);
  const { cartCount, wishlist, openCart } = useStore();
  const { openAuth } = useAuthModal();
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location?.pathname, location?.search]);
  useEffect(() => {
    setMounted(true);
    // Instant cache hydration to prevent visual flash on initial load
    try {
      const cachedSet = localStorage.getItem("elores_cached_settings");
      if (cachedSet) setSettings((s) => ({ ...s, ...JSON.parse(cachedSet) }));
      const cachedCats = localStorage.getItem("elores_cached_categories");
      if (cachedCats) setCategories(JSON.parse(cachedCats));
    } catch (e) { }

    api("/settings")
      .then((d) => {
        if (d?.data) {
          setSettings((s) => {
            const next = { ...s, ...d.data };
            try { localStorage.setItem("elores_cached_settings", JSON.stringify(next)); } catch (e) { }
            return next;
          });
        }
      })
      .catch(() => { });

    api("/categories")
      .then((d) => {
        if (d?.data) {
          const list = d.data || [];
          setCategories(list);
          try { localStorage.setItem("elores_cached_categories", JSON.stringify(list)); } catch (e) { }
        }
      })
      .catch(() => { });
  }, []);
  return (
    <>
      <div className="offerbar">
        <span>✦</span>
        {settings.announcement}
        <span>✦</span>
      </div>
      <header className="frostedHeader">
        <div className="navwrap">
          <button
            aria-label="Toggle menu"
            className="icon mobile"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <Link className="logo logoImg" to="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", overflow: "visible" }}>
            <img
              src={settings.logo || "/elores-logo.png"}
              alt="Elores logo"
              style={{ height: "44px", maxHeight: "46px", width: "auto", maxWidth: "320px", objectFit: "contain" }}
              fetchPriority="high"
            />
          </Link>
          <nav className={open ? "open" : ""} onClick={() => setOpen(false)}>
            <NavLink to="/shop">ALL JEWELLERY</NavLink>
            {categories.map((c) => (
              <NavLink key={c.id || c.name} to={`/shop?category=${encodeURIComponent(c.name)}`}>
                {c.name.toUpperCase()}
              </NavLink>
            ))}
          </nav>
          <div className="actions">
            <Link aria-label="Search catalogue" to="/shop" className="actionIconBtn">
              <Search />
            </Link>
            <Link
              aria-label={mounted && wishlist.length > 0 ? `Wishlist, ${wishlist.length} items` : "Wishlist"}
              to="/wishlist"
              className="actionIconBtn"
            >
              <Heart />
              {mounted && wishlist.length > 0 && <b aria-hidden="true">{wishlist.length}</b>}
            </Link>
            <button
              type="button"
              aria-label="User Account"
              className="actionIconBtn"
              onClick={() => {
                if (typeof window !== "undefined" && localStorage.getItem("elores_customer_token")) {
                  nav("/account");
                } else {
                  openAuth("login");
                }
              }}
            >
              <User />
            </button>
            <button
              type="button"
              aria-label={mounted && cartCount > 0 ? `Shopping Bag, ${cartCount} items` : "Shopping Bag"}
              className="actionIconBtn cartTriggerBtn"
              onClick={openCart}
            >
              <ShoppingBag />
              {mounted && cartCount > 0 && <b aria-hidden="true">{cartCount}</b>}
            </button>
          </div>
        </div>
      </header>
      <main>
        {children || <Outlet />}
      </main>
      <Footer settings={settings} />
      <CartDrawer />
      <ScrollToTop />
    </>
  );
}

function Hero() {
  const fallback = useMemo(
    () => [
      {
        title: "Everyday Waterproof Luxury",
        subtitle:
          "Anti-tarnish, skin-friendly artificial jewellery crafted for your daily rhythm.",
        image: "",
        button_text: "EXPLORE COLLECTION",
        button_url: "/shop",
      },
      {
        title: "Timeless Elegance & Daily Luxe",
        subtitle:
          "Lightweight 18K gold-plated finishes crafted for sweat, shower & swim.",
        image: "",
        button_text: "SHOP BESTSELLERS",
        button_url: "/shop",
      },
    ],
    []
  );
  const [slides, setSlides] = useState(fallback),
    [active, setActive] = useState(0);

  useEffect(() => {
    api("/banners")
      .then((d) => {
        if (d.data?.length) {
          const cleaned = d.data.map((b) => ({
            ...b,
            title: (b.title || "")
              .replace(/beautys/gi, "Beauty")
              .replace(/beauty,/gi, "Beauty —"),
          }));
          setSlides(cleaned);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(
      () => setActive((x) => (x + 1) % slides.length),
      5000
    );
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[active] || fallback[0];
  const hasImage = slide.image && !String(slide.image).includes("elores-logo");

  const cleanTitle = (slide.title || "")
    .replace(/beautys/gi, "Beauty")
    .replace(/beauty,/gi, "Beauty —");

  return (
    <section className="hero compactHero">
      {hasImage ? (
        <img
          className="heroBg"
          src={slide.image}
          alt={cleanTitle}
          fetchPriority="high"
        />
      ) : (
        <div className="heroJewels" aria-hidden="true">
          <span className="jewel j1">◇</span>
          <span className="jewel j2">✦</span>
          <span className="jewel j3">◯</span>
          <span className="jewel j4">⌁</span>
          <div className="ringGlow" />
        </div>
      )}
      <div className="heroOverlay" />
      <div className="heroText">
        <small>ELORES SIGNATURE</small>
        <h1>{cleanTitle}</h1>
        {slide.subtitle && <p>{slide.subtitle}</p>}
        <Link className="btn dark" to={slide.button_url || "/shop"}>
          {slide.button_text || "EXPLORE CATALOGUE"}
        </Link>
      </div>
      {slides.length > 1 && (
        <>
          <button
            aria-label="Previous slide"
            className="heroArrow prev"
            onClick={() =>
              setActive((active - 1 + slides.length) % slides.length)
            }
          >
            <ChevronLeft />
          </button>
          <button
            aria-label="Next slide"
            className="heroArrow next"
            onClick={() => setActive((active + 1) % slides.length)}
          >
            <ChevronRight />
          </button>
          <div className="heroDots">
            {slides.map((_, i) => (
              <button
                aria-label={`Go to slide ${i + 1}`}
                key={i}
                className={i === active ? "active" : ""}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
function ProductCard({ product: p }) {
  const { addCart, toggleWish, wishlist } = useStore();
  const [imgError, setImgError] = useState(false);

  const isWishlisted = wishlist.some(
    (item) => Number(item.id) === Number(p.id)
  );

  const price = Number(p.sale_price || p.price || 0);
  const originalPrice = Number(p.price || 0);
  const hasDiscount = Boolean(p.sale_price && Number(p.sale_price) < originalPrice);
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <article className="productCard">
      <div className="productImageContainer">
        <Link to={`/product/${p.slug}`} className="productImageWrap">
          {p.image && !imgError ? (
            <img
              src={p.image}
              alt={p.name || "Elores jewellery"}
              className="productPhoto"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <JewelleryVisual
              type={p.category_name}
              seed={p.id}
            />
          )}

          {discountPercent > 0 ? (
            <span className="saleBadge">SAVE {discountPercent}%</span>
          ) : p.badge ? (
            <span className="saleBadge badgePromo">{p.badge}</span>
          ) : null}
        </Link>

        <button
          type="button"
          className={`wishBtn ${isWishlisted ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWish(p);
          }}
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        <div className="cardHoverAction">
          <button
            type="button"
            className="quickAddBtn"
            disabled={Number(p.stock) <= 0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addCart(p, 1);
            }}
          >
            {Number(p.stock) > 0 ? "ADD TO CART" : "OUT OF STOCK"}
          </button>
        </div>
      </div>

      <div className="productCardBody">
        {p.category_name && (
          <small className="productCategory">{p.category_name}</small>
        )}

        <Link to={`/product/${p.slug}`} className="productName">
          {p.name}
        </Link>

        <div className="productPrice">
          <strong className="currentPrice">{money(price)}</strong>
          {hasDiscount && (
            <s className="oldPrice">{money(originalPrice)}</s>
          )}
          {discountPercent > 0 && (
            <span className="discountTag">({discountPercent}% OFF)</span>
          )}
        </div>

        <button
          type="button"
          className="mobileAddBtn"
          disabled={Number(p.stock) <= 0}
          onClick={(e) => {
            e.preventDefault();
            addCart(p, 1);
          }}
        >
          {Number(p.stock) > 0 ? "ADD TO BAG" : "OUT OF STOCK"}
        </button>
      </div>
    </article>
  );
}

function ProductGrid({ products = [] }) {
  if (!products.length) {
    return (
      <div className="emptyState">
        <p>No products found.</p>
      </div>
    );
  }

  return (
    <div className="productGrid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
function SectionHead({ kicker, title, link }) {
  return (
    <div className="sectionHead">
      <div className="sectionHeadText">
        {kicker && <small className="sectionKicker">{kicker}</small>}
        <h2 className="sectionTitle">{title}</h2>
      </div>
      {link && (
        <Link to={link} className="sectionLink">
          <span>EXPLORE ALL</span>
          <ChevronRight size={15} />
        </Link>
      )}
    </div>
  );
}
function JewelleryVisual({ type = "Jewellery", seed = 1 }) {
  return (
    <div className={`visual v${Number(seed) % 4}`}>
      <div className="visualMark">
        {String(type).toLowerCase().includes("ring")
          ? "◉"
          : String(type).toLowerCase().includes("ear")
            ? "✧"
            : String(type).toLowerCase().includes("brace")
              ? "⌁"
              : "◇"}
      </div>
      <span>ELORES</span>
    </div>
  );
}
function SearchBox({ q, setQ }) {
  const [sugs, setSugs] = useState([]);
  useEffect(() => {
    const t = setTimeout(
      () =>
        q.length > 1
          ? api("/search/suggestions?q=" + encodeURIComponent(q))
            .then((d) => setSugs(d.data || []))
            .catch(() => { })
          : setSugs([]),
      250,
    );
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div className="searchWrap">
      <div className="searchbox">
        <Search size={18} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search jewellery..."
        />
      </div>
      {sugs.length > 0 && (
        <div className="suggestions">
          {sugs.map((s) => (
            <Link
              key={s.slug}
              to={`/product/${s.slug}`}
              onClick={() => setSugs([])}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
function Spec({ label, value }) {
  return value ? (
    <div className="accord">
      <b>{label}</b>
      <span>{value}</span>
    </div>
  ) : null;
}
function Reviews({ product }) {
  const [rows, setRows] = useState([]),
    [meta, setMeta] = useState({ average: 0, count: 0 }),
    [f, setF] = useState({
      name: "",
      email: "",
      rating: 5,
      title: "",
      review: "",
      image: "",
    }),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false);
  const toast = useToast();
  const load = () =>
    api(`/products/${product.id}/reviews`).then((d) => {
      setRows(d.data || []);
      setMeta(d);
    });
  useEffect(() => {
    load().catch(() => { });
  }, [product.id]);
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.show("Review image must be 2MB or smaller", "error");
      e.target.value = "";
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const d = await api("/reviews/upload", { method: "POST", body: fd });
      setF((x) => ({ ...x, image: d.url }));
      toast.show("Review image uploaded");
    } catch (x) {
      toast.show(x.message, "error");
    } finally {
      setBusy(false);
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    try {
      const d = await api(`/products/${product.id}/reviews`, {
        method: "POST",
        body: JSON.stringify(f),
      });
      setMsg(d.message);
      toast.show(d.message);
      setF({ ...f, title: "", review: "", image: "" });
    } catch (x) {
      setMsg(x.message);
      toast.show(x.message, "error");
    }
  };
  return (
    <section className="section reviews">
      <SectionHead
        kicker={`${meta.average || 0} / 5 · ${meta.count || 0} VERIFIED REVIEWS`}
        title="Customer reviews"
      />
      <div className="reviewGrid">
        <div>
          {rows.length ? (
            rows.map((r) => (
              <article className="review" key={r.id}>
                <div className="stars">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
                <h3>{r.title || "Elores customer"}</h3>
                <p>{r.review}</p>
                {r.image && (
                  <img
                    className="reviewImage"
                    src={r.image}
                    alt="Customer review"
                  />
                )}
                <small>{r.name}</small>
              </article>
            ))
          ) : (
            <p>
              No approved reviews yet. Be the first to share your experience.
            </p>
          )}
        </div>
        <form className="panel" onSubmit={submit}>
          <h2>Write a review</h2>
          {msg && <div className="notice">{msg}</div>}
          <Field label="Name" k="name" f={f} set={setF} />
          <Field label="Email" k="email" type="email" f={f} set={setF} />
          <label className="field">
            <span>Rating</span>
            <select
              value={f.rating}
              onChange={(e) => setF({ ...f, rating: Number(e.target.value) })}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <Field label="Title" k="title" f={f} set={setF} />
          <label className="field">
            <span>Review</span>
            <textarea
              required
              value={f.review}
              onChange={(e) => setF({ ...f, review: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Review image (optional, max 2MB)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={upload}
            />
            {f.image && (
              <img
                className="reviewPreview"
                src={f.image}
                alt="Review preview"
              />
            )}
            {busy && <small>Uploading…</small>}
          </label>
          <button className="btn dark full">SUBMIT REVIEW</button>
        </form>
      </div>
    </section>
  );
}
function RecentlyViewed() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("elores_recent") || "[]");
      setRows(stored);
    }
  }, []);
  return rows.length ? (
    <section className="section">
      <SectionHead kicker="SEEN RECENTLY" title="Recently viewed" />
      <ProductGrid products={rows.slice(0, 4)} />
    </section>
  ) : null;
}
function Empty({ text }) {
  return (
    <div className="empty">
      <Gem size={46} />
      <h2>{text}</h2>
      <Link className="btn dark" to="/shop">
        Explore jewellery
      </Link>
    </div>
  );
}
function Field({ label, k, type = "text", f, set, wide }) {
  return (
    <label className={"field " + (wide ? "wide" : "")}>
      <span>{label}</span>
      <input
        required
        type={type}
        value={f[k] ?? ""}
        onChange={(e) => set({ ...f, [k]: e.target.value })}
      />
    </label>
  );
}
function AuthShell({ title, children }) {
  return (
    <section className="authPage">
      <div className="authBrand">
        <img
          src="/elores-logo.png"
          alt="Elores"
          width="120"
          height="120"
          style={{ width: "120px", height: "120px", objectFit: "contain" }}
        />
        <h2>Timeless beauty, endless elegance.</h2>
      </div>
      <div className="authCard">
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  );
}
function Footer({ settings }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { openAuth } = useAuthModal();

  const sub = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const d = await api("/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMsg(d.message || "Thank you for subscribing to Elores Club!");
      toast.show(d.message || "Subscribed successfully!");
      setEmail("");
    } catch (x) {
      setMsg(x.message || "Failed to subscribe");
      toast.show(x.message || "Subscription failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="siteFooter">
      {/* 1. Top Luxury Trust Bar */}
      <div className="footerTrustBar">
        <div className="footerTrustWrap">
          <div className="footerTrustItem">
            <div className="trustIconWrap"><Sparkles size={18} /></div>
            <div>
              <strong>Anti-Tarnish Jewellery</strong>
              <p>Premium &amp; skin friendly finish</p>
            </div>
          </div>
          <div className="footerTrustItem">
            <div className="trustIconWrap"><Truck size={18} /></div>
            <div>
              <strong>Express Pan-India</strong>
              <p>Free shipping above ₹999</p>
            </div>
          </div>
          <div className="footerTrustItem">
            <div className="trustIconWrap"><RotateCcw size={18} /></div>
            <div>
              <strong>15-Day Easy Returns</strong>
              <p>Hassle-free exchange &amp; refund</p>
            </div>
          </div>
          <div className="footerTrustItem">
            <div className="trustIconWrap"><ShieldCheck size={18} /></div>
            <div>
              <strong>6-Month Warranty</strong>
              <p>Polish &amp; finish guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 4-Column Footer Grid */}
      <div className="footerMainGrid">
        {/* Brand Column */}
        <div className="footerBrandCol">
          <Link to="/" className="footerBrandLogo">
            <img
              src={settings.logo || "/elores-logo.png"}
              alt="Elores"
              width="46"
              height="46"
              style={{ width: "46px", height: "46px", objectFit: "contain" }}
              loading="lazy"
            />
            <span className="footerLogoText">ELORES</span>
          </Link>
          <p className="footerBrandDesc">
            Crafted for everyday luxury. Modern anti-tarnish fine jewellery designed to make every moment feel effortlessly elegant.
          </p>
          <div className="footerContactList">
            <a href={`mailto:${settings.support_email || "support@elores.in"}`} className="footerContactItem">
              <Mail size={15} /> <span>{settings.support_email || "support@elores.in"}</span>
            </a>
            <a href={`tel:${settings.support_phone || "+919999999999"}`} className="footerContactItem">
              <Phone size={15} /> <span>{settings.support_phone || "+91 99999 99999"}</span>
            </a>
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${String(settings.whatsapp).replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="footerWhatsappBtn"
              >
                Chat on WhatsApp ✦
              </a>
            )}
          </div>
        </div>

        {/* Collections */}
        <div className="footerNavCol">
          <h4 className="footerColHeading">COLLECTIONS</h4>
          <ul className="footerLinks">
            <li><Link to="/shop?category=Rings">Rings</Link></li>
            <li><Link to="/shop?category=Necklaces">Necklaces</Link></li>
            <li><Link to="/shop?category=Bracelets">Bracelets</Link></li>
            <li><Link to="/shop?category=Earrings">Earrings</Link></li>
            <li><Link to="/shop">Explore All Catalogue</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="footerNavCol">
          <h4 className="footerColHeading">CUSTOMER CARE</h4>
          <ul className="footerLinks">
            <li><Link to="/track-order">Track Your Order</Link></li>
            <li>
              <button
                type="button"
                className="footerInlineLink"
                onClick={() => {
                  if (typeof window !== "undefined" && localStorage.getItem("elores_customer_token")) {
                    window.location.href = "/account";
                  } else {
                    openAuth("login");
                  }
                }}
              >
                Sign In / My Account
              </button>
            </li>
            <li><Link to="/page/shipping">Shipping Policy</Link></li>
            <li><Link to="/page/returns">Returns &amp; Refunds</Link></li>
            <li><Link to="/page/care">Jewellery Care Guide</Link></li>
            <li><Link to="/page/faq">FAQs</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
          </ul>
        </div>

        {/* VIP Club / Newsletter */}
        <div className="footerNewsletterCol">
          <h4 className="footerColHeading">THE ELORES CLUB</h4>
          <p className="footerNewsletterText">
            Join the inner circle for private vault drops, styling ideas &amp; 10% off your first luxury order.
          </p>
          <form className="footerNewsletterForm" onSubmit={sub}>
            <div className="footerInputWrap">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
              />
              <button type="submit" disabled={loading}>
                {loading ? "..." : "JOIN"}
              </button>
            </div>
          </form>
          {msg && <p className="footerNewsMsg">{msg}</p>}

          <div className="footerSocialIcons">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="footerSocialIcon">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="footerSocialIcon">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.812C10.5 0 9 1.583 9 4.615V8z" /></svg>
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest" className="footerSocialIcon">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987 0-6.627-5.376-12-12-12z" /></svg>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal, Payment Badges & Copyright */}
      <div className="footerBottomBar">
        <div className="footerPaymentBadges">
          <span className="payBadge">UPI</span>
          <span className="payBadge">VISA</span>
          <span className="payBadge">MASTERCARD</span>
          <span className="payBadge">RUPAY</span>
          <span className="payBadge">NET BANKING</span>
          <span className="payBadge codBadge">COD AVAILABLE</span>
        </div>
        <div className="footerLegalRow">
          <Link to="/page/about">About Us</Link>
          <span>•</span>
          <Link to="/page/privacy">Privacy Policy</Link>
          <span>•</span>
          <Link to="/page/terms">Terms of Service</Link>
          <span>•</span>
          <span className="sslBadge">🔒 256-Bit SSL Encrypted Checkout</span>
        </div>
        <p className="footerCopyright">
          © {new Date().getFullYear()} ELORES JEWELLERY. All Rights Reserved. Designed for Everyday Elegance.
        </p>
      </div>
    </footer>
  );
}
export {
  api,
  money,
  sessionKey,
  ToastProvider,
  useToast,
  StoreProvider,
  useStore,
  SEO,
  StoreLayout,
  CartDrawer,
  Hero,
  ProductCard,
  ProductGrid,
  SectionHead,
  JewelleryVisual,
  SearchBox,
  Spec,
  Reviews,
  RecentlyViewed,
  Empty,
  Field,
  AuthShell,
};
