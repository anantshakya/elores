'use client';
import React, { useState } from "react";
import {
  api,
  Field,
  SEO,
} from "@/app/_components/StorefrontCore.jsx";

export default function ContactPage() {
  const [f, setF] = useState({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    }),
    [msg, setMsg] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      const d = await api("/contact", {
        method: "POST",
        body: JSON.stringify(f),
      });
      setMsg(d.message);
      setF({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (x) {
      setMsg(x.message);
    }
  };
  return (
    <section className="section contact">
      <SEO
        title="Contact Elores"
        description="Contact Elores customer support."
      />
      <div>
        <small>WE ARE HERE TO HELP</small>
        <h1>Contact us</h1>
        <p>Questions about jewellery, orders or returns? Send us a message.</p>
      </div>
      <form className="panel" onSubmit={submit}>
        {msg && <div className="notice">{msg}</div>}
        <Field label="Name" k="name" f={f} set={setF} />
        <Field label="Email" k="email" type="email" f={f} set={setF} />
        <Field label="Phone" k="phone" f={f} set={setF} />
        <Field label="Subject" k="subject" f={f} set={setF} />
        <label className="field">
          <span>Message</span>
          <textarea
            required
            value={f.message}
            onChange={(e) => setF({ ...f, message: e.target.value })}
          />
        </label>
        <button className="btn dark full">SEND MESSAGE</button>
      </form>
    </section>
  );
}
