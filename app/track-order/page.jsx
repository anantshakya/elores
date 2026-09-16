'use client';
import React, { useState } from "react";
import { useLocation } from "@/app/_lib/router-compat";
import {
  api,
  Field,
  money,
  SEO,
} from "@/app/_components/StorefrontCore.jsx";

export default function TrackOrderPage() {
  const loc = useLocation();
  const pre = new URLSearchParams(loc.search).get("order") || "";
  const [f, setF] = useState({ order_number: pre, phone: "" }),
    [order, setOrder] = useState(null),
    [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOrder(null);
    try {
      const d = await api(
        `/orders/track?order_number=${encodeURIComponent(f.order_number)}&phone=${encodeURIComponent(f.phone)}`,
      );
      setOrder(d.data);
    } catch (x) {
      setErr(x.message);
    }
  };
  const stages = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered"];
  const idx = order ? stages.indexOf(order.status) : -1;
  return (
    <section className="section trackPage">
      <SEO title="Track Order | Elores" />
      <div className="shopTitle left">
        <small>ORDER STATUS</small>
        <h1>Track your order</h1>
      </div>
      <form className="trackForm" onSubmit={submit}>
        <Field label="Order number" k="order_number" f={f} set={setF} />
        <Field label="Phone number" k="phone" f={f} set={setF} />
        <button className="btn dark">TRACK ORDER</button>
      </form>
      {err && <div className="notice">{err}</div>}
      {order && (
        <div className="trackCard">
          <div className="trackHead">
            <div>
              <small>ORDER</small>
              <h2>{order.order_number}</h2>
            </div>
            <b>{money(order.total)}</b>
          </div>
          <div className="statusTrack">
            {stages.map((st, i) => (
              <div key={st} className={`trackStep ${i <= idx ? "done" : ""}`}>
                <span>{i < idx ? "✓" : i + 1}</span>
                <b>{st}</b>
              </div>
            ))}
          </div>
          {order.tracking_number && (
            <p>
              <b>Tracking:</b> {order.tracking_number}{" "}
              {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" rel="noreferrer">
                  Open courier tracking
                </a>
              )}
            </p>
          )}
          <div className="trackItems">
            {(order.items || []).map((x) => (
              <div key={x.id}>
                {x.product_name} × {x.qty}
                <b>{money(x.line_total)}</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
