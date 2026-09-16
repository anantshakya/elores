'use client';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@/app/_lib/router-compat.jsx";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import { adminApi } from "@/app/admin/_lib/api.js";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";

const empty = {
  name: "", slug: "", sku: "", category_id: "", gender: "Women", price: "", sale_price: "", stock: 0,
  material: "", description: "", short_description: "", meta_title: "", meta_description: "", meta_keywords: "",
  badge: "", featured: 0, is_new: 0, active: 1, dimensions: "", weight: "", hsn_code: "", tax_rate: "", care_instructions: "", images: [],
};

export default function ProductFormPage() {
  const { id } = useParams();
  const edit = Boolean(id);
  const nav = useNavigate();
  const toast = useAdminToast();
  const [form, setForm] = useState(empty);
  const [cats, setCats] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminApi("/categories").then((d) => setCats(d.data || []));
    if (edit) adminApi("/admin/products").then((d) => {
      const row = (d.data || []).find((x) => String(x.id) === String(id));
      if (row) setForm({ ...empty, ...row, images: row.images || (row.image ? [row.image] : []) });
    });
  }, [id, edit]);

  async function upload(files) {
    const selected = [...files];
    if (!selected.length) return;
    if (form.images.length + selected.length > 5) return toast.show("Maximum 5 product images allowed", "error");
    if (selected.some((f) => f.size > 2 * 1024 * 1024)) return toast.show("Each image must be 2MB or smaller", "error");
    setBusy(true);
    try {
      const urls = [];
      for (const file of selected) {
        const fd = new FormData(); fd.append("file", file);
        const d = await adminApi("/admin/upload", { method: "POST", body: fd });
        urls.push(d.url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      toast.show(`${urls.length} image(s) uploaded`);
    } catch (e) { toast.show(e.message, "error"); }
    finally { setBusy(false); }
  }

  async function submit(e) {
    e.preventDefault();
    if (form.images.length < 1 || form.images.length > 5) return toast.show("Upload minimum 1 and maximum 5 images", "error");
    setBusy(true);
    try {
      const endpoint = edit ? `/admin/products/${id}` : "/admin/products";
      const d = await adminApi(endpoint, { method: edit ? "PUT" : "POST", body: JSON.stringify(form) });
      toast.show(d.message || (edit ? "Product updated" : "Product created"));
      nav("/admin/products");
    } catch (e2) { toast.show(e2.message, "error"); }
    finally { setBusy(false); }
  }

  const field = (label, key, type="text") => (
    <label className="formField"><span>{label}</span><input type={type} value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>
  );

  return (
    <>
      <PageHeader title={edit ? "Edit Product" : "Add New Product"} subtitle="Product details, inventory, media and SEO." backTo="/admin/products" />
      <form className="adminPanel formPanel" onSubmit={submit}>
        <section className="formSection"><h2>Basic Information</h2><div className="formGrid">
          {field("Product Name", "name")}{field("Slug", "slug")}{field("SKU", "sku")}
          <label className="formField"><span>Category</span><select value={form.category_id} onChange={(e)=>setForm({...form,category_id:e.target.value})}><option value="">Select category</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="formField"><span>Gender</span><select value={form.gender} onChange={(e)=>setForm({...form,gender:e.target.value})}><option>Women</option><option>Men</option><option>Unisex</option></select></label>
          {field("Badge", "badge")}
        </div></section>
        <section className="formSection"><h2>Pricing & Inventory</h2><div className="formGrid">{field("Price", "price", "number")}{field("Sale Price", "sale_price", "number")}{field("Stock", "stock", "number")}{field("Tax Rate", "tax_rate", "number")}{field("HSN Code", "hsn_code")}{field("Weight", "weight")}</div></section>
        <section className="formSection"><h2>Product Details</h2><div className="formGrid">{field("Material", "material")}{field("Dimensions", "dimensions")}</div><label className="formField full"><span>Short Description</span><textarea value={form.short_description||""} onChange={(e)=>setForm({...form,short_description:e.target.value})}/></label><label className="formField full"><span>Description</span><textarea rows="6" value={form.description||""} onChange={(e)=>setForm({...form,description:e.target.value})}/></label><label className="formField full"><span>Care Instructions</span><textarea value={form.care_instructions||""} onChange={(e)=>setForm({...form,care_instructions:e.target.value})}/></label></section>
        <section className="formSection"><h2>Images</h2><p className="helpText">Minimum 1, maximum 5 images. Maximum 2MB per image.</p><input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e)=>upload(e.target.files)} /><div className="mediaGrid">{form.images.map((img,i)=><div className="mediaItem" key={img+i}><img src={img} alt={`Product ${i+1}`} /><button type="button" onClick={()=>setForm({...form,images:form.images.filter((_,x)=>x!==i)})}>×</button>{i===0&&<small>Primary</small>}</div>)}</div></section>
        <section className="formSection"><h2>SEO</h2><div className="formGrid">{field("Meta Title", "meta_title")}{field("Meta Keywords", "meta_keywords")}</div><label className="formField full"><span>Meta Description</span><textarea value={form.meta_description||""} onChange={(e)=>setForm({...form,meta_description:e.target.value})}/></label></section>
        <section className="formSection"><h2>Visibility</h2><div className="checkGrid"><label><input type="checkbox" checked={Boolean(Number(form.active))} onChange={(e)=>setForm({...form,active:e.target.checked?1:0})}/> Active</label><label><input type="checkbox" checked={Boolean(Number(form.featured))} onChange={(e)=>setForm({...form,featured:e.target.checked?1:0})}/> Featured</label><label><input type="checkbox" checked={Boolean(Number(form.is_new))} onChange={(e)=>setForm({...form,is_new:e.target.checked?1:0})}/> New Arrival</label></div></section>
        <div className="formActions"><button type="button" className="secondaryAction" onClick={()=>nav("/admin/products")}>Cancel</button><button className="primaryAction" disabled={busy}>{busy?"Saving…":edit?"Update Product":"Create Product"}</button></div>
      </form>
    </>
  );
}
