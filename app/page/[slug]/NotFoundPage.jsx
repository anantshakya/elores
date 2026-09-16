'use client';
import React from "react";

export default function NotFoundPage() {
  return (
    <section className="not-found" style={{
      minHeight: "70vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
      color: "#333",
      padding: "2rem",
      borderRadius: "1rem",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
    }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Page Not Found</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        The content you are looking for does not exist or could not be loaded.
      </p>
      <a href="/" style={{
        padding: "0.75rem 1.5rem",
        backgroundColor: "#4a90e2",
        color: "#fff",
        borderRadius: "0.5rem",
        textDecoration: "none",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
      }}>
        Return Home
      </a>
    </section>
  );
}
