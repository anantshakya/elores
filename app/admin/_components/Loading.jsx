'use client';
export default function Loading({ text = "Loading…" }) {
  return <div className="adminLoading">{text}</div>;
}
