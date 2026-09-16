'use client';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@/app/_lib/router-compat.jsx";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import { adminApi } from "@/app/admin/_lib/api.js";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";

export default function CategoryFormPage(){
  const {id}=useParams(); const edit=Boolean(id); const nav=useNavigate(); const toast=useAdminToast();
  const [form,setForm]=useState({name:"",slug:"",active:1});
  useEffect(()=>{ if(edit) adminApi("/categories").then(d=>{const r=(d.data||[]).find(x=>String(x.id)===String(id)); if(r)setForm(r);}); },[id,edit]);
  async function submit(e){e.preventDefault();try{const d=await adminApi(edit?`/admin/categories/${id}`:"/admin/categories",{method:edit?"PUT":"POST",body:JSON.stringify(form)});toast.show(d.message||"Category saved");nav("/admin/categories");}catch(x){toast.show(x.message,"error");}}
  return (
    <>
      <PageHeader title={edit ? "Edit Category" : "Add New Category"} subtitle="Create clear categories for product discovery." backTo="/admin/categories" />
      <form className="adminPanel formPanel" onSubmit={submit}>
        {/* First row: Name & Slug */}
        <div className="formGrid formSection">
          <label className="formField">
            <span>Category Name</span>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="formField">
            <span>Slug</span>
            <input value={form.slug || ""} onChange={e => setForm({ ...form, slug: e.target.value })} />
          </label>
        </div>
        {/* Active toggle */}
        <div className="formSection">
          <label className="switchRow">
            <input type="checkbox" checked={Boolean(Number(form.active))} onChange={e => setForm({ ...form, active: e.target.checked ? 1 : 0 })} />
            <span>Active</span>
          </label>
        </div>
        <div className="formActions">
          <button type="button" className="secondaryAction" onClick={() => nav("/admin/categories")}>Cancel</button>
          <button className="primaryAction">{edit ? "Update Category" : "Create Category"}</button>
        </div>
      </form>
    </>
  );
}
