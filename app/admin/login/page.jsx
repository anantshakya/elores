'use client';
import { useState } from "react";
import { Navigate } from "@/app/_lib/router-compat.jsx";
import { useAdminAuth } from "@/app/admin/_components/AdminAuth.jsx";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";

export default function LoginPage() {
  const auth = useAdminAuth();
  const toast = useAdminToast();
  const [form, setForm] = useState({ email: "admin@elores.local", password: "Admin@123" });
  const [busy, setBusy] = useState(false);

  if (auth.user) return <Navigate to="/admin" replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await auth.login(form.email, form.password);
      toast.show("Welcome to Elores admin");
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adminLoginPage">
      <form className="adminLoginCard" onSubmit={submit}>
        <div className="loginMark">EL</div>
        <h1>Admin Sign In</h1>
        <p>Use your authorized Elores admin account.</p>
        <label>
          <span>Email</span>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          <span>Password</span>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <button className="primaryAction fullWidth" disabled={busy}>{busy ? "Signing in…" : "Sign In"}</button>
      </form>
    </div>
  );
}
