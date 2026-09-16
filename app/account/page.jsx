'use client';
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "@/app/_lib/router-compat";
import {
  api,
  Field,
  money,
  SEO,
  useToast,
} from "@/app/_components/StorefrontCore.jsx";

export default function AccountPage() {
  const nav = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null),
    [orders, setOrders] = useState([]),
    [addresses, setAddresses] = useState([]),
    [af, setAf] = useState({
      label: "Home",
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      is_default: 1,
    });
  const load = () => {
    api("/account")
      .then((d) => setUser(d.user))
      .catch(() => nav("/login"));
    api("/account/orders")
      .then((d) => setOrders(d.data || []))
      .catch(() => {});
    api("/account/addresses")
      .then((d) => setAddresses(d.data || []))
      .catch(() => {});
  };
  useEffect(() => {
    if (!localStorage.getItem("elores_customer_token")) nav("/login");
    else load();
  }, []);
  const saveAddress = async (e) => {
    e.preventDefault();
    await api("/account/addresses", {
      method: "POST",
      body: JSON.stringify(af),
    });
    toast.show("Address saved");
    setAf({ ...af, address: "", city: "", state: "", pincode: "" });
    load();
  };
  return (
    <section className="section">
      <SEO title="My Account | Elores" />
      <div className="sectionHead">
        <div>
          <small>MY ELORES</small>
          <h1>{user ? `Hello, ${user.name}` : "My account"}</h1>
        </div>
        <button
          className="btn light"
          onClick={() => {
            localStorage.removeItem("elores_customer_token");
            nav("/login");
          }}
        >
          Logout
        </button>
      </div>
      <div className="accountGrid">
        <div className="panel">
          <h2>My orders</h2>
          {orders.length ? (
            orders.map((o) => (
              <div className="rowline" key={o.id}>
                <b>{o.order_number}</b>
                <span>
                  {money(o.total)} · {o.status}
                  {o.tracking_number ? ` · ${o.tracking_number}` : ""} ·{" "}
                  <Link to={`/track-order?order=${o.order_number}`}>Track</Link>
                </span>
              </div>
            ))
          ) : (
            <p>No orders yet.</p>
          )}
        </div>
        <div className="panel">
          <h2>Saved addresses</h2>
          {addresses.map((a) => (
            <div className="addressCard" key={a.id}>
              <b>{a.label}</b>
              <p>
                {a.name}, {a.address}, {a.city}, {a.state} {a.pincode}
              </p>
            </div>
          ))}
          <form onSubmit={saveAddress}>
            <Field label="Label" k="label" f={af} set={setAf} />
            <Field label="Name" k="name" f={af} set={setAf} />
            <Field label="Phone" k="phone" f={af} set={setAf} />
            <Field label="Address" k="address" f={af} set={setAf} />
            <Field label="City" k="city" f={af} set={setAf} />
            <Field label="State" k="state" f={af} set={setAf} />
            <Field label="Pincode" k="pincode" f={af} set={setAf} />
            <button className="btn dark full">SAVE ADDRESS</button>
          </form>
        </div>
      </div>
    </section>
  );
}
