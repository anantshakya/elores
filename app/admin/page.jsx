'use client';
import { useEffect, useState } from "react";
import { IndianRupee, Package, ShoppingCart, Clock3 } from "lucide-react";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import { adminApi, money } from "@/app/admin/_lib/api.js";

export default function DashboardPage() {
  const [data, setData] = useState({ products: 0, orders: 0, revenue: 0, pending_orders: 0 });
  useEffect(() => { adminApi("/admin/dashboard").then(setData).catch(() => {}); }, []);
  const cards = [
    [Package, data.products, "Products"],
    [ShoppingCart, data.orders, "Orders"],
    [IndianRupee, money(data.revenue), "Revenue"],
    [Clock3, data.pending_orders, "Pending Orders"],
  ];
  return (
    <>
      <PageHeader title="Dashboard" subtitle="A quick overview of your store." />
      <div className="statGrid">
        {cards.map(([Icon, value, label]) => (
          <article className="statCard" key={label}>
            <Icon />
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
    </>
  );
}
