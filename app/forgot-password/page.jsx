'use client';
import React, { useState } from "react";
import { useNavigate } from "@/app/_lib/router-compat";
import {
  api,
  AuthShell,
  Field,
  SEO,
} from "@/app/_components/StorefrontCore.jsx";

export default function ForgotPasswordPage() {
  const nav = useNavigate();
  const [step, setStep] = useState(1),
    [f, setF] = useState({ email: "", otp: "123456", password: "" }),
    [msg, setMsg] = useState("");
  const send = async (e) => {
    e.preventDefault();
    await api("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: f.email }),
    });
    setMsg("Demo OTP: 123456");
    setStep(2);
  };
  const reset = async (e) => {
    e.preventDefault();
    try {
      await api("/reset-password", { method: "POST", body: JSON.stringify(f) });
      nav("/login");
    } catch (x) {
      setMsg(x.message);
    }
  };
  return (
    <AuthShell title="Forgot password">
      <SEO title="Forgot Password | Elores" />
      {msg && <div className="notice">{msg}</div>}
      {step === 1 ? (
        <form onSubmit={send}>
          <Field
            label="Registered email"
            k="email"
            type="email"
            f={f}
            set={setF}
          />
          <button className="btn dark full">SEND OTP</button>
        </form>
      ) : (
        <form onSubmit={reset}>
          <Field label="OTP" k="otp" f={f} set={setF} />
          <Field
            label="New password"
            k="password"
            type="password"
            f={f}
            set={setF}
          />
          <button className="btn dark full">RESET PASSWORD</button>
        </form>
      )}
    </AuthShell>
  );
}
