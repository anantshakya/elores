'use client';
import React, { useState } from "react";
import { Link, useNavigate } from "@/app/_lib/router-compat";
import {
  api,
  AuthShell,
  Field,
  SEO,
} from "@/app/_components/StorefrontCore.jsx";

export default function LoginPage() {
  const nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "" }),
    [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      const d = await api("/login", {
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
    <AuthShell title="Customer login">
      <SEO title="Login | Elores" />
      <form onSubmit={submit}>
        {err && <div className="error">{err}</div>}
        <Field label="Email" k="email" type="email" f={f} set={setF} />
        <Field label="Password" k="password" type="password" f={f} set={setF} />
        <button className="btn dark full">LOGIN</button>
        <p>
          <Link to="/forgot-password">Forgot password?</Link> ·{" "}
          <Link to="/register">Create account</Link>
        </p>
      </form>
    </AuthShell>
  );
}
