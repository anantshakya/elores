'use client';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@/app/_lib/router-compat.jsx";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import { adminApi, money } from "@/app/admin/_lib/api.js";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";

export default function OrderFormPage(){
 const {id}=useParams();const nav=useNavigate();const toast=useAdminToast();const [order,setOrder]=useState(null);const [form,setForm]=useState({status:"Pending",tracking_number:"",tracking_url:"",payment_status:""});
 useEffect(()=>{adminApi("/admin/orders").then(d=>{const r=(d.data||[]).find(x=>String(x.id)===String(id));if(r){setOrder(r);setForm({status:r.status||"Pending",tracking_number:r.tracking_number||"",tracking_url:r.tracking_url||"",payment_status:r.payment_status||""});}});},[id]);
 async function submit(e){e.preventDefault();try{const d=await adminApi(`/admin/orders/${id}`,{method:"PUT",body:JSON.stringify(form)});toast.show(d.message||"Order updated");nav("/admin/orders");}catch(x){toast.show(x.message,"error");}}
 if(!order)return <div className="adminLoading">Loading order…</div>;
 return <><PageHeader title={`Edit Order ${order.order_number}`} subtitle={`${order.name} · ${money(order.total)}`} backTo="/admin/orders"/><form className="adminPanel formPanel narrowForm" onSubmit={submit}><label className="formField"><span>Status</span><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{["Pending","Confirmed","Packed","Shipped","Delivered","Cancelled","Returned"].map(x=><option key={x}>{x}</option>)}</select></label><label className="formField"><span>Payment Status</span><input value={form.payment_status} onChange={e=>setForm({...form,payment_status:e.target.value})}/></label><label className="formField"><span>Tracking Number</span><input value={form.tracking_number} onChange={e=>setForm({...form,tracking_number:e.target.value})}/></label><label className="formField"><span>Tracking URL</span><input value={form.tracking_url} onChange={e=>setForm({...form,tracking_url:e.target.value})}/></label><div className="formActions"><button type="button" className="secondaryAction" onClick={()=>nav("/admin/orders")}>Cancel</button><button className="primaryAction">Update Order</button></div></form></>;
}
