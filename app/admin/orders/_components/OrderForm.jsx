'use client';

import { useEffect, useState, useMemo } from "react";
import { usePathname, useSearchParams, useParams, useRouter } from "next/navigation";
import { FileText, Truck, CreditCard, User, MapPin, Package, ArrowLeft, CheckCircle2 } from "lucide-react";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import { adminApi, money } from "@/app/admin/_lib/api.js";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";
import { Link } from "@/app/_lib/router-compat.jsx";

const statusOptions = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
];

const paymentStatusOptions = [
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
];

export default function OrderForm({ id: propId }) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const toast = useAdminToast();

  // Resolve Order ID from props, route params, query string, or pathname
  const resolvedId = useMemo(() => {
    if (propId) return String(propId);
    if (routeParams?.id) return String(routeParams.id);
    if (searchParams && searchParams.get("id")) return String(searchParams.get("id"));

    const match = pathname.match(/\/admin\/orders?(?:\/edit)?\/(\d+)(?:\/edit)?/);
    if (match && match[1]) return String(match[1]);

    return null;
  }, [propId, routeParams, searchParams, pathname]);

  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({
    status: "Pending",
    payment_status: "Pending",
    tracking_number: "",
    tracking_url: "",
  });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(resolvedId));
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    let active = true;

    if (resolvedId) {
      setLoading(true);
      // Try direct show endpoint first
      adminApi(`/admin/orders/${resolvedId}`)
        .then((res) => {
          if (!active) return;
          if (res?.data) {
            const o = res.data;
            setOrder(o);
            setForm({
              status: o.status || "Pending",
              payment_status: o.payment_status || "Pending",
              tracking_number: o.tracking_number || "",
              tracking_url: o.tracking_url || "",
            });
            setLoading(false);
          } else {
            throw new Error("Order empty");
          }
        })
        .catch(() => {
          // Fallback: list all orders and match by ID
          adminApi("/admin/orders")
            .then((res) => {
              if (!active) return;
              const list = res.data || [];
              setAllOrders(list);
              const found = list.find((x) => String(x.id) === String(resolvedId));
              if (found) {
                setOrder(found);
                setForm({
                  status: found.status || "Pending",
                  payment_status: found.payment_status || "Pending",
                  tracking_number: found.tracking_number || "",
                  tracking_url: found.tracking_url || "",
                });
              } else {
                toast.show(`Order #${resolvedId} not found`, "error");
              }
            })
            .catch((err) => {
              if (active) toast.show(err.message || "Failed to load orders", "error");
            })
            .finally(() => {
              if (active) setLoading(false);
            });
        });
    } else {
      setLoading(false);
      // If edit route accessed without ID, fetch orders so user can select one
      adminApi("/admin/orders")
        .then((res) => {
          if (active) setAllOrders(res.data || []);
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [resolvedId, toast]);

  async function submit(e) {
    e.preventDefault();
    if (!resolvedId) return;
    setBusy(true);
    try {
      const d = await adminApi(`/admin/orders/${resolvedId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      toast.show(d.message || "Order updated successfully");
      router.push("/admin/orders");
    } catch (err) {
      toast.show(err.message || "Failed to update order", "error");
    } finally {
      setBusy(false);
    }
  }

  // If no order ID was provided
  if (!resolvedId) {
    return (
      <>
        <PageHeader
          title="Edit Order"
          subtitle="Select an order from the list to manage status, tracking, and details."
          backTo="/admin/orders"
        />
        <div className="adminPanel" style={{ padding: "30px", textAlign: "center" }}>
          <h3 style={{ marginBottom: "12px", color: "var(--admin-dark)" }}>No Order Selected</h3>
          <p style={{ color: "var(--admin-muted)", marginBottom: "20px" }}>
            Please select an order from the dropdown below or return to the orders list.
          </p>
          {allOrders.length > 0 ? (
            <div style={{ maxWidth: "420px", margin: "0 auto", textAlign: "left" }}>
              <label className="formField">
                <span>Select Order to Edit</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      router.push(`/admin/orders/${e.target.value}/edit`);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Choose an order…</option>
                  {allOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.order_number || o.id} - {o.name} ({money(o.total)})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <button
              type="button"
              className="primaryAction"
              onClick={() => router.push("/admin/orders")}
            >
              Go to Orders
            </button>
          )}
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="adminPanel" style={{ padding: "50px", textAlign: "center", color: "var(--admin-muted)" }}>
        <div style={{ fontSize: "28px", marginBottom: "12px" }}>📦</div>
        <strong>Loading order #{resolvedId} details…</strong>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="adminPanel" style={{ padding: "40px", textAlign: "center" }}>
        <h3 style={{ color: "var(--admin-dark)", marginBottom: "8px" }}>Order Not Found</h3>
        <p style={{ color: "var(--admin-muted)", marginBottom: "18px" }}>
          Order #{resolvedId} could not be located in the database.
        </p>
        <button
          type="button"
          className="primaryAction"
          onClick={() => router.push("/admin/orders")}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit Order ${order.order_number || `#${order.id}`}`}
        subtitle={`Placed on ${order.created_at || "Recent"} · ${order.name} · ${money(order.total)}`}
        backTo="/admin/orders"
      >
        <Link
          to={`/admin/orders/${order.id}/invoice`}
          className="secondaryAction"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <FileText size={15} /> View Tax Invoice
        </Link>
      </PageHeader>

      <div className="orderEditLayout">
        {/* Main Column: Status & Tracking Form */}
        <div className="orderEditMainCol">
          <form className="adminPanel formPanel" onSubmit={submit}>
            <section className="formSection">
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={18} color="#a57c36" /> Fulfillment & Status Management
              </h2>
              <div className="formGrid">
                <label className="formField">
                  <span>Order Fulfillment Status *</span>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </label>

                <label className="formField">
                  <span>Payment Settlement Status</span>
                  <select
                    value={form.payment_status}
                    onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                  >
                    {paymentStatusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </label>

                <label className="formField">
                  <span>AWB / Tracking Number</span>
                  <input
                    type="text"
                    placeholder="e.g. DELHIVERY12345678"
                    value={form.tracking_number}
                    onChange={(e) => setForm({ ...form, tracking_number: e.target.value })}
                  />
                </label>

                <label className="formField">
                  <span>Carrier Tracking URL</span>
                  <input
                    type="url"
                    placeholder="https://track.carrier.com/..."
                    value={form.tracking_url}
                    onChange={(e) => setForm({ ...form, tracking_url: e.target.value })}
                  />
                </label>
              </div>
            </section>

            {/* Ordered Items Summary */}
            <section className="formSection" style={{ marginTop: "16px" }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={18} color="#a57c36" /> Ordered Products ({order.items?.length || 0})
              </h2>
              {order.items && order.items.length > 0 ? (
                <div style={{ overflowX: "auto", marginTop: "12px", width: "100%", maxWidth: "100%" }}>
                  <table className="adminTable" style={{ margin: 0, width: "100%" }}>
                    <thead>
                      <tr>
                        <th>Product Item</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td>
                            <strong>{item.product_name || item.name || "Product"}</strong>
                            {item.sku && <small style={{ display: "block", color: "var(--admin-muted)" }}>SKU: {item.sku}</small>}
                          </td>
                          <td>{money(item.price)}</td>
                          <td>{item.quantity || 1}</td>
                          <td><strong>{money((item.price || 0) * (item.quantity || 1))}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: "var(--admin-muted)", fontSize: "13px" }}>No line items recorded.</p>
              )}
            </section>

            <div className="formActions">
              <button
                type="button"
                className="secondaryAction"
                onClick={() => router.push("/admin/orders")}
              >
                Cancel
              </button>
              <button className="primaryAction" type="submit" disabled={busy}>
                {busy ? "Saving Changes…" : "Update Order"}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Column: Customer & Payment Details */}
        <div className="orderEditSideCol">
          {/* Customer Card */}
          <div className="orderDetailCard">
            <h3>
              <User size={16} color="#a57c36" /> Customer Information
            </h3>
            <div style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--admin-dark)" }}>
              <strong style={{ fontSize: "14px" }}>{order.name}</strong>
              <div style={{ color: "var(--admin-muted)" }}>{order.phone}</div>
              {order.email && <div style={{ color: "var(--admin-muted)" }}>{order.email}</div>}
            </div>

            <hr className="orderDetailDivider" />

            <h4>
              <MapPin size={13} /> Shipping Address
            </h4>
            <div style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--admin-dark)" }}>
              <div>{order.address}</div>
              <div style={{ marginTop: "4px" }}>
                {order.city}{order.state ? `, ${order.state}` : ""} - <strong style={{ color: "var(--admin-dark)" }}>{order.pincode}</strong>
              </div>
            </div>
          </div>

          {/* Payment Breakdown Card */}
          <div className="orderDetailCard">
            <h3>
              <CreditCard size={16} color="#a57c36" /> Financial Settlement
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div className="orderFinanceRow">
                <span style={{ color: "var(--admin-muted)" }}>Payment Mode:</span>
                <strong>{order.payment_method || "COD"}</strong>
              </div>
              <div className="orderFinanceRow">
                <span style={{ color: "var(--admin-muted)" }}>Payment Status:</span>
                <span className={`statusBadge ${order.payment_status === "Paid" ? "active" : "inactive"}`}>
                  {order.payment_status || "Pending"}
                </span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="orderFinanceRow" style={{ color: "#16a34a" }}>
                  <span>Discount Applied:</span>
                  <span>- {money(order.discount_amount)}</span>
                </div>
              )}
              <hr className="orderDetailDivider" />
              <div className="orderFinanceRow" style={{ fontSize: "15px", paddingTop: "4px" }}>
                <strong>Grand Total:</strong>
                <strong style={{ color: "var(--admin-dark)", fontSize: "16px" }}>{money(order.total)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
