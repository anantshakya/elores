'use client';
import {
  BarChart3,
  FileText,
  Gem,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  Tags,
  TicketPercent,
  UserCog,
  Users,
  ShoppingBag,
  UserCircle2,
} from "lucide-react";
import { NavLink, Outlet, Link } from "@/app/_lib/router-compat.jsx";
import { useAdminAuth } from "@/app/admin/_components/AdminAuth.jsx";
import { visibleMenu } from "@/app/admin/_lib/permissions.js";
import { adminApi } from "@/app/admin/_lib/api.js";
import { useState, useRef, useEffect } from "react";

const menu = [
  ["dashboard", "/admin", "Dashboard", LayoutDashboard],
  ["analytics", "/admin/analytics", "Analytics", BarChart3],
  ["products", "/admin/products", "Products", Gem],
  ["categories", "/admin/categories", "Categories", Tags],
  ["orders", "/admin/orders", "Orders", ShoppingBag],
  ["customers", "/admin/customers", "Customers", Users],
  ["carousel", "/admin/carousel", "Carousel", ImageIcon],
  ["coupons", "/admin/coupons", "Coupons", TicketPercent],
  ["reviews", "/admin/reviews", "Reviews", Star],
  ["pages", "/admin/pages", "Pages", FileText],
  ["messages", "/admin/messages", "Messages", MessageSquare],
  ["settings", "/admin/settings", "Settings", Settings],
  ["admin_users", "/admin/users", "Admin Users", UserCog],
];

function ProfileDropdown({ auth }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = (auth.user?.name || "A")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="topbarDropdownWrap" ref={ref}>
      <button
        className="topbarAvatarBtn"
        onClick={() => setOpen((o) => !o)}
        type="button"
        title={auth.user?.name || "Profile"}
      >
        <span className="topbarAvatarInitials">{initials}</span>
        <div className="topbarAvatarInfo">
          <strong>{auth.user?.name || "Admin"}</strong>
          <small>{auth.user?.role?.replaceAll("_", " ")}</small>
        </div>
      </button>

      {open && (
        <div className="topbarDropdown">
          <Link
            className="topbarDropdownItem"
            to="/admin/profile"
            onClick={() => setOpen(false)}
          >
            <UserCircle2 size={15} /> My Profile
          </Link>
          <div className="topbarDropdownDivider" />
          <button
            className="topbarDropdownItem danger"
            onClick={() => { setOpen(false); auth.logout(); }}
            type="button"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ children }) {
  const auth = useAdminAuth();
  const [settings, setSettings] = useState({ logo: "/elores-logo.png" });

  useEffect(() => {
    try {
      const cached = localStorage.getItem("elores_cached_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.logo) setSettings((s) => ({ ...s, logo: parsed.logo }));
      }
    } catch (e) {}

    adminApi("/settings")
      .then((d) => {
        if (d?.data?.logo) {
          setSettings((prev) => ({ ...prev, logo: d.data.logo }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="adminApp">
      <aside className="adminSidebar">
        <Link className="adminBrand" to="/admin" style={{ textDecoration: "none" }}>
          <img
            src={settings.logo || "/elores-logo.png"}
            alt="Elores Admin Logo"
            style={{ height: "38px", maxHeight: "42px", width: "auto", maxWidth: "165px", objectFit: "contain" }}
            onError={(e) => {
              e.target.src = "/elores-logo.png";
            }}
          />
        </Link>
        <nav>
          {menu.filter(([module]) => visibleMenu(auth, module)).map(([module, to, label, Icon]) => (
            <NavLink key={module} to={to} end={to === "/admin"}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <header className="adminTopbarNew">
        <div>
          <strong>Elores Control Center</strong>
          <small>Manage catalogue, orders and store operations</small>
        </div>
        <ProfileDropdown auth={auth} />
      </header>

      <main className="adminContent">
        {children}
      </main>
    </div>
  );
}
