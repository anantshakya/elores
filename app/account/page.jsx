'use client';
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "@/app/_lib/router-compat";
import {
  User,
  Package,
  Heart,
  MapPin,
  ShoppingBag,
  LogOut,
  Star,
  Printer,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  Lock,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Edit2
} from "lucide-react";
import {
  api,
  money,
  SEO,
  useStore,
  useToast,
} from "@/app/_components/StorefrontCore.jsx";
import { useAuthModal } from "@/app/_components/AuthModal.jsx";

export default function AccountPage() {
  const nav = useNavigate();
  const toast = useToast();
  const authModal = useAuthModal();
  const { cart, wishlist, addCart, toggleWish, updateQty, openCart } = useStore();

  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'profile' | 'wishlist' | 'addresses' | 'cart'
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    is_default: 1,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Selected Order for Invoice / Tracking Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Review Modal State
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    review: "",
    name: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadData = () => {
    setLoading(true);
    api("/account")
      .then((d) => {
        setUser(d.user);
        setProfileForm({
          name: d.user?.name || "",
          phone: d.user?.phone || "",
          password: "",
          confirmPassword: "",
        });
        setReviewForm((prev) => ({ ...prev, name: d.user?.name || "" }));
      })
      .catch(() => {
        toast.show("Please sign in to view your account", "error");
        if (authModal?.openAuth) authModal.openAuth("login");
        nav("/");
      });

    api("/account/orders")
      .then((d) => setOrders(d.data || []))
      .catch(() => {});

    api("/account/addresses")
      .then((d) => setAddresses(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("elores_customer_token")) {
      toast.show("Please sign in to view your account", "error");
      if (authModal?.openAuth) authModal.openAuth("login");
      nav("/");
    } else {
      loadData();
    }
  }, []);

  // Update Profile Submit
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.show("Name is required", "error");
    if (profileForm.password && profileForm.password.length < 6) {
      return toast.show("Password must be at least 6 characters", "error");
    }
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      return toast.show("Passwords do not match", "error");
    }

    setSavingProfile(true);
    try {
      const res = await api("/account/profile", {
        method: "POST",
        body: JSON.stringify(profileForm),
      });
      toast.show(res.message || "Profile updated successfully!");
      setProfileForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      loadData();
    } catch (err) {
      toast.show(err.message || "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Save Address Submit
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.name.trim() || !addressForm.address.trim() || !addressForm.city.trim() || !addressForm.pincode.trim()) {
      return toast.show("Please complete all address fields", "error");
    }
    setSavingAddress(true);
    try {
      await api("/account/addresses", {
        method: "POST",
        body: JSON.stringify(addressForm),
      });
      toast.show("Address saved successfully!");
      setAddressForm({
        label: "Home",
        name: user?.name || "",
        phone: user?.phone || "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        is_default: 0,
      });
      loadData();
    } catch (err) {
      toast.show(err.message || "Failed to save address", "error");
    } finally {
      setSavingAddress(false);
    }
  };

  // Submit Product Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewProduct) return;
    if (!reviewForm.review.trim()) return toast.show("Review text is required", "error");

    setSubmittingReview(true);
    try {
      const res = await api(`/products/${reviewProduct.product_id}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          name: reviewForm.name || user?.name || "Verified Customer",
          rating: reviewForm.rating,
          title: reviewForm.title,
          review: reviewForm.review,
        }),
      });
      toast.show(res.message || "Review submitted for verification!");
      setReviewProduct(null);
      setReviewForm({ rating: 5, title: "", review: "", name: user?.name || "" });
    } catch (err) {
      toast.show(err.message || "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("elores_customer_token");
    toast.show("Signed out of Elores session");
    nav("/");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", background: "#faf7f2" }}>
        <div style={{ textAlign: "center", color: "#8a7a6b" }}>
          <Sparkles size={32} style={{ animation: "spin 2s linear infinite", marginBottom: "12px", color: "#a57c36" }} />
          <p style={{ fontWeight: 500, fontSize: "15px" }}>Loading your Elores account dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="My Account & Orders | Elores Fine Jewellery" />

      <section style={{ background: "#faf7f2", minHeight: "85vh", padding: "40px 16px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header Banner */}
          <div
            style={{
              background: "#1c1714",
              color: "#fff",
              borderRadius: "16px",
              padding: "28px 32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              marginBottom: "28px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a57c36", fontSize: "12px", fontWeight: 700, letterSpacing: "1px" }}>
                <Sparkles size={14} />
                <span>ELORES EXECUTIVE MEMBER</span>
              </div>
              <h1 style={{ fontFamily: "serif", fontSize: "28px", margin: "4px 0 0", color: "#f7f3ec" }}>
                Welcome, {user?.name || "Valued Guest"}
              </h1>
              <span style={{ fontSize: "13px", color: "#a89f91" }}>{user?.email} {user?.phone ? `• +91 ${user.phone}` : ""}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.08)",
                color: "#e2d9cd",
                border: "1px solid rgba(255,255,255,0.15)",
                padding: "10px 18px",
                borderRadius: "30px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Account Multi-Tab Navigation */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "8px",
              marginBottom: "24px",
              borderBottom: "1px solid #e5ded6",
            }}
          >
            {[
              { id: "orders", label: `My Orders (${orders.length})`, icon: Package },
              { id: "profile", label: "My Profile & Security", icon: User },
              { id: "wishlist", label: `Wishlist (${wishlist.length})`, icon: Heart },
              { id: "addresses", label: `Saved Addresses (${addresses.length})`, icon: MapPin },
              { id: "cart", label: `Shopping Bag (${cart.length})`, icon: ShoppingBag },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: isActive ? "#a57c36" : "#fff",
                    color: isActive ? "#fff" : "#4a423a",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: isActive ? "0 4px 12px rgba(165,124,54,0.25)" : "0 2px 6px rgba(0,0,0,0.04)",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: MY ORDERS & TRACKING */}
          {activeTab === "orders" && (
            <div>
              {orders.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {orders.map((o) => {
                    const isDelivered = (o.status || "").toLowerCase() === "delivered";
                    const isShipped = (o.status || "").toLowerCase() === "shipped" || isDelivered;
                    return (
                      <div
                        key={o.id}
                        style={{
                          background: "#fff",
                          borderRadius: "16px",
                          border: "1px solid #e5ded6",
                          padding: "24px",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                        }}
                      >
                        {/* Order Header Bar */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "12px",
                            paddingBottom: "16px",
                            borderBottom: "1px solid #f0eae1",
                          }}
                        >
                          <div>
                            <span style={{ fontSize: "12px", color: "#8a7a6b", textTransform: "uppercase", fontWeight: 700 }}>Order Number</span>
                            <div style={{ fontSize: "18px", fontWeight: 700, color: "#1c1714" }}>#{o.order_number}</div>
                            <span style={{ fontSize: "12px", color: "#666" }}>Placed on {o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Recent"}</span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                            <span
                              style={{
                                padding: "6px 14px",
                                borderRadius: "30px",
                                fontSize: "12px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                background: isDelivered ? "#dcfce7" : isShipped ? "#e0f2fe" : "#fef3c7",
                                color: isDelivered ? "#15803d" : isShipped ? "#0369a1" : "#b45309",
                              }}
                            >
                              Status: {o.status || "Processing"}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrder(o);
                                setShowInvoiceModal(true);
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 14px",
                                borderRadius: "8px",
                                border: "1px solid #a57c36",
                                background: "#fff",
                                color: "#a57c36",
                                fontWeight: 600,
                                fontSize: "13px",
                                cursor: "pointer",
                              }}
                            >
                              <Printer size={14} />
                              <span>Invoice &amp; Receipt</span>
                            </button>
                          </div>
                        </div>

                        {/* Order Items Table */}
                        <div style={{ padding: "16px 0" }}>
                          <h4 style={{ margin: "0 0 12px", fontSize: "14px", color: "#4a423a" }}>Purchased Items</h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {(o.items || []).length > 0 ? (
                              o.items.map((item, idx) => (
                                <div
                                  key={item.id || idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "16px",
                                    padding: "10px",
                                    background: "#faf7f2",
                                    borderRadius: "10px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    {item.product_image ? (
                                      <img
                                        src={item.product_image}
                                        alt={item.product_name}
                                        style={{ width: "54px", height: "54px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5ded6" }}
                                      />
                                    ) : (
                                      <div style={{ width: "54px", height: "54px", borderRadius: "8px", background: "#e8ded2", display: "grid", placeItems: "center", fontSize: "11px", color: "#888" }}>Elores</div>
                                    )}
                                    <div>
                                      <strong style={{ fontSize: "14px", color: "#1c1714" }}>{item.product_name || `Item #${item.product_id}`}</strong>
                                      <div style={{ fontSize: "12px", color: "#666" }}>
                                        Qty: {item.quantity} × {money(item.price)}
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <strong style={{ fontSize: "14px", color: "#a57c36" }}>{money((Number(item.price) || 0) * (Number(item.quantity) || 1))}</strong>
                                    {isDelivered && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReviewProduct(item);
                                          setReviewForm((prev) => ({ ...prev, rating: 5, title: "", review: "", name: user?.name || "" }));
                                        }}
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "4px",
                                          padding: "6px 12px",
                                          borderRadius: "6px",
                                          background: "#fef3c7",
                                          color: "#b45309",
                                          border: "none",
                                          fontSize: "12px",
                                          fontWeight: 600,
                                          cursor: "pointer",
                                        }}
                                      >
                                        <Star size={13} fill="currentColor" />
                                        <span>Write Review</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div style={{ fontSize: "13px", color: "#888" }}>Order details logged. Total paid: <strong>{money(o.total)}</strong></div>
                            )}
                          </div>
                        </div>

                        {/* Order Tracking & Footer */}
                        <div style={{ background: "#f8f5f0", borderRadius: "10px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                          <div>
                            <span style={{ fontSize: "12px", color: "#8a7a6b" }}>Tracking Details: </span>
                            <strong style={{ fontSize: "13px", color: "#1c1714" }}>
                              {o.tracking_number ? `${o.courier_name || "Express Courier"} — ${o.tracking_number}` : "Tracking number will be assigned upon dispatch"}
                            </strong>
                          </div>

                          <Link
                            to={`/track-order?order=${o.order_number}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#a57c36", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}
                          >
                            <span>Live Track Shipment</span>
                            <ChevronRight size={15} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: "16px", padding: "48px 24px", textAlign: "center", border: "1px solid #e5ded6" }}>
                  <Package size={48} color="#a57c36" style={{ margin: "0 auto 16px" }} />
                  <h3 style={{ margin: "0 0 8px", color: "#1c1714" }}>No Orders Placed Yet</h3>
                  <p style={{ color: "#786f68", maxWidth: "400px", margin: "0 auto 20px", fontSize: "14px" }}>
                    Explore our anti-tarnish artificial jewellery collection and place your first order.
                  </p>
                  <Link to="/shop" className="btn dark pillBtn" style={{ display: "inline-flex" }}>
                    <span>Browse Storefront</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY PROFILE & SECURITY */}
          {activeTab === "profile" && (
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5ded6", padding: "32px", maxWidth: "680px" }}>
              <h2 style={{ fontFamily: "serif", fontSize: "22px", margin: "0 0 8px", color: "#1c1714" }}>Personal Details &amp; Password</h2>
              <p style={{ color: "#786f68", fontSize: "13px", margin: "0 0 24px" }}>Keep your information updated for smooth order delivery and notifications.</p>

              <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1c1714", marginBottom: "6px" }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #dcd3c9", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1c1714", marginBottom: "6px" }}>Email Address (Account Identity)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #eee", background: "#f5f2ec", color: "#888", fontSize: "14px" }}
                  />
                  <small style={{ color: "#888", fontSize: "11px", marginTop: "4px", display: "block" }}>Email address cannot be changed directly for security integrity.</small>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1c1714", marginBottom: "6px" }}>Mobile Number (10-Digit)</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/[^0-9]/g, "") })}
                    placeholder="10-digit mobile number"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #dcd3c9", fontSize: "14px" }}
                  />
                </div>

                <div style={{ borderTop: "1px solid #f0eae1", paddingTop: "20px", marginTop: "8px" }}>
                  <h3 style={{ fontSize: "16px", margin: "0 0 12px", color: "#1c1714" }}>Change Password (Optional)</h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#4a423a", marginBottom: "6px" }}>New Password</label>
                      <input
                        type="password"
                        placeholder="At least 6 characters"
                        value={profileForm.password}
                        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #dcd3c9", fontSize: "14px" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#4a423a", marginBottom: "6px" }}>Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Re-enter password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #dcd3c9", fontSize: "14px" }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn dark"
                  style={{ width: "fit-content", marginTop: "8px", padding: "12px 28px", borderRadius: "30px" }}
                >
                  {savingProfile ? "Saving Profile..." : "Save Profile Details"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === "wishlist" && (
            <div>
              {wishlist.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "#fff",
                        borderRadius: "14px",
                        border: "1px solid #e5ded6",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ position: "relative", height: "220px", background: "#f9f6f0" }}>
                        <img
                          src={item.image || "/elores-logo.png"}
                          alt={item.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={() => toggleWish(item)}
                          title="Remove from wishlist"
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            background: "rgba(255,255,255,0.9)",
                            border: "none",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                            color: "#b91c1c",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                        <strong style={{ fontSize: "15px", color: "#1c1714", marginBottom: "4px" }}>{item.name}</strong>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#a57c36", marginBottom: "16px" }}>
                          {money(item.sale_price || item.price)}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            addCart(item, 1);
                            toast.show(`Added ${item.name} to bag!`);
                          }}
                          style={{
                            marginTop: "auto",
                            width: "100%",
                            padding: "10px",
                            borderRadius: "8px",
                            background: "#1c1714",
                            color: "#fff",
                            border: "none",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <ShoppingBag size={15} />
                          <span>Add to Bag</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: "16px", padding: "48px 24px", textAlign: "center", border: "1px solid #e5ded6" }}>
                  <Heart size={48} color="#a57c36" style={{ margin: "0 auto 16px" }} />
                  <h3 style={{ margin: "0 0 8px", color: "#1c1714" }}>Your Wishlist is Empty</h3>
                  <p style={{ color: "#786f68", maxWidth: "400px", margin: "0 auto 20px", fontSize: "14px" }}>
                    Save your favorite anti-tarnish jewellery pieces here to buy later or share with friends.
                  </p>
                  <Link to="/shop" className="btn dark pillBtn" style={{ display: "inline-flex" }}>
                    <span>Discover Jewellery</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Address List */}
              <div>
                <h3 style={{ fontSize: "18px", margin: "0 0 16px", color: "#1c1714" }}>Saved Delivery Addresses</h3>
                {addresses.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {addresses.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          background: "#fff",
                          borderRadius: "12px",
                          border: "1px solid #e5ded6",
                          padding: "18px",
                          position: "relative",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", background: "#f5eee4", color: "#a57c36", padding: "3px 8px", borderRadius: "4px" }}>
                            {a.label || "Address"}
                          </span>
                          {Boolean(Number(a.is_default)) && (
                            <span style={{ fontSize: "11px", fontWeight: 600, color: "#15803d", background: "#dcfce7", padding: "3px 8px", borderRadius: "4px" }}>
                              Default Address
                            </span>
                          )}
                        </div>
                        <strong style={{ display: "block", fontSize: "15px", color: "#1c1714", marginBottom: "4px" }}>{a.name}</strong>
                        <p style={{ margin: 0, fontSize: "13px", color: "#666", lineHeight: "1.5" }}>
                          {a.address}, {a.city}, {a.state} - <strong>{a.pincode}</strong>
                        </p>
                        <div style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>Phone: +91 {a.phone}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #e5ded6", color: "#888", fontSize: "14px" }}>
                    No saved addresses yet. Fill the form to save your first shipping address.
                  </div>
                )}
              </div>

              {/* Add Address Form */}
              <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5ded6", padding: "24px" }}>
                <h3 style={{ fontSize: "18px", margin: "0 0 16px", color: "#1c1714" }}>Add New Address</h3>
                <form onSubmit={handleSaveAddress} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#1c1714", marginBottom: "4px" }}>Address Type</label>
                      <select
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dcd3c9", fontSize: "13px" }}
                      >
                        <option>Home</option>
                        <option>Work / Office</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#1c1714", marginBottom: "4px" }}>Full Name *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dcd3c9", fontSize: "13px" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#1c1714", marginBottom: "4px" }}>Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/[^0-9]/g, "") })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dcd3c9", fontSize: "13px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#1c1714", marginBottom: "4px" }}>Street Address *</label>
                    <textarea
                      required
                      rows="2"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      placeholder="House/Flat No, Building, Street, Landmark"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dcd3c9", fontSize: "13px" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#1c1714", marginBottom: "4px" }}>City *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #dcd3c9", fontSize: "13px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#1c1714", marginBottom: "4px" }}>State *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #dcd3c9", fontSize: "13px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#1c1714", marginBottom: "4px" }}>Pincode *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/[^0-9]/g, "") })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #dcd3c9", fontSize: "13px" }}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={savingAddress} className="btn dark full" style={{ marginTop: "6px", padding: "10px" }}>
                    {savingAddress ? "Saving..." : "Save Address"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: MY CART */}
          {activeTab === "cart" && (
            <div>
              {cart.length > 0 ? (
                <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5ded6", padding: "24px" }}>
                  <h3 style={{ fontSize: "18px", margin: "0 0 16px", color: "#1c1714" }}>Shopping Bag Items</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                    {cart.map((item) => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", borderBottom: "1px solid #f0eae1", paddingBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <img src={item.image || "/elores-logo.png"} alt={item.name} style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5ded6" }} />
                          <div>
                            <strong style={{ fontSize: "15px", color: "#1c1714" }}>{item.name}</strong>
                            {item.variant_title && <div style={{ fontSize: "12px", color: "#a57c36", fontWeight: 600 }}>Option: {item.variant_title}</div>}
                            <div style={{ fontSize: "13px", color: "#888" }}>{money(item.sale_price || item.price)} each</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", border: "1px solid #dcd3c9", borderRadius: "6px" }}>
                            <button type="button" onClick={() => updateQty(item.id, item.qty - 1)} style={{ padding: "4px 10px", background: "none", border: "none", cursor: "pointer" }}>-</button>
                            <span style={{ padding: "0 8px", fontSize: "13px", fontWeight: 600 }}>{item.qty}</span>
                            <button type="button" onClick={() => updateQty(item.id, item.qty + 1)} style={{ padding: "4px 10px", background: "none", border: "none", cursor: "pointer" }}>+</button>
                          </div>
                          <strong style={{ fontSize: "15px", color: "#a57c36" }}>{money(Number(item.sale_price || item.price) * item.qty)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "13px", color: "#666" }}>Subtotal: </span>
                      <strong style={{ fontSize: "20px", color: "#1c1714" }}>{money(cart.reduce((s, x) => s + Number(x.sale_price || x.price) * x.qty, 0))}</strong>
                    </div>

                    <Link to="/checkout" className="btn dark pillBtn" style={{ padding: "12px 28px" }}>
                      <span>Proceed to Checkout</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: "16px", padding: "48px 24px", textAlign: "center", border: "1px solid #e5ded6" }}>
                  <ShoppingBag size={48} color="#a57c36" style={{ margin: "0 auto 16px" }} />
                  <h3 style={{ margin: "0 0 8px", color: "#1c1714" }}>Your Bag is Empty</h3>
                  <p style={{ color: "#786f68", maxWidth: "400px", margin: "0 auto 20px", fontSize: "14px" }}>
                    Add pieces to your bag while browsing our catalog.
                  </p>
                  <Link to="/shop" className="btn dark pillBtn" style={{ display: "inline-flex" }}>
                    <span>Browse Collection</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* PRINTABLE INVOICE MODAL */}
      {showInvoiceModal && selectedOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "32px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", borderBottom: "2px solid #1c1714", paddingBottom: "16px" }}>
              <div>
                <h2 style={{ fontFamily: "serif", margin: 0, fontSize: "24px", color: "#1c1714" }}>ELORES FINE JEWELLERY</h2>
                <span style={{ fontSize: "12px", color: "#666" }}>Tax Invoice / Order Receipt</span>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#a57c36", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
                >
                  <Printer size={14} />
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  style={{ background: "#eee", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px", fontSize: "13px" }}>
              <div>
                <strong>Billed To:</strong>
                <div>{user?.name}</div>
                <div>{user?.email}</div>
                <div>+91 {user?.phone}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <strong>Order #: </strong>#{selectedOrder.order_number}<br />
                <strong>Order Date: </strong>{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString("en-IN") : "Recent"}<br />
                <strong>Payment Method: </strong>{selectedOrder.payment_method || "COD / Prepaid"}
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "24px" }}>
              <thead>
                <tr style={{ background: "#f5eee4", textAlign: "left" }}>
                  <th style={{ padding: "10px" }}>Item Description</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>Qty</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Unit Price</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(selectedOrder.items || []).map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px" }}>{it.product_name || `Product #${it.product_id}`}</td>
                    <td style={{ padding: "10px", textAlign: "center" }}>{it.quantity}</td>
                    <td style={{ padding: "10px", textAlign: "right" }}>{money(it.price)}</td>
                    <td style={{ padding: "10px", textAlign: "right" }}>{money(Number(it.price) * Number(it.quantity))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "2px solid #f0eae1", paddingTop: "16px" }}>
              <div style={{ width: "240px", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span>Subtotal:</span>
                  <strong>{money(selectedOrder.subtotal || selectedOrder.total)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span>Shipping:</span>
                  <strong style={{ color: "#15803d" }}>FREE</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 700, borderTop: "1px solid #1c1714", paddingTop: "8px", marginTop: "8px" }}>
                  <span>Total Paid:</span>
                  <span style={{ color: "#a57c36" }}>{money(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT REVIEW SUBMISSION MODAL */}
      {reviewProduct && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", maxWidth: "520px", width: "100%", padding: "28px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#1c1714" }}>Write Verified Product Review</h3>
              <button type="button" onClick={() => setReviewProduct(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#faf7f2", padding: "12px", borderRadius: "10px", marginBottom: "20px" }}>
              {reviewProduct.product_image ? (
                <img src={reviewProduct.product_image} alt={reviewProduct.product_name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px" }} />
              ) : null}
              <strong style={{ fontSize: "14px", color: "#1c1714" }}>{reviewProduct.product_name}</strong>
            </div>

            <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1c1714", marginBottom: "6px" }}>Overall Rating</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                      style={{ background: "none", border: "none", cursor: "pointer", color: s <= reviewForm.rating ? "#f59e0b" : "#d1d5db" }}
                    >
                      <Star size={24} fill={s <= reviewForm.rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1c1714", marginBottom: "6px" }}>Review Title</label>
                <input
                  type="text"
                  placeholder="e.g. Absolutely stunning quality!"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #dcd3c9", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1c1714", marginBottom: "6px" }}>Your Detailed Experience *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Share details about craftsmanship, polish, anti-tarnish wear, or delivery..."
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #dcd3c9", fontSize: "13px" }}
                />
              </div>

              <button type="submit" disabled={submittingReview} className="btn dark full" style={{ padding: "12px" }}>
                {submittingReview ? "Submitting..." : "Submit Review for Approval"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

