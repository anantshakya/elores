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
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
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
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const api = async (path, options = {}) => {
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
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};
const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const StoreCtx = createContext();
const ToastCtx = createContext({ show: () => {} });
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
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("elores_cart") || "[]");
    }
    return [];
  });
  const [wishlist, setWishlist] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("elores_wishlist") || "[]");
    }
    return [];
  });
  useEffect(
    () => localStorage.setItem("elores_cart", JSON.stringify(cart)),
    [cart],
  );
  useEffect(
    () => localStorage.setItem("elores_wishlist", JSON.stringify(wishlist)),
    [wishlist],
  );
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
          }).catch(() => {}),
        800,
      );
      return () => clearTimeout(t);
    }
  }, [cart]);
  const addCart = (p, qty = 1) =>
    setCart((c) => {
      const hit = c.find((x) => x.id === p.id);
      return hit
        ? c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + qty } : x))
        : [...c, { ...p, qty }];
    });
  const updateQty = (id, qty) =>
    setCart((c) =>
      qty <= 0
        ? c.filter((x) => x.id !== id)
        : c.map((x) => (x.id === id ? { ...x, qty } : x)),
    );
  const toggleWish = (p) =>
    setWishlist((w) =>
      w.some((x) => x.id === p.id) ? w.filter((x) => x.id !== p.id) : [...w, p],
    );
  return (
    <StoreCtx.Provider
      value={{
        cart,
        wishlist,
        addCart,
        updateQty,
        toggleWish,
        setCart,
        cartCount: cart.reduce((s, x) => s + x.qty, 0),
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
    }).catch(() => {});
    return () => script.remove();
  }, [title, description, image, type, loc.pathname]);
  return null;
}


function StoreLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState({
    logo: "/elores-logo.png",
    announcement:
      "FREE SHIPPING ABOVE ₹999 • COD AVAILABLE • EASY 7-DAY RETURNS",
  });
  const { cartCount, wishlist } = useStore();
  useEffect(() => {
    setMounted(true);
    api("/settings")
      .then((d) => setSettings((s) => ({ ...s, ...d.data })))
      .catch(() => {});
  }, []);
  return (
    <>
      <div className="offerbar">{settings.announcement}</div>
      <header>
        <div className="navwrap">
          <button
            aria-label="Toggle menu"
            className="icon mobile"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <Link className="logo logoImg" to="/">
            <img src={settings.logo || "/elores-logo.png"} alt="Elores logo" />
          </Link>
          <nav className={open ? "open" : ""} onClick={() => setOpen(false)}>
            <NavLink to="/shop?gender=Women">FOR HER</NavLink>
            <NavLink to="/shop?gender=Men">FOR HIM</NavLink>
            <NavLink to="/shop?category=Rings">RINGS</NavLink>
            <NavLink to="/shop?category=Necklaces">NECKLACES</NavLink>
            <NavLink to="/shop?category=Bracelets">BRACELETS</NavLink>
            <NavLink to="/shop">ALL JEWELLERY</NavLink>
          </nav>
          <div className="actions">
            <Link aria-label="Search" to="/shop">
              <Search />
            </Link>
            <Link aria-label="Wishlist" to="/wishlist">
              <Heart />
              {mounted && wishlist.length > 0 && <b>{wishlist.length}</b>}
            </Link>
            <Link aria-label="Account" to="/account">
              <User />
            </Link>
            <Link aria-label="Cart" to="/cart">
              <ShoppingBag />
              {mounted && cartCount > 0 && <b>{cartCount}</b>}
            </Link>
          </div>
        </div>
      </header>
      <main>
        {children || <Outlet />}
      </main>
      <Footer settings={settings} />
      {settings.whatsapp && (
        <a
          className="whatsapp"
          href={`https://wa.me/${String(settings.whatsapp).replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      )}
    </>
  );
}

function Hero() {
  const fallback = [
    {
      title: "Timeless beauty, everyday elegance",
      subtitle: "Modern jewellery designed to make every day feel special.",
      image: "",
      button_text: "SHOP NOW",
      button_url: "/shop",
    },
  ];
  const [slides, setSlides] = useState(fallback),
    [active, setActive] = useState(0);
  useEffect(() => {
    api("/banners")
      .then((d) => d.data?.length && setSlides(d.data))
      .catch(() => {});
  }, []);
  useEffect(() => {
    const t = setInterval(
      () => setActive((x) => (x + 1) % slides.length),
      5000,
    );
    return () => clearInterval(t);
  }, [slides.length]);
  const slide = slides[active] || fallback[0];
  const hasImage = slide.image && !String(slide.image).includes("elores-logo");
  return (
    <section className="hero compactHero">
      {hasImage ? (
        <img
          className="heroBg"
          src={slide.image}
          alt={slide.title}
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
        <h1>{slide.title}</h1>
        <p>{slide.subtitle}</p>
        <Link className="btn dark" to={slide.button_url || "/shop"}>
          {slide.button_text || "SHOP NOW"}
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

  const isWishlisted = wishlist.some(
    (item) => Number(item.id) === Number(p.id)
  );

  const price = Number(p.sale_price || p.price || 0);
  const originalPrice = Number(p.price || 0);

  return (
    <article className="productCard">

      <Link to={`/product/${p.slug}`} className="productImageWrap">
        {p.image ? (
          <img
            src={p.image}
            alt={p.name || "Elores jewellery"}
            className="productPhoto"
            loading="lazy"
          />
        ) : (
          <JewelleryVisual
            type={p.category_name}
            seed={p.id}
          />
        )}

        {p.sale_price && Number(p.sale_price) < Number(p.price) && (
          <span className="saleBadge">SALE</span>
        )}
      </Link>

      <button
        type="button"
        className={`wishBtn ${isWishlisted ? "active" : ""}`}
        onClick={() => toggleWish(p)}
        aria-label="Add to wishlist"
      >
        <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      <div className="productCardBody">
        {p.category_name && (
          <small className="productCategory">{p.category_name}</small>
        )}

        <Link to={`/product/${p.slug}`} className="productName">
          {p.name}
        </Link>

        <div className="productPrice">
          <strong>{money(price)}</strong>

          {p.sale_price && Number(p.sale_price) < originalPrice && (
            <s>{money(originalPrice)}</s>
          )}
        </div>

        <button
          type="button"
          className="btn dark full"
          disabled={Number(p.stock) <= 0}
          onClick={() => addCart(p, 1)}
        >
          {Number(p.stock) > 0 ? "ADD TO CART" : "OUT OF STOCK"}
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
      <div>
        <small>{kicker}</small>
        <h2>{title}</h2>
      </div>
      {link && (
        <Link to={link}>
          Explore all <ChevronRight size={16} />
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
              .catch(() => {})
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
    load().catch(() => {});
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
        <img src="/elores-logo.png" alt="Elores" />
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
  const [email, setEmail] = useState(""),
    [msg, setMsg] = useState("");
  const toast = useToast();
  const sub = async (e) => {
    e.preventDefault();
    try {
      const d = await api("/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMsg(d.message);
      toast.show(d.message);
      setEmail("");
    } catch (x) {
      setMsg(x.message);
      toast.show(x.message, "error");
    }
  };
  return (
    <footer className="siteFooter">
      <div className="footerBrand">
        <div className="footerLogo">
          <img src={settings.logo || "/elores-logo.png"} alt="Elores" />
        </div>
        <p>
          Modern jewellery made for everyday elegance, gifting and effortless
          styling.
        </p>
        <div className="footerContact">
          <span>
            <Mail /> {settings.support_email || "support@elores.in"}
          </span>
          <span>
            <Phone /> {settings.support_phone || "+91 99999 99999"}
          </span>
        </div>
      </div>
      <div>
        <h4>SHOP</h4>
        <Link to="/shop?gender=Women">For Her</Link>
        <Link to="/shop?gender=Men">For Him</Link>
        <Link to="/shop">All Jewellery</Link>
        <Link to="/wishlist">Wishlist</Link>
        <Link to="/track-order">Track Order</Link>
      </div>
      <div>
        <h4>HELP</h4>
        <Link to="/page/shipping">Shipping</Link>
        <Link to="/page/returns">Returns & Refunds</Link>
        <Link to="/page/care">Care Guide</Link>
        <Link to="/page/faq">FAQ</Link>
        <Link to="/contact">Contact Us</Link>
      </div>
      <div>
        <h4>STAY IN THE LOOP</h4>
        <p>New drops, styling ideas and member-only offers.</p>
        <form className="newsletter" onSubmit={sub}>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
          />
          <button>JOIN</button>
        </form>
        {msg && <small>{msg}</small>}
        <div className="footerLegal">
          <Link to="/page/about">About Us</Link>
          <Link to="/page/privacy">Privacy</Link>
          <Link to="/page/terms">Terms</Link>
        </div>
      </div>
      <p className="copy">
        © 2026 Elores · Secure shopping · Easy returns · Pan-India delivery
      </p>
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
