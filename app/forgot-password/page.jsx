'use client';
import { useEffect } from "react";
import { useAuthModal } from "@/app/_components/AuthModal.jsx";
import { SEO } from "@/app/_components/StorefrontCore.jsx";

export default function ForgotPasswordPage() {
  const { openAuth } = useAuthModal();

  useEffect(() => {
    openAuth("forgot");
  }, []);

  return (
    <>
      <SEO title="Reset Password | Elores Jewellery" />
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#786F68", fontSize: "14px" }}>Opening password reset...</p>
      </div>
    </>
  );
}
