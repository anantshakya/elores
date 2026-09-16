'use client';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@/app/_lib/router-compat.jsx";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import { adminApi } from "@/app/admin/_lib/api.js";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";

export default function CouponFormPage(){
  const {id}=useParams(); const edit=Boolean(id); const nav=useNavigate(); const toast=useAdminToast();
  const [f,setF]=useState({code:"",type:"percent",value:"",min_order:0,active:1,expires_at:""});
  useEffect(()=>{if(edit)adminApi("/admin/coupons").then(d=>{const r=(d.data||[]).find(x=>String(x.id)===String(id));if(r)setF({...r,expires_at:r.expires_at?r.expires_at.replace(" ","T").slice(0,16):""})})},[id,edit]);
  async function submit(e){e.preventDefault();try{const d=await adminApi(edit?`/admin/coupons/${id}`:"/admin/coupons",{method:edit?"PUT":"POST",body:JSON.stringify({...f,expires_at:f.expires_at?f.expires_at.replace("T"," ")+":00":null})});toast.show(d.message||"Coupon saved");nav("/admin/coupons")}catch(x){toast.show(x.message,"error")}}
  return (
    <>
      <PageHeader title={edit ? "Edit Coupon" : "Add New Coupon"} subtitle="Configure discount rules." backTo="/admin/coupons" />
      <form className="adminPanel formPanel" onSubmit={submit}>
        {/* First row: Code & Type */}
        <div className="formGrid formSection">
          <label className="formField">
            <span>Coupon Code</span>
            <input required value={f.code} onChange={e => setF({ ...f, code: e.target.value.toUpperCase() })} />
          </label>
          <label className="formField">
            <span>Type</span>
            <select value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>
              <option value="percent">Percent</option>
              <option value="fixed">Fixed</option>
            </select>
          </label>
        </div>
        {/* Second row: Value & Minimum Order */}
        <div className="formGrid formSection">
          <label className="formField">
            <span>Value</span>
            <input type="number" required value={f.value} onChange={e => setF({ ...f, value: e.target.value })} />
          </label>
          <label className="formField">
            <span>Minimum Order</span>
            <input type="number" value={f.min_order} onChange={e => setF({ ...f, min_order: e.target.value })} />
          </label>
        </div>
          {/* Row: Expires At & Active */}
          <div className="formGrid formSection">
            <label className="formField">
              <span>Expires At</span>
              <input type="datetime-local" value={f.expires_at || ""} onChange={e => setF({ ...f, expires_at: e.target.value })} />
            </label>
            <label className="switchRow">
              <input type="checkbox" checked={Boolean(Number(f.active))} onChange={e => setF({ ...f, active: e.target.checked ? 1 : 0 })} />
              <span>Active</span>
            </label>
          </div>
        <div className="formActions">
          <button type="button" className="secondaryAction" onClick={() => nav("/admin/coupons")}>Cancel</button>
          <button className="primaryAction">{edit ? "Update Coupon" : "Create Coupon"}</button>
        </div>
      </form>
    </>
  );
}
