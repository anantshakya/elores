'use client';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@/app/_lib/router-compat.jsx";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import { adminApi, getImageUrl } from "@/app/admin/_lib/api.js";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export default function CategoryForm() {
  const { id } = useParams();
  const edit = Boolean(id);
  const nav = useNavigate();
  const toast = useAdminToast();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    image: "",
    active: 1,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (edit) {
      adminApi("/categories").then((d) => {
        const r = (d.data || []).find((x) => String(x.id) === String(id));
        if (r) {
          setForm({
            name: r.name || "",
            slug: r.slug || "",
            image: r.image || "",
            active: isset(r.active) ? Number(r.active) : 1,
          });
        }
      });
    }
  }, [id, edit]);

  function isset(val) {
    return val !== undefined && val !== null;
  }

  async function handleFileUpload(file) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      return toast.show("Image size must be 3MB or smaller", "error");
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "categories");
    try {
      const res = await adminApi("/admin/upload", {
        method: "POST",
        body: fd,
      });
      setForm((prev) => ({ ...prev, image: res.url }));
      toast.show("Category image uploaded successfully!");
    } catch (err) {
      toast.show(err.message || "Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      return toast.show("Category name is required", "error");
    }
    if (!form.image) {
      return toast.show("Minimum 1 Category Image is required", "error");
    }

    try {
      const d = await adminApi(edit ? `/admin/categories/${id}` : "/admin/categories", {
        method: edit ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      toast.show(d.message || "Category saved successfully");
      nav("/admin/categories");
    } catch (x) {
      toast.show(x.message || "Error saving category", "error");
    }
  }

  return (
    <>
      <PageHeader
        title={edit ? "Edit Category" : "Add New Category"}
        subtitle="Create clear categories with mandatory showcase image for storefront discovery."
        backTo="/admin/categories"
      />
      <form className="adminPanel formPanel" onSubmit={submit}>
        {/* Name & Slug */}
        <div className="formGrid formSection">
          <label className="formField">
            <span>Category Name <strong style={{ color: "#b3261e" }}>*</strong></span>
            <input
              required
              placeholder="e.g. Necklaces, Rings, Bracelets"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="formField">
            <span>Slug (URL path)</span>
            <input
              placeholder="Auto-generated if left blank"
              value={form.slug || ""}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </label>
        </div>

        {/* Mandatory Image Upload Section */}
        <div className="formSection">
          <label className="formField">
            <span>Category Image <strong style={{ color: "#b3261e" }}>* (Min 1 Image Required)</strong></span>
          </label>
          
          <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {form.image ? (
              <div
                style={{
                  position: "relative",
                  width: "160px",
                  height: "160px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "2px solid #a57c36",
                  background: "#1c1714",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <img
                  src={getImageUrl(form.image)}
                  alt="Category preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: "" })}
                  title="Remove image"
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    background: "rgba(0,0,0,0.7)",
                    color: "#fff",
                    border: 0,
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                style={{
                  border: "2px dashed #d4b896",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                  background: "#faf7f2",
                  cursor: "pointer",
                  maxWidth: "420px",
                  transition: "all 0.2s ease",
                }}
                onClick={() => document.getElementById("catImageInput")?.click()}
              >
                <ImageIcon size={32} color="#a57c36" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 600, fontSize: "14px", color: "#231f1c" }}>
                  {uploading ? "Uploading image..." : "Upload Category Image (Required)"}
                </div>
                <small style={{ color: "#746d67" }}>PNG, JPG, WEBP up to 3MB</small>
              </div>
            )}

            <input
              id="catImageInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
            />

            {!form.image && (
              <button
                type="button"
                className="dashBtn"
                style={{ width: "fit-content" }}
                onClick={() => document.getElementById("catImageInput")?.click()}
                disabled={uploading}
              >
                <Upload size={15} />
                <span>{uploading ? "Uploading..." : "Choose Image File"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Toggle */}
        <div className="formSection">
          <label className="switchRow">
            <input
              type="checkbox"
              checked={Boolean(Number(form.active))}
              onChange={(e) => setForm({ ...form, active: e.target.checked ? 1 : 0 })}
            />
            <span>Active (Visible on storefront)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="formActions">
          <button
            type="button"
            className="secondaryAction"
            onClick={() => nav("/admin/categories")}
          >
            Cancel
          </button>
          <button className="primaryAction" disabled={uploading}>
            {edit ? "Update Category" : "Create Category"}
          </button>
        </div>
      </form>
    </>
  );
}
