import { notFound } from 'next/navigation';
import ProductPage from './ProductClient.jsx';
const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://elores.in';
async function getProduct(slug){
  const r=await fetch(`${API}/products/${encodeURIComponent(slug)}`,{next:{revalidate:300}});
  if(!r.ok) return null;
  const j=await r.json(); return j.data||null;
}
export async function generateMetadata({params}){
  const {slug}=await params; const p=await getProduct(slug); if(!p) return {title:'Product not found',robots:{index:false}};
  const description=p.meta_description||p.short_description||p.description||`Shop ${p.name} at Elores.`;
  const image=(p.images||[])[0]||p.image||'/elores-logo.png';
  return {title:p.meta_title||p.name,description,keywords:p.meta_keywords||undefined,alternates:{canonical:`/product/${p.slug}`},openGraph:{type:'website',title:p.meta_title||p.name,description,images:[image]},twitter:{card:'summary_large_image',title:p.meta_title||p.name,description,images:[image]}};
}
export default async function Page({params}){
  const {slug}=await params; const p=await getProduct(slug); if(!p) notFound();
  const image=(p.images||[])[0]||p.image||'/elores-logo.png';
  const jsonLd={"@context":"https://schema.org","@type":"Product",name:p.name,image:[image],description:p.meta_description||p.description,sku:p.sku||undefined,brand:{"@type":"Brand",name:"Elores"},offers:{"@type":"Offer",url:`${SITE}/product/${p.slug}`,priceCurrency:"INR",price:String(p.sale_price||p.price),availability:Number(p.stock)>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",itemCondition:"https://schema.org/NewCondition"},...(Number(p.rating_count)>0?{aggregateRating:{"@type":"AggregateRating",ratingValue:String(p.rating_average),reviewCount:String(p.rating_count)}}:{})};
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}}/><ProductPage initialProduct={p}/></>;
}
