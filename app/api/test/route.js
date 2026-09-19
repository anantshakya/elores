export async function GET() {
  const token = 'fake';
  // Let's call dashboard via internal or test
  const api = 'http://localhost/elores_ecom/elores_backend/api/admin/login';
  const loginRes = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@elores.local', password: 'Admin@123' }),
  });
  const loginJson = await loginRes.json();
  const tokenVal = loginJson.token;

  const dashRes = await fetch('http://localhost/elores_ecom/elores_backend/api/admin/dashboard', {
    headers: { 'Authorization': `Bearer ${tokenVal}` }
  });
  const dashJson = await dashRes.json();
  return Response.json({
    status: dashRes.status,
    summary: dashJson.summary,
    trendDays: dashJson.trend?.length,
    categories: dashJson.categories?.length,
    recentOrders: dashJson.recent_orders?.length,
    topProducts: dashJson.top_products?.length,
  });
}
