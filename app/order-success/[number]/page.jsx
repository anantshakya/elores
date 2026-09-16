'use client';
import React from "react";
import { Link, useParams } from "@/app/_lib/router-compat";
import { SEO } from "@/app/_components/StorefrontCore.jsx";

export default function OrderSuccessPage() {
  const { number } = useParams();
  return (
    <section className="success">
      <SEO title="Order Confirmed | Elores" />
      <div>✓</div>
      <small>ORDER CONFIRMED</small>
      <h1>Thank you for choosing Elores.</h1>
      <p>
        Your order number is <b>{number}</b>.
      </p>
      <p>
        A confirmation notification has been queued for your email/WhatsApp
        contact.
      </p>
      <Link className="btn dark" to="/shop">
        Continue shopping
      </Link>
    </section>
  );
}
