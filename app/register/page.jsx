'use client';
import React, { useState } from "react";
import { Link, useNavigate } from "@/app/_lib/router-compat";
import {
  api,
  AuthShell,
  Field,
  SEO,
} from "@/app/_components/StorefrontCore.jsx";

export default function RegisterPage() {
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" }),
    [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      const d = await api("/register", {
        method: "POST",
        body: JSON.stringify(f),
      });
      localStorage.setItem("elores_customer_token", d.token);
      nav("/account");
    } catch (x) {
      setErr(x.message);
    }
  };
  return (
    <AuthShell title="Create your Elores account">
      <SEO title="Register | Elores" />
      <form onSubmit={submit}>
        {err && <div className="error">{err}</div>}
        <Field label="Name" k="name" f={f} set={setF} />
        <Field label="Email" k="email" type="email" f={f} set={setF} />
        <Field label="Phone" k="phone" f={f} set={setF} />
        <Field label="Password" k="password" type="password" f={f} set={setF} />
        <button className="btn dark full">REGISTER</button>
        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </AuthShell>
  );
}
