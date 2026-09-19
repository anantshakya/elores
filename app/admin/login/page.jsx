'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Gem,
  CheckCircle2,
  TrendingUp,
  Store,
  Layers,
  KeyRound
} from "lucide-react";
import { useAdminAuth } from "@/app/admin/_components/AdminAuth.jsx";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";

export default function LoginPage() {
  const auth = useAdminAuth();
  const toast = useAdminToast();
  const router = useRouter();
  const [settings, setSettings] = useState({ logo: "/elores-logo.png" });

  const [form, setForm] = useState({
    email: "admin@elores.local",
    password: "Admin@123",
    remember: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Instant cache hydration
    try {
      const cached = localStorage.getItem("elores_cached_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.logo) setSettings((s) => ({ ...s, logo: parsed.logo }));
      }
    } catch (e) {}

    fetch("/elores_backend/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?.logo) {
          setSettings((s) => ({ ...s, logo: d.data.logo }));
        }
      })
      .catch(() => {});
  }, []);

  // If already authenticated, redirect to /admin
  useEffect(() => {
    if (auth.user) {
      router.replace("/admin");
    }
  }, [auth.user, router]);

  if (auth.user) {
    return null;
  }

  async function submit(event) {
    event.preventDefault();
    setErrorMessage("");
    setBusy(true);
    try {
      await auth.login(form.email, form.password, form.remember);
      toast.show("Welcome back to Elores Executive Suite");
      router.replace("/admin");
    } catch (error) {
      setErrorMessage(error.message || "Invalid credentials. Please verify email and password.");
      toast.show(error.message || "Sign in failed", "error");
    } finally {
      setBusy(false);
    }
  }

  function fillDemo() {
    setForm({
      email: "admin@elores.local",
      password: "Admin@123",
      remember: true,
    });
    setErrorMessage("");
    toast.show("Demo credentials loaded!");
  }

  return (
    <div className="adminSplitLoginPage">
      {/* ── LEFT SIDE: CREATIVE LUXURY ANIMATION & BRANDING ── */}
      <div className="adminVisualSide">
        <div className="visualBackgroundMesh" />
        <div className="visualNoiseOverlay" />

        {/* Brand Bar */}
        <div className="visualHeader">
          <Link href="/" className="visualBrandLogo" title="Back to storefront" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
            <img
              src={settings.logo || "/elores-logo.png"}
              alt="Elores"
              style={{ height: "42px", width: "auto", maxWidth: "185px", objectFit: "contain" }}
              onError={(e) => { e.target.src = "/elores-logo.png"; }}
            />
          </Link>
          <div className="visualTag">
            <span className="livePulseDot" />
            <span>EXECUTIVE SUITE v2.4</span>
          </div>
        </div>

        {/* Centered Creative Jewelry Orbital Animation */}
        <div className="orbitalAnimationContainer">
          <div className="ambientGlowOrb glowPrimary" />
          <div className="ambientGlowOrb glowSecondary" />

          <div className="orbitalSystem">
            {/* Outer dotted gold orbit ring */}
            <div className="orbitRing outerRing">
              <span className="orbitMarker marker1">✦</span>
              <span className="orbitMarker marker2">◇</span>
              <span className="orbitMarker marker3">✦</span>
            </div>

            {/* Middle counter-rotating ring */}
            <div className="orbitRing middleRing">
              <span className="orbitDiamond">💎</span>
            </div>

            {/* Inner glowing ring */}
            <div className="orbitRing innerRing" />

            {/* Centerpiece Crest */}
            <div className="orbitalCenterpiece">
              <div className="jewelSparkle">
                <Gem size={44} />
              </div>
              <span className="centerEmblemText">ELORES</span>
              <small className="centerEmblemSub">ARTIFICIAL JEWELLERY</small>
            </div>
          </div>
        </div>

        {/* Feature Statement & Narrative */}
        <div className="visualEditorial">
          <div className="editorialPill">
            <Sparkles size={14} />
            <span>Command & Operations Suite</span>
          </div>
          <h2>Designed for luxury. Engineered for precision.</h2>
          <p>
            Real-time management for catalog merchandising, order fulfilment, anti-tarnish
            inventory governance, and VIP customer experiences.
          </p>

          {/* Floating Live Feature Badges */}
          <div className="visualBadgesGrid">
            <div className="visualMicroCard">
              <div className="microCardIcon iconShield">
                <ShieldCheck size={18} />
              </div>
              <div>
                <strong>256-Bit Vault Protocol</strong>
                <p>Encrypted session verification active</p>
              </div>
            </div>

            <div className="visualMicroCard">
              <div className="microCardIcon iconTrending">
                <TrendingUp size={18} />
              </div>
              <div>
                <strong>Live Store Sync</strong>
                <p>Multi-channel stock & catalog parity</p>
              </div>
            </div>

            <div className="visualMicroCard">
              <div className="microCardIcon iconLayers">
                <Layers size={18} />
              </div>
              <div>
                <strong>Role-Based Security</strong>
                <p>Granular admin permissions guard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="visualFooter">
          <span>© 2026 Elores Technologies · All rights reserved</span>
          <span className="secIndicator">
            <CheckCircle2 size={13} /> High-Security Gateway
          </span>
        </div>
      </div>

      {/* ── RIGHT SIDE: SOPHISTICATED SIGN-IN FORM ── */}
      <div className="adminFormSide">
        <div className="formContainer">
          <div className="formHeader">
            <div className="formLogoBadge" style={{ background: "transparent", border: "none", boxShadow: "none", width: "auto", height: "auto", padding: "0 0 12px 0" }}>
              <img
                src={settings.logo || "/elores-logo.png"}
                alt="Elores Admin"
                style={{ height: "46px", width: "auto", maxWidth: "200px", objectFit: "contain" }}
                onError={(e) => { e.target.src = "/elores-logo.png"; }}
              />
            </div>
            <h1>Admin Authentication</h1>
            <p>Access the Elores operational dashboard with your assigned credentials.</p>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="adminAuthError">
              <ShieldCheck size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form className="authAdminForm" onSubmit={submit}>
            <div className="inputGroup">
              <label htmlFor="admin-email">Admin Email Address</label>
              <div className="inputFieldWrapper">
                <span className="inputIcon">
                  <Mail size={17} />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@elores.local"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="inputGroup">
              <div className="labelRow">
                <label htmlFor="admin-password">Secure Password</label>
                <button
                  type="button"
                  className="togglePasswordBtn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
              <div className="inputFieldWrapper">
                <span className="inputIcon">
                  <Lock size={17} />
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <div className="formOptionsRow">
              <label className="rememberMeCheckbox">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                />
                <span>Maintain active session on this workstation</span>
              </label>
            </div>

            <button type="submit" className="adminSignInButton" disabled={busy}>
              {busy ? (
                <>
                  <span className="buttonSpinner" />
                  <span>Verifying Credentials…</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper Card */}
          <div className="demoCredentialsBox">
            <div className="demoHeader">
              <KeyRound size={15} />
              <span>Default Credentials</span>
            </div>
            <div className="demoDetails">
              <div><code>admin@elores.local</code></div>
              <div><code>Admin@123</code> (Super Admin)</div>
            </div>
            <button type="button" className="fillDemoBtn" onClick={fillDemo}>
              ⚡ Auto-Fill Credentials
            </button>
          </div>

          <div className="formBottomNav">
            <Link href="/" className="backToStoreLink">
              <Store size={15} />
              <span>Return to Public Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
