'use client';
import React, { useEffect, useState } from "react";
import { useParams } from "@/app/_lib/router-compat";
import { api, SEO } from "@/app/_components/StorefrontCore.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

export default function ContentPage() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  useEffect(() => {
    api("/pages/" + slug)
      .then((d) => setP(d.data))
      .catch(() => setP(null));
  }, [slug]);
  if (!p) return <NotFoundPage />;
  return (
    <section className="section prose">
      <SEO
        title={p.meta_title || `${p.title} | Elores`}
        description={p.meta_description || p.content.slice(0, 150)}
      />
      <small>ELORES</small>
      <h1>{p.title}</h1>
      {String(p.content)
        .split("\n")
        .map((x, i) => (
          <p key={i}>{x}</p>
        ))}
    </section>
  );
}
