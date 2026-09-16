'use client';
import React, { useEffect, useState } from "react";
import { useNavigate } from "@/app/_lib/router-compat";
import {
  api,
  Field,
  money,
  SEO,
  sessionKey,
  useStore,
  useToast,
} from "@/app/_components/StorefrontCore.jsx";

export default function CheckoutPage() {
  const { cart, setCart } = useStore();
  const nav = useNavigate();
  const [form, setForm] = useState({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      payment_method: "COD",
    }),
    [addresses, setAddresses] = useState([]),
    [coupon, setCoupon] = useState(""),
    [discount, setDiscount] = useState(0),
    [err, setErr] = useState(""),
    [pinBusy, setPinBusy] = useState(false),
    [placing, setPlacing] = useState(false);
  const toast = useToast();
  const subtotal = cart.reduce(
      (sum, x) => sum + Number(x.sale_price || x.price) * x.qty,
      0,
    ),
    shipping = subtotal >= 999 ? 0 : 99,
    total = Math.max(0, subtotal + shipping - discount);
  useEffect(() => {
    if (localStorage.getItem("elores_customer_token"))
      api("/account/addresses")
        .then((d) => setAddresses(d.data || []))
        .catch(() => {});
  }, []);
  useEffect(() => {
    if (!/^\d{6}$/.test(form.pincode)) return;
    let alive = true;
    setPinBusy(true);
    fetch(`https://api.postalpincode.in/pincode/${form.pincode}`)
      .then((r) => r.json())
      .then((d) => {
        const po = d?.[0]?.PostOffice?.[0];
        if (alive && po)
          setForm((f) => ({
            ...f,
            city: po.District || po.Block || f.city,
            state: po.State || f.state,
          }));
      })
      .catch(() => {})
      .finally(() => alive && setPinBusy(false));
    return () => {
      alive = false;
    };
  }, [form.pincode]);
  const selectAddress = (a) =>
    setForm((f) => ({
      ...f,
      name: a.name,
      phone: a.phone,
      address: a.address,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
    }));
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!cart.length) return setErr("Your cart is empty");
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "")))
      return setErr("Enter a valid 10-digit phone number");
    if (!/^\d{6}$/.test(form.pincode))
      return setErr("Enter a valid 6-digit pincode");
    setPlacing(true);
    try {
      if (coupon.trim()) {
        const c = await api("/coupon/validate", {
          method: "POST",
          body: JSON.stringify({ code: coupon, subtotal }),
        });
        setDiscount(Number(c.discount || 0));
        toast.show(`Coupon ${coupon} applied`);
      }
      const d = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          coupon_code: coupon.trim(),
          session_key: sessionKey(),
          items: cart.map((x) => ({ product_id: x.id, qty: x.qty })),
        }),
      });
      setCart([]);
      toast.show("Order placed successfully");
      nav("/order-success/" + d.order_number);
    } catch (ex) {
      setErr(ex.message);
      toast.show(ex.message, "error");
    } finally {
      setPlacing(false);
    }
  };
  return (
    <section className="checkout">
      <SEO title="Checkout | Elores" />
      <form onSubmit={submit}>
        <small>SECURE CHECKOUT</small>
        <h1>Delivery details</h1>
        {addresses.length > 0 && (
          <div className="savedAddresses">
            <b>Saved addresses</b>
            {addresses.map((a) => (
              <button type="button" key={a.id} onClick={() => selectAddress(a)}>
                {a.label}: {a.city}
              </button>
            ))}
          </div>
        )}
        {err && <div className="notice">{err}</div>}
        <div className="formgrid">
          <Field label="Full name" k="name" f={form} set={setForm} />
          <Field label="Email" k="email" type="email" f={form} set={setForm} />
          <Field label="Phone" k="phone" f={form} set={setForm} />
          <label className="field">
            <span>Pincode</span>
            <input
              required
              value={form.pincode}
              maxLength="6"
              inputMode="numeric"
              onChange={(e) =>
                setForm({
                  ...form,
                  pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                })
              }
            />
            {pinBusy && <small>Finding city & state…</small>}
          </label>
          <Field label="Address" k="address" f={form} set={setForm} wide />
          <Field label="City" k="city" f={form} set={setForm} />
          <Field label="State" k="state" f={form} set={setForm} />
        </div>
        <div className="couponBox">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="Coupon code (applies on Place Order)"
          />
        </div>
        <label className="field wide">
          <span>Payment method</span>
          <select
            value={form.payment_method}
            onChange={(e) =>
              setForm({ ...form, payment_method: e.target.value })
            }
          >
            <option value="COD">Cash on Delivery</option>
            <option value="PREPAID">Prepaid (gateway-ready demo)</option>
          </select>
        </label>
        <div className="checkoutTotals">
          <span>Subtotal {money(subtotal)}</span>
          <span>Shipping {shipping ? money(shipping) : "FREE"}</span>
          {discount > 0 && <span>Discount -{money(discount)}</span>}
        </div>
        <button className="btn dark full" disabled={placing}>
          {placing ? "PLACING ORDER…" : `PLACE ORDER · ${money(total)}`}
        </button>
      </form>
      <aside className="checkoutArt">
        <span>EL</span>
        <h2>Wrapped with care.</h2>
        <p>
          Every Elores order arrives gift-ready with secure checkout messaging.
        </p>
      </aside>
    </section>
  );
}
