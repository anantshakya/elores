'use client';
import { useEffect, useState } from "react";
import { User, Mail, Lock, ShieldCheck } from "lucide-react";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import { useAdminAuth } from "@/app/admin/_components/AdminAuth.jsx";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";
import { adminApi } from "@/app/admin/_lib/api.js";

export default function ProfilePage() {
  const auth = useAdminAuth();
  const toast = useAdminToast();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [confirmPwd, setConfirmPwd] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (auth.user) setF({ name: auth.user.name || "", email: auth.user.email || "", password: "" });
  }, [auth.user]);

  async function submit(e) {
    e.preventDefault();
    if (f.password && f.password !== confirmPwd) {
      return toast.show("Passwords do not match", "error");
    }
    setBusy(true);
    try {
      const d = await adminApi("/admin/profile", { method: "PUT", body: JSON.stringify(f) });
      toast.show(d.message || "Profile updated");
      await auth.refresh();
      setF((x) => ({ ...x, password: "" }));
      setConfirmPwd("");
    } catch (x) {
      toast.show(x.message, "error");
    } finally {
      setBusy(false);
    }
  }

  const initials = (auth.user?.name || "A")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const role = (auth.user?.role || "").replaceAll("_", " ");

  return (
    <>
      <PageHeader title="My Profile" subtitle="Manage your account details and password." backTo="/admin" backLabel="Back to Dashboard" />

      <div className="profileLayout">
        {/* Left — Avatar Card */}
        <div className="profileAvatarCard adminPanel">
          <div className="profileAvatar">{initials}</div>
          <h2 className="profileName">{auth.user?.name || "Admin"}</h2>
          <p className="profileEmail">{auth.user?.email}</p>
          {role && (
            <span className="profileRoleBadge">
              <ShieldCheck size={13} /> {role}
            </span>
          )}
        </div>

        {/* Right — Edit Form */}
        <form className="profileFormCard adminPanel formPanel" onSubmit={submit}>
          <div className="profileFormSection">
            <h3 className="profileSectionTitle">Personal Information</h3>
            <label className="formField">
              <span><User size={12} style={{ display: "inline", marginRight: 5 }} />Full Name</span>
              <input
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
                placeholder="Your full name"
                required
              />
            </label>
            <label className="formField">
              <span><Mail size={12} style={{ display: "inline", marginRight: 5 }} />Email Address</span>
              <input
                type="email"
                value={f.email}
                onChange={(e) => setF({ ...f, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </label>
          </div>

          <div className="profileFormSection">
            <h3 className="profileSectionTitle">Change Password</h3>
            <label className="formField">
              <span><Lock size={12} style={{ display: "inline", marginRight: 5 }} />New Password</span>
              <input
                type="password"
                value={f.password}
                onChange={(e) => setF({ ...f, password: e.target.value })}
                placeholder="Leave blank to keep current password"
              />
            </label>
            <label className="formField">
              <span><Lock size={12} style={{ display: "inline", marginRight: 5 }} />Confirm Password</span>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Re-enter new password"
                style={
                  confirmPwd && f.password !== confirmPwd
                    ? { borderColor: "var(--admin-red)", boxShadow: "0 0 0 3px rgba(179,38,30,0.12)" }
                    : confirmPwd && f.password === confirmPwd
                    ? { borderColor: "var(--admin-green)", boxShadow: "0 0 0 3px rgba(25,112,74,0.12)" }
                    : {}
                }
              />
              {confirmPwd && f.password !== confirmPwd && (
                <small style={{ color: "var(--admin-red)", fontSize: "11px", marginTop: "-4px" }}>
                  Passwords do not match
                </small>
              )}
              {confirmPwd && f.password === confirmPwd && (
                <small style={{ color: "var(--admin-green)", fontSize: "11px", marginTop: "-4px" }}>
                  Passwords match ✓
                </small>
              )}
            </label>
          </div>


          <div className="formActions">
            <button className="primaryAction" disabled={busy}>
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
