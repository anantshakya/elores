import Link from 'next/link';
import { notFound } from 'next/navigation';
const API=process.env.API_URL||process.env.NEXT_PUBLIC_API_URL||'http://localhost:8080/api';
async function products(slug){
  try {
    const r=await fetch(`${API}/products?category=${encodeURIComponent(slug)}&limit=48`,{next:{revalidate:300}});
    if(!r.ok) return [];
    const text = await r.text();
    if (!text || text.trim().startsWith('<')) return [];
    const j = JSON.parse(text);
    return j.data||[];
  } catch (e) {
    console.error('category products error:', e);
    return [];
  }
}
export async function generateMetadata({params}){const {slug}=await params; const name=slug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); return {title:`${name} Jewellery`,description:`Shop ${name.toLowerCase()} at Elores. Modern, skin-friendly and anti-tarnish jewellery.`,alternates:{canonical:`/category/${slug}`}};}
export default async function Category({params}){const {slug}=await params; const list=await products(slug); const name=(list[0]?.category_name)||slug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); if(!list.length) notFound(); return <section className="section"><div className="sectionHead"><div><small>SHOP ELORES</small><h1>{name}</h1></div></div><div className="productGrid">{list.map(p=><article className="productCard" key={p.id}><Link href={`/product/${p.slug}`}><div className="productImage">{p.image&&<img src={p.image} alt={p.name}/>}</div><h2 style={{fontSize:'1rem'}}>{p.name}</h2><p>₹{Number(p.sale_price||p.price).toLocaleString('en-IN')}</p></Link></article>)}</div></section>}
