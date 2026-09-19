'use client';
import { useEffect } from "react";
import { useAuthModal } from "@/app/_components/AuthModal.jsx";
import { useNavigate } from "@/app/_lib/router-compat";
import { SEO } from "@/app/_components/StorefrontCore.jsx";

export default function LoginPage() {
  const { openAuth } = useAuthModal();
  const nav = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("elores_customer_token")) {
      nav("/account");
    } else {
      openAuth("login");
    }
  }, []);

  return (
    <>
      <SEO title="Sign In | Elores Jewellery" />
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#786F68", fontSize: "14px" }}>Opening secure sign in...</p>
      </div>
    </>
  );
}

