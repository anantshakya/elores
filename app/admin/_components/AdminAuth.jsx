'use client';

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { adminApi } from "@/app/admin/_lib/api.js";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [state, setState] = useState({ user: null, permissions: {}, loading: true });

  useEffect(() => {
    const token =
      (typeof window !== "undefined"
        ? localStorage.getItem("elores_admin_token") || sessionStorage.getItem("elores_admin_token")
        : null);

    if (!token) {
      setState({ user: null, permissions: {}, loading: false });
      return;
    }

    // Verify token with backend session
    adminApi("/admin/me")
      .then((data) => {
        if (data && data.user) {
          setState({ user: data.user, permissions: data.permissions || {}, loading: false });
        } else {
          throw new Error("Invalid session data");
        }
      })
      .catch(() => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("elores_admin_token");
          sessionStorage.removeItem("elores_admin_token");
          document.cookie = "elores_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        setState({ user: null, permissions: {}, loading: false });
      });
  }, []);

  const value = useMemo(() => ({
    ...state,
    async login(email, password, remember = true) {
      const data = await adminApi("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!data.token) {
        throw new Error("Authentication failed: No token received");
      }

      if (typeof window !== "undefined") {
        if (remember) {
          localStorage.setItem("elores_admin_token", data.token);
        } else {
          sessionStorage.setItem("elores_admin_token", data.token);
          localStorage.removeItem("elores_admin_token");
        }
        document.cookie = `elores_admin_session=1; path=/; max-age=${remember ? 86400 * 30 : 86400}; SameSite=Lax`;
      }

      setState({ user: data.user, permissions: data.permissions || {}, loading: false });
      return data;
    },
    logout() {
      if (typeof window !== "undefined") {
        localStorage.removeItem("elores_admin_token");
        sessionStorage.removeItem("elores_admin_token");
        document.cookie = "elores_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      setState({ user: null, permissions: {}, loading: false });
      if (typeof window !== "undefined") {
        window.location.replace("/admin/login");
      }
    },
    async refresh() {
      const data = await adminApi("/admin/me");
      setState({ user: data.user, permissions: data.permissions || {}, loading: false });
    },
  }), [state]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export const useAdminAuth = () => useContext(AdminAuthContext);
