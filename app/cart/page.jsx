'use client';
import React from "react";
import { useNavigate } from "@/app/_lib/router-compat";
import { Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import {
  Empty,
  JewelleryVisual,
  money,
  SEO,
  useStore,
} from "@/app/_components/StorefrontCore.jsx";

export default function CartPage() {
  const { cart, updateQty } = useStore();
  const nav = useNavigate();
  const subtotal = cart.reduce(
    (s, x) => s + Number(x.sale_price || x.price) * x.qty,
    0,
  );
  if (!cart.length)
    return (
      <section className="section">
        <div className="shopTitle">
          <h1>Your bag</h1>
        </div>
        <Empty text="Your bag is empty." />
      </section>
    );
  return (
    <section className="section cartPage">
      <SEO title="Shopping Bag | Elores" />
      <div>
        <div className="shopTitle left">
          <small>SHOPPING BAG</small>
          <h1>Your selections</h1>
        </div>
        {cart.map((x) => (
          <div className="cartItem" key={x.id}>
            <div className="mini">
              {x.image ? (
                <img
                  loading="lazy"
                  className="productPhoto"
                  src={x.image}
                  alt={x.name}
                />
              ) : (
                <JewelleryVisual type={x.category_name} seed={x.id} />
              )}
            </div>
            <div className="grow">
              <h3>{x.name}</h3>
              <p>{money(x.sale_price || x.price)}</p>
              <div className="qty small">
                <button onClick={() => updateQty(x.id, x.qty - 1)}>
                  <Minus />
                </button>
                <span>{x.qty}</span>
                <button onClick={() => updateQty(x.id, x.qty + 1)}>
                  <Plus />
                </button>
              </div>
            </div>
            <button
              aria-label="Remove item"
              className="icon"
              onClick={() => updateQty(x.id, 0)}
            >
              <Trash2 />
            </button>
          </div>
        ))}
      </div>
      <aside className="summary">
        <h2>Order summary</h2>
        <div>
          <span>Subtotal</span>
          <b>{money(subtotal)}</b>
        </div>
        <div>
          <span>Shipping</span>
          <b>{subtotal >= 999 ? "FREE" : money(99)}</b>
        </div>
        <hr />
        <div className="total">
          <span>Total</span>
          <b>{money(subtotal + (subtotal >= 999 ? 0 : 99))}</b>
        </div>
        <button className="btn dark full" onClick={() => nav("/checkout")}>
          CHECKOUT
        </button>
        <p>
          <ShieldCheck size={15} /> Secure checkout · COD available
        </p>
      </aside>
    </section>
  );
}
