'use client';

import { useEffect, useState, useMemo } from "react";
import { usePathname, useSearchParams, useParams, useRouter } from "next/navigation";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import { adminApi } from "@/app/admin/_lib/api.js";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";

const initialForm = {
  name: "",
  slug: "",
  sku: "",
  category_id: "",
  gender: "Women",
  price: "",
  sale_price: "",
  stock: 0,
  material: "",
  description: "",
  short_description: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  badge: "",
  featured: 0,
  is_new: 0,
  active: 1,
  dimensions: "",
  weight: "",
  hsn_code: "",
  tax_rate: "",
  care_instructions: "",
  images: [],
  variants: [],
  is_deleted: "not_deleted",
};

export default function ProductForm({ id: propId, isNew = false }) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const toast = useAdminToast();

  // Resolve ID from props, route params, query string, or URL pathname regex
  const resolvedId = useMemo(() => {
    if (isNew) return null;
    if (propId) return String(propId);
    if (routeParams?.id) return String(routeParams.id);
    if (searchParams && searchParams.get("id")) return String(searchParams.get("id"));

    // Extract ID from pathname patterns: /admin/products/20/edit, /admin/products/20, /admin/products/edit/20
    const match = pathname.match(/\/admin\/products?(?:\/edit)?\/(\d+)(?:\/edit)?/);
    if (match && match[1]) return String(match[1]);

    return null;
  }, [propId, routeParams, searchParams, pathname, isNew]);

  const isEdit = Boolean(resolvedId);

  const [form, setForm] = useState(initialForm);
  const [cats, setCats] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [allProducts, setAllProducts] = useState([]);

  // Load categories and product data
  useEffect(() => {
    let active = true;

    adminApi("/categories")
      .then((d) => {
        if (active) setCats(d.data || []);
      })
      .catch(() => {});

    if (isEdit && resolvedId) {
      setLoading(true);
      // Try direct show endpoint first
      adminApi(`/admin/products/${resolvedId}`)
        .then((res) => {
          if (!active) return;
          if (res?.data) {
            const p = res.data;
            setForm({
              ...initialForm,
              ...p,
              images: Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []),
              variants: Array.isArray(p.variants) ? p.variants : [],
            });
            setLoading(false);
          } else {
            throw new Error("Product data empty");
          }
        })
        .catch(() => {
          // Fallback: list all products and find matching ID
          adminApi("/admin/products")
            .then((res) => {
              if (!active) return;
              const list = res.data || [];
              setAllProducts(list);
              const found = list.find((x) => String(x.id) === String(resolvedId));
              if (found) {
                setForm({
                  ...initialForm,
                  ...found,
                  images: Array.isArray(found.images) && found.images.length ? found.images : (found.image ? [found.image] : []),
                  variants: Array.isArray(found.variants) ? found.variants : [],
                });
              } else {
                toast.show(`Product #${resolvedId} not found`, "error");
              }
            })
            .catch((err) => {
              if (active) toast.show(err.message || "Failed to load product", "error");
            })
            .finally(() => {
              if (active) setLoading(false);
            });
        });
    } else {
      setLoading(false);
      // If edit route accessed without ID, fetch products so user can select one
      if (pathname.includes("/edit")) {
        adminApi("/admin/products")
          .then((res) => {
            if (active) setAllProducts(res.data || []);
          })
          .catch(() => {});
      }
    }

    return () => {
      active = false;
    };
  }, [resolvedId, isEdit, pathname, toast]);

  async function upload(files) {
    const selected = [...files];
    if (!selected.length) return;
    if (form.images.length + selected.length > 5) {
      return toast.show("Maximum 5 product images allowed", "error");
    }
    if (selected.some((f) => f.size > 2 * 1024 * 1024)) {
      return toast.show("Each image must be 2MB or smaller", "error");
    }

    setBusy(true);
    try {
      const urls = [];
      for (const file of selected) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "products");
        const d = await adminApi("/admin/upload", { method: "POST", body: fd });
        if (d.url) urls.push(d.url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      toast.show(`${urls.length} image(s) uploaded`);
    } catch (e) {
      toast.show(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.show("Product name is required", "error");
    if (!form.category_id) return toast.show("Please select a category", "error");
    if (form.images.length < 1 || form.images.length > 5) {
      return toast.show("Upload minimum 1 and maximum 5 images", "error");
    }

    setBusy(true);
    try {
      const endpoint = isEdit ? `/admin/products/${resolvedId}` : "/admin/products";
      const method = isEdit ? "PUT" : "POST";
      const d = await adminApi(endpoint, {
        method,
        body: JSON.stringify(form),
      });

      toast.show(d.message || (isEdit ? "Product updated successfully" : "Product created successfully"));
      router.push("/admin/products");
    } catch (err) {
      toast.show(err.message || "Failed to save product", "error");
    } finally {
      setBusy(false);
    }
  }

  const field = (label, key, type = "text") => (
    <label className="formField">
      <span>{label}</span>
      <input
        type={type}
        value={form[key] ?? ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </label>
  );

  // If on an /edit path but no product ID was provided in URL or query
  if (!isEdit && !isNew && pathname.includes("/edit")) {
    return (
      <>
        <PageHeader
          title="Edit Product"
          subtitle="Select a product from the catalog to edit details."
          backTo="/admin/products"
        />
        <div className="adminPanel" style={{ padding: "30px", textAlign: "center" }}>
          <h3 style={{ marginBottom: "12px", color: "var(--admin-dark)" }}>No Product Selected</h3>
          <p style={{ color: "var(--admin-muted)", marginBottom: "20px" }}>
            Please select a product from the list below or return to the catalog table.
          </p>
          {allProducts.length > 0 ? (
            <div style={{ maxWidth: "420px", margin: "0 auto", textAlign: "left" }}>
              <label className="formField">
                <span>Select Product to Edit</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      router.push(`/admin/products/${e.target.value}/edit`);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Choose a product…</option>
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} - {p.name} ({p.sku || p.slug})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <button
              type="button"
              className="primaryAction"
              onClick={() => router.push("/admin/products")}
            >
              Go to Products Catalog
            </button>
          )}
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="adminPanel" style={{ padding: "50px", textAlign: "center", color: "var(--admin-muted)" }}>
        <div style={{ fontSize: "28px", marginBottom: "12px" }}>💎</div>
        <strong>Loading product details…</strong>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={isEdit ? `Edit Product: ${form.name || `#${resolvedId}`}` : "Add New Product"}
        subtitle="Manage product specifications, inventory, gallery, pricing and SEO."
        backTo="/admin/products"
      />

      <form className="adminPanel formPanel" onSubmit={submit}>
        {/* Basic Info */}
        <section className="formSection">
          <h2>Basic Information</h2>
          <div className="formGrid">
            {field("Product Name", "name")}
            {field("Slug (URL)", "slug")}
            {field("SKU Code", "sku")}

            <label className="formField">
              <span>Category *</span>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">Select category</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="formField">
              <span>Target Gender</span>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option>Women</option>
                <option>Men</option>
                <option>Unisex</option>
              </select>
            </label>

            {field("Badge Tag (e.g. Best Seller, New)", "badge")}
          </div>
        </section>

        {/* Pricing & Inventory */}
        <section className="formSection">
          <h2>Pricing & Inventory</h2>
          <div className="formGrid">
            {field("Regular Price (₹)", "price", "number")}
            {field("Sale Price (₹)", "sale_price", "number")}
            {field("Stock Count", "stock", "number")}
            {field("Tax Rate (%)", "tax_rate", "number")}
            {field("HSN Code", "hsn_code")}
            {field("Weight (g)", "weight")}
          </div>
        </section>

        {/* Product Variants & Options */}
        <section className="formSection">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h2 style={{ margin: 0 }}>Product Variants & Options</h2>
              <p className="helpText" style={{ margin: "4px 0 0" }}>
                Add options like Size, Metal finishes, or Lengths with custom SKU, Price, Sale Price, and Stock levels.
              </p>
            </div>
            <button
              type="button"
              className="dashBtn"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--admin-gold, #a57c36)", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
              onClick={() => {
                setForm((f) => ({
                  ...f,
                  variants: [
                    ...(f.variants || []),
                    {
                      title: "",
                      sku: f.sku ? `${f.sku}-V${(f.variants || []).length + 1}` : "",
                      price: f.price || "",
                      sale_price: f.sale_price || "",
                      stock: f.stock || 0,
                      active: 1,
                    },
                  ],
                }));
              }}
            >
              <span>+ Add Variant Option</span>
            </button>
          </div>

          {(form.variants && form.variants.length > 0) ? (
            <div style={{ overflowX: "auto", background: "#fff", borderRadius: "8px", border: "1px solid var(--admin-border, #e5e7eb)", padding: "12px" }}>
              <table className="adminTable" style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                    <th style={{ padding: "10px", width: "28%" }}>Variant Title *</th>
                    <th style={{ padding: "10px", width: "20%" }}>Variant SKU</th>
                    <th style={{ padding: "10px", width: "16%" }}>Price (₹)</th>
                    <th style={{ padding: "10px", width: "16%" }}>Sale Price (₹)</th>
                    <th style={{ padding: "10px", width: "12%" }}>Stock</th>
                    <th style={{ padding: "10px", width: "8%", textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {form.variants.map((v, idx) => (
                    <tr key={idx} style={{ borderTop: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "8px" }}>
                        <input
                          type="text"
                          placeholder="e.g. Size: 6 / Metal: Rose Gold"
                          value={v.title || ""}
                          required
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((f) => ({
                              ...f,
                              variants: f.variants.map((x, i) => i === idx ? { ...x, title: val } : x),
                            }));
                          }}
                          style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px" }}
                        />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input
                          type="text"
                          placeholder="e.g. RING-RG-06"
                          value={v.sku || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((f) => ({
                              ...f,
                              variants: f.variants.map((x, i) => i === idx ? { ...x, sku: val } : x),
                            }));
                          }}
                          style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px" }}
                        />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input
                          type="number"
                          placeholder={form.price || "0"}
                          value={v.price ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((f) => ({
                              ...f,
                              variants: f.variants.map((x, i) => i === idx ? { ...x, price: val } : x),
                            }));
                          }}
                          style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px" }}
                        />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input
                          type="number"
                          placeholder={form.sale_price || "0"}
                          value={v.sale_price ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((f) => ({
                              ...f,
                              variants: f.variants.map((x, i) => i === idx ? { ...x, sale_price: val } : x),
                            }));
                          }}
                          style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px" }}
                        />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input
                          type="number"
                          placeholder="0"
                          value={v.stock ?? 0}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((f) => ({
                              ...f,
                              variants: f.variants.map((x, i) => i === idx ? { ...x, stock: val } : x),
                            }));
                          }}
                          style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px" }}
                        />
                      </td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <button
                          type="button"
                          title="Remove Variant"
                          onClick={() => {
                            setForm((f) => ({
                              ...f,
                              variants: f.variants.filter((_, i) => i !== idx),
                            }));
                          }}
                          style={{
                            background: "#fee2e2",
                            color: "#b91c1c",
                            border: "none",
                            borderRadius: "6px",
                            width: "28px",
                            height: "28px",
                            cursor: "pointer",
                            fontSize: "16px",
                            lineHeight: "28px",
                          }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "20px", textAlign: "center", background: "#faf7f2", border: "1px dashed #d4b896", borderRadius: "8px", color: "#666", fontSize: "13px" }}>
              No variants defined. Click <strong>"+ Add Variant Option"</strong> above to create options like Size (6, 7, 8) or Finish (Gold Polish, Silver).
            </div>
          )}
        </section>

        {/* Product Details */}
        <section className="formSection">
          <h2>Product Details & Specifications</h2>
          <div className="formGrid">
            {field("Material / Metal", "material")}
            {field("Dimensions / Size", "dimensions")}
          </div>
          <label className="formField full">
            <span>Short Description</span>
            <textarea
              rows="2"
              value={form.short_description || ""}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              placeholder="Concise overview shown near the buy box"
            />
          </label>
          <label className="formField full">
            <span>Full Description</span>
            <textarea
              rows="6"
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed product story, craftsmanship, and materials"
            />
          </label>
          <label className="formField full">
            <span>Care Instructions</span>
            <textarea
              rows="3"
              value={form.care_instructions || ""}
              onChange={(e) => setForm({ ...form, care_instructions: e.target.value })}
              placeholder="e.g. Keep away from perfumes, store in airtight pouch"
            />
          </label>
        </section>

        {/* Images Gallery */}
        <section className="formSection">
          <h2>Image Gallery ({form.images.length}/5)</h2>
          <p className="helpText">
            Minimum 1, maximum 5 images. Maximum 2MB per image. The first image is the primary storefront thumbnail.
          </p>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => upload(e.target.files)}
            disabled={busy || form.images.length >= 5}
          />
          <div className="mediaGrid" style={{ marginTop: "16px" }}>
            {form.images.map((img, i) => (
              <div className="mediaItem" key={img + i}>
                <img src={img} alt={`Product ${i + 1}`} />
                <button
                  type="button"
                  title="Remove image"
                  onClick={() =>
                    setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })
                  }
                >
                  ×
                </button>
                {i === 0 && <small>Primary</small>}
              </div>
            ))}
          </div>
        </section>

        {/* SEO */}
        <section className="formSection">
          <h2>Search Engine Optimization (SEO)</h2>
          <div className="formGrid">
            {field("Meta Title", "meta_title")}
            {field("Meta Keywords", "meta_keywords")}
          </div>
          <label className="formField full">
            <span>Meta Description</span>
            <textarea
              rows="3"
              value={form.meta_description || ""}
              onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
              placeholder="Search engine summary (approx 160 characters)"
            />
          </label>
        </section>

        {/* Visibility & Status */}
        <section className="formSection">
          <h2>Visibility & Master Status</h2>
          <div className="checkGrid">
            <label>
              <input
                type="checkbox"
                checked={Boolean(Number(form.active))}
                onChange={(e) => setForm({ ...form, active: e.target.checked ? 1 : 0 })}
              />{" "}
              Active on Storefront
            </label>
            <label>
              <input
                type="checkbox"
                checked={Boolean(Number(form.featured))}
                onChange={(e) => setForm({ ...form, featured: e.target.checked ? 1 : 0 })}
              />{" "}
              Featured Product
            </label>
            <label>
              <input
                type="checkbox"
                checked={Boolean(Number(form.is_new))}
                onChange={(e) => setForm({ ...form, is_new: e.target.checked ? 1 : 0 })}
              />{" "}
              New Arrival Badge
            </label>
          </div>
        </section>

        {/* Actions */}
        <div className="formActions">
          <button
            type="button"
            className="secondaryAction"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </button>
          <button className="primaryAction" type="submit" disabled={busy}>
            {busy ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </>
  );
}
