'use client';
import { useEffect, useState } from "react";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import { adminApi } from "@/app/admin/_lib/api.js";
export default function AnalyticsPage(){const[d,setD]=useState({events:[],abandoned_carts:0,subscribers:0});useEffect(()=>{adminApi("/admin/analytics").then(setD);},[]);return <><PageHeader title="Analytics" subtitle="Store engagement snapshot."/><div className="statGrid"><article className="statCard"><strong>{d.abandoned_carts}</strong><span>Abandoned Carts</span></article><article className="statCard"><strong>{d.subscribers}</strong><span>Newsletter Subscribers</span></article>{(d.events||[]).map(x=><article className="statCard" key={x.event_name}><strong>{x.total}</strong><span>{x.event_name.replaceAll("_"," ")}</span></article>)}</div></>}
