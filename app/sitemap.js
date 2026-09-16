const API=process.env.API_URL||process.env.NEXT_PUBLIC_API_URL||'http://localhost:8080/api';
const SITE=process.env.NEXT_PUBLIC_SITE_URL||'https://elores.in';
export default async function sitemap(){
 const base=[{url:SITE,priority:1,changeFrequency:'daily'},{url:`${SITE}/shop`,priority:.9,changeFrequency:'daily'},{url:`${SITE}/contact`,priority:.5,changeFrequency:'monthly'}];
 try{const [pr,cr]=await Promise.all([fetch(`${API}/products?limit=100`,{next:{revalidate:3600}}),fetch(`${API}/categories`,{next:{revalidate:3600}})]); const pj=await pr.json(),cj=await cr.json(); return [...base,...(pj.data||[]).map(p=>({url:`${SITE}/product/${p.slug}`,lastModified:p.updated_at||p.created_at||new Date(),changeFrequency:'weekly',priority:.8})),...(cj.data||[]).map(c=>({url:`${SITE}/category/${c.slug}`,lastModified:c.updated_at||c.created_at||new Date(),changeFrequency:'weekly',priority:.7}))];}catch{return base;}
}
