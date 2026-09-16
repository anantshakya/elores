'use client';
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { adminApi } from "@/app/admin/_lib/api.js";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [state, setState] = useState({ user: null, permissions: {}, loading: true });

  useEffect(() => {
    const token = localStorage.getItem("elores_admin_token");
    if (!token) {
      setState({ user: null, permissions: {}, loading: false });
      return;
    }
    adminApi("/admin/me")
      .then((data) => setState({ user: data.user, permissions: data.permissions || {}, loading: false }))
      .catch(() => {
        localStorage.removeItem("elores_admin_token");
        setState({ user: null, permissions: {}, loading: false });
      });
  }, []);

  const value = useMemo(() => ({
    ...state,
    async login(email, password) {
      const data = await adminApi("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("elores_admin_token", data.token);
      setState({ user: data.user, permissions: data.permissions || {}, loading: false });
      return data;
    },
    logout() {
      localStorage.removeItem("elores_admin_token");
      setState({ user: null, permissions: {}, loading: false });
    },
    async refresh() {
      const data = await adminApi("/admin/me");
      setState({ user: data.user, permissions: data.permissions || {}, loading: false });
    },
  }), [state]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export const useAdminAuth = () => useContext(AdminAuthContext);
