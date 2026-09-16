'use client';
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { useParams } from "@/app/_lib/router-compat.jsx";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import { adminApi, money } from "@/app/admin/_lib/api.js";

export default function InvoicePage(){
 const {id}=useParams();const [data,setData]=useState(null);
 useEffect(()=>{adminApi(`/admin/orders/${id}/invoice`).then(d=>setData(d.data));},[id]);
 if(!data)return <div className="adminLoading">Preparing invoice…</div>;
 const {o,items,settings}=data;
 return <><PageHeader title="Invoice" subtitle={o.invoice_number||o.order_number} backTo="/admin/orders"/><div className="adminPanel invoiceView"><div className="invoiceHeader"><div><h2>{settings.store_name||"Elores"}</h2><p>{settings.support_email}</p><p>{settings.support_phone}</p></div><div><strong>{o.invoice_number}</strong><p>Order: {o.order_number}</p><p>{o.created_at}</p></div></div><div className="invoiceAddress"><div><small>BILL TO</small><h3>{o.name}</h3><p>{o.email}</p><p>{o.phone}</p></div><div><small>SHIP TO</small><p>{o.address}</p><p>{o.city}, {o.state} - {o.pincode}</p></div></div><div className="tableResponsive"><table className="adminTable"><thead><tr><th>Sr No</th><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>{items.map((x,i)=><tr key={x.id}><td>{i+1}</td><td>{x.product_name}</td><td>{x.qty}</td><td>{money(x.price)}</td><td>{money(x.line_total)}</td></tr>)}</tbody></table></div><div className="invoiceTotals"><p><span>Subtotal</span><b>{money(o.subtotal)}</b></p><p><span>Shipping</span><b>{money(o.shipping)}</b></p>{Number(o.discount||0)>0&&<p><span>Discount</span><b>-{money(o.discount)}</b></p>}<p className="grand"><span>Grand Total</span><b>{money(o.total)}</b></p></div><button className="primaryAction printOnlyButton" onClick={()=>window.print()}><Printer size={16}/> Print / Save PDF</button></div></>;
}
