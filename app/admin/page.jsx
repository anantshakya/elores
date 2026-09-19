'use client';
import { useEffect, useState, useMemo } from "react";
import { 
  IndianRupee, 
  Package, 
  ShoppingCart, 
  Clock3, 
  TrendingUp, 
  ArrowUpRight, 
  Users, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Printer, 
  ExternalLink, 
  ShoppingBag, 
  CreditCard, 
  PlusCircle, 
  Percent, 
  MessageSquare,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Link } from "@/app/_lib/router-compat.jsx";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import { adminApi, money } from "@/app/admin/_lib/api.js";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d"); // "today" | "7d" | "30d" | "all"
  const [chartMode, setChartMode] = useState("revenue"); // "revenue" | "orders"
  const [hoverPoint, setHoverPoint] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = (range = timeRange) => {
    setIsRefreshing(true);
    adminApi(`/admin/dashboard?range=${range}`)
      .then((res) => {
        setData(res);
        setLoading(false);
        setIsRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setIsRefreshing(false);
      });
  };

  const handleRangeChange = (r) => {
    setTimeRange(r);
    loadDashboard(r);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = data?.summary || {
    revenue: 0,
    today_revenue: 0,
    month_revenue: 0,
    aov: 0,
    orders: 0,
    today_orders: 0,
    pending_orders: 0,
    processing_orders: 0,
    shipped_orders: 0,
    delivered_orders: 0,
    cancelled_orders: 0,
    products: 0,
    low_stock: 0,
    out_of_stock: 0,
    customers: 0,
    subscribers: 0,
    abandoned_carts: 0,
    payment_split: { cod: 0, online: 0 }
  };

  const trend = useMemo(() => {
    if (data?.trend && Array.isArray(data.trend) && data.trend.length > 0) {
      return data.trend;
    }
    // Default fallback 7 days
    return [
      { date: "Day 1", revenue: 0, orders: 0 },
      { date: "Day 2", revenue: 0, orders: 0 },
      { date: "Day 3", revenue: 0, orders: 0 },
      { date: "Day 4", revenue: 0, orders: 0 },
      { date: "Day 5", revenue: 0, orders: 0 },
      { date: "Day 6", revenue: 0, orders: 0 },
      { date: "Day 7", revenue: 0, orders: 0 }
    ];
  }, [data]);

  // SVG Trend Chart Calculations
  const chartWidth = 650;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const chartData = useMemo(() => {
    const values = trend.map((t) => (chartMode === "revenue" ? t.revenue : t.orders));
    const maxVal = Math.max(...values, chartMode === "revenue" ? 5000 : 5);
    const minVal = 0;

    const points = trend.map((item, idx) => {
      const val = chartMode === "revenue" ? item.revenue : item.orders;
      const x = paddingX + (idx / Math.max(trend.length - 1, 1)) * (chartWidth - paddingX * 2);
      const ratio = (val - minVal) / (maxVal - minVal || 1);
      const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
      return { x, y, val, date: item.date, raw: item };
    });

    // Build SVG Path (smooth curve)
    let pathD = "";
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX = (p0.x + p1.x) / 2;
        pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
      }
    }

    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
      : "";

    const totalVal = values.reduce((a, b) => a + b, 0);
    const avgVal = Math.round(totalVal / (values.length || 1));
    const peakPoint = points.reduce((prev, curr) => (curr.val > prev.val ? curr : prev), points[0] || { val: 0 });

    return { points, pathD, areaD, maxVal, totalVal, avgVal, peakPoint };
  }, [trend, chartMode]);

  // Donut Chart calculations for categories
  const categories = useMemo(() => {
    const list = data?.categories || [];
    if (list.length === 0) {
      return [
        { name: "Jewelry & Sets", count: summary.products || 1, color: "#c59b27" }
      ];
    }
    const colors = ["#c59b27", "#a57c36", "#1557a6", "#19704a", "#6243a5", "#d97706", "#db2777"];
    const totalCount = list.reduce((acc, c) => acc + (parseInt(c.count || c.product_count) || 0), 0) || 1;

    let cumulativeAngle = 0;
    return list.map((cat, idx) => {
      const count = parseInt(cat.count || cat.product_count) || 0;
      const percent = Math.round((count / totalCount) * 100);
      const angle = (count / totalCount) * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;
      return {
        ...cat,
        count,
        percent,
        color: colors[idx % colors.length],
        startAngle,
        angle
      };
    });
  }, [data, summary.products]);

  // Helper for Donut SVG Paths
  const createArc = (startAngle, endAngle, radius, innerRadius) => {
    const toRad = (deg) => ((deg - 90) * Math.PI) / 180.0;
    const start = toRad(startAngle);
    const end = toRad(endAngle);

    const x1 = 85 + radius * Math.cos(start);
    const y1 = 85 + radius * Math.sin(start);
    const x2 = 85 + radius * Math.cos(end);
    const y2 = 85 + radius * Math.sin(end);

    const x3 = 85 + innerRadius * Math.cos(end);
    const y3 = 85 + innerRadius * Math.sin(end);
    const x4 = 85 + innerRadius * Math.cos(start);
    const y4 = 85 + innerRadius * Math.sin(start);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  // Payment method totals & percentages
  const codCount = summary.payment_split?.cod || 0;
  const onlineCount = summary.payment_split?.online || 0;
  const totalPaidOrders = codCount + onlineCount || 1;
  const codPercent = Math.round((codCount / totalPaidOrders) * 100);
  const onlinePercent = 100 - codPercent;

  // Fulfillment pipeline percentages
  const totalOrdersPipeline = summary.orders || 1;

  return (
    <>
      <PageHeader 
        title="Store Intelligence" 
        subtitle="Real-time analytics, revenue metrics, and inventory performance."
      />

      {/* Top Action Toolbar */}
      <div className="dashTopBar">
        <div className="dashLiveBadge">
          <span className="livePulseDot" />
          <span>Real-time Store Pulse</span>
          <span style={{ color: "var(--admin-muted)", fontSize: "12px", marginLeft: "6px" }}>
            Updated just now
          </span>
        </div>

        <div className="dashActionsGroup">
          <div className="timeFilterPillGroup">
            <button 
              className={`timeFilterBtn ${timeRange === "today" ? "active" : ""}`}
              onClick={() => handleRangeChange("today")}
            >
              Today
            </button>
            <button 
              className={`timeFilterBtn ${timeRange === "7d" ? "active" : ""}`}
              onClick={() => handleRangeChange("7d")}
            >
              7 Days
            </button>
            <button 
              className={`timeFilterBtn ${timeRange === "30d" ? "active" : ""}`}
              onClick={() => handleRangeChange("30d")}
            >
              30 Days
            </button>
            <button 
              className={`timeFilterBtn ${timeRange === "all" ? "active" : ""}`}
              onClick={() => handleRangeChange("all")}
            >
              All Time
            </button>
          </div>

          <button 
            className="dashBtn" 
            onClick={loadDashboard} 
            title="Refresh dashboard data"
          >
            <RefreshCw size={14} className={isRefreshing ? "spin" : ""} />
            <span>Refresh</span>
          </button>

          <button 
            className="dashBtn" 
            onClick={() => window.print()} 
            title="Print executive sales report"
          >
            <Printer size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Executive KPI Cards Grid */}
      <div className="dashKpiGrid">
        {/* Card 1: Gross Revenue */}
        <div className="dashKpiCard gold">
          <div className="kpiTopRow">
            <span className="kpiLabel">Total GMV Revenue</span>
            <div className="kpiIconWrap">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="kpiValue">{money(summary.revenue)}</div>
          <div className="kpiFooter">
            <span className="kpiTrendPill positive">
              <TrendingUp size={12} />
              Month: {money(summary.month_revenue)}
            </span>
            <span className="kpiSubText">
              Today: {money(summary.today_revenue)}
            </span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="dashKpiCard blue">
          <div className="kpiTopRow">
            <span className="kpiLabel">Orders Volume</span>
            <div className="kpiIconWrap">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="kpiValue">{summary.orders}</div>
          <div className="kpiFooter">
            <span className="kpiTrendPill positive">
              <ArrowUpRight size={12} />
              {summary.today_orders} New Today
            </span>
            <span className="kpiSubText">
              AOV: {money(summary.aov)}
            </span>
          </div>
        </div>

        {/* Card 3: Active Catalog & Inventory */}
        <div className="dashKpiCard green">
          <div className="kpiTopRow">
            <span className="kpiLabel">Catalog & Stock</span>
            <div className="kpiIconWrap">
              <Package size={20} />
            </div>
          </div>
          <div className="kpiValue">{summary.products} <small style={{ fontSize: "14px", fontWeight: 500 }}>Items</small></div>
          <div className="kpiFooter">
            {summary.low_stock > 0 ? (
              <span className="kpiTrendPill warning" title="Items with stock 5 or less">
                <AlertTriangle size={12} />
                {summary.low_stock} Low Stock
              </span>
            ) : (
              <span className="kpiTrendPill positive">
                <CheckCircle2 size={12} />
                Stock Healthy
              </span>
            )}
            <span className="kpiSubText">
              {summary.out_of_stock} Out of Stock
            </span>
          </div>
        </div>

        {/* Card 4: Customers & Engagement */}
        <div className="dashKpiCard purple">
          <div className="kpiTopRow">
            <span className="kpiLabel">Customers & Reach</span>
            <div className="kpiIconWrap">
              <Users size={20} />
            </div>
          </div>
          <div className="kpiValue">{summary.customers}</div>
          <div className="kpiFooter">
            <span className="kpiTrendPill neutral">
              <Mail size={12} />
              {summary.subscribers} Newsletter
            </span>
            <span className="kpiSubText">
              {summary.abandoned_carts} Carts Left
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Analytics Section (Interactive SVG Trend + Donut Share) */}
      <div className="dashChartsGrid">
        {/* Left: Interactive Revenue & Volume Velocity Chart */}
        <div className="chartCard">
          <div className="chartCardHeader">
            <div className="chartTitleWrap">
              <h3>Revenue Velocity & Volume Curve</h3>
              <p>Daily performance trajectory across the active sales cycle</p>
            </div>
            <div className="chartModeToggle">
              <button 
                className={`chartModeBtn ${chartMode === "revenue" ? "active" : ""}`}
                onClick={() => setChartMode("revenue")}
              >
                Revenue (₹)
              </button>
              <button 
                className={`chartModeBtn ${chartMode === "orders" ? "active" : ""}`}
                onClick={() => setChartMode("orders")}
              >
                Orders Count
              </button>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="svgChartWrap">
            <svg 
              className="svgChartContainer" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c59b27" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#c59b27" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a57c36" />
                  <stop offset="100%" stopColor="#e5b955" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = paddingY + ratio * (chartHeight - paddingY * 2);
                return (
                  <line 
                    key={i} 
                    x1={paddingX} 
                    y1={y} 
                    x2={chartWidth - paddingX} 
                    y2={y} 
                    stroke="#ede8e3" 
                    strokeDasharray="4 4" 
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area Under Curve */}
              {chartData.areaD && (
                <path d={chartData.areaD} fill="url(#curveGradient)" />
              )}

              {/* Smooth Bezier Line */}
              {chartData.pathD && (
                <path 
                  d={chartData.pathD} 
                  fill="none" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Interactive Data Points */}
              {chartData.points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    className="chartDataPoint"
                    cx={pt.x}
                    cy={pt.y}
                    r={hoverPoint?.raw?.date === pt.date ? 7 : 4.5}
                    fill={hoverPoint?.raw?.date === pt.date ? "#ffffff" : "#a57c36"}
                    stroke="#a57c36"
                    strokeWidth="3"
                    onMouseEnter={() => setHoverPoint(pt)}
                    onMouseLeave={() => setHoverPoint(null)}
                  />
                  {/* Date labels on bottom axis */}
                  <text 
                    x={pt.x} 
                    y={chartHeight - 6} 
                    fontSize="10" 
                    fill="#88817a" 
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {pt.date}
                  </text>
                </g>
              ))}
            </svg>

            {/* Floating Tooltip */}
            {hoverPoint && (
              <div 
                className="chartTooltip" 
                style={{ 
                  left: `${(hoverPoint.x / chartWidth) * 100}%`, 
                  top: `${(hoverPoint.y / chartHeight) * 100}%` 
                }}
              >
                <span>{hoverPoint.date}</span>
                <strong>
                  {chartMode === "revenue" ? money(hoverPoint.val) : `${hoverPoint.val} Orders`}
                </strong>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>
                  {chartMode === "revenue" ? `${hoverPoint.raw.orders} orders placed` : `₹${hoverPoint.raw.revenue} generated`}
                </span>
              </div>
            )}
          </div>

          {/* Chart Footer Metrics */}
          <div className="chartFooterMetrics">
            <div className="chartFooterItem">
              <span>Peak Day Performance</span>
              <strong>
                {chartMode === "revenue" ? money(chartData.peakPoint.val) : `${chartData.peakPoint.val} Orders`}
              </strong>
            </div>
            <div className="chartFooterItem">
              <span>Daily Average Run-Rate</span>
              <strong>
                {chartMode === "revenue" ? money(chartData.avgVal) : `${chartData.avgVal} Orders/day`}
              </strong>
            </div>
            <div className="chartFooterItem">
              <span>Cycle Cumulative</span>
              <strong>
                {chartMode === "revenue" ? money(chartData.totalVal) : `${chartData.totalVal} Total Orders`}
              </strong>
            </div>
          </div>
        </div>

        {/* Right: Circular Donut Chart for Category Distribution */}
        <div className="chartCard">
          <div className="chartCardHeader">
            <div className="chartTitleWrap">
              <h3>Category Share</h3>
              <p>Inventory distribution across collections</p>
            </div>
          </div>

          <div className="donutVisualWrap">
            <div className="donutSvgBox">
              <svg width="170" height="170" viewBox="0 0 170 170">
                {categories.map((cat, i) => {
                  if (categories.length === 1) {
                    return (
                      <circle
                        key={i}
                        cx="85"
                        cy="85"
                        r="60"
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="24"
                      />
                    );
                  }
                  const start = cat.startAngle;
                  const end = cat.startAngle + cat.angle - 1.5;
                  return (
                    <path
                      key={i}
                      d={createArc(start, end, 72, 50)}
                      fill={cat.color}
                    />
                  );
                })}
              </svg>
              <div className="donutCenterInfo">
                <span className="donutCenterCount">{summary.products}</span>
                <span className="donutCenterLabel">Products</span>
              </div>
            </div>

            <div className="donutLegendList">
              {categories.map((cat, i) => (
                <div className="donutLegendRow" key={i}>
                  <span className="donutLegendName">
                    <span 
                      className="donutLegendColor" 
                      style={{ background: cat.color }} 
                    />
                    {cat.name}
                  </span>
                  <span className="donutLegendVal">
                    {cat.count} items ({cat.percent}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline & Payment Velocity Row */}
      <div className="dashSecondaryGrid">
        {/* Order Fulfillment Funnel */}
        <div className="pipelineCard">
          <div className="chartTitleWrap">
            <h3>Order Fulfillment Funnel</h3>
            <p>Live status distribution of all processed store orders</p>
          </div>

          <div className="pipelineBarsGroup">
            {/* Pending */}
            <div className="pipelineBarRow">
              <div className="pipelineBarMeta">
                <span style={{ color: "#d99a26" }}>Pending Confirmation</span>
                <span>{summary.pending_orders} ({Math.round((summary.pending_orders / totalOrdersPipeline) * 100)}%)</span>
              </div>
              <div className="pipelineTrack">
                <div 
                  className="pipelineFill pending" 
                  style={{ width: `${(summary.pending_orders / totalOrdersPipeline) * 100}%` }} 
                />
              </div>
            </div>

            {/* Processing */}
            <div className="pipelineBarRow">
              <div className="pipelineBarMeta">
                <span style={{ color: "#2563eb" }}>In Production / Packaging</span>
                <span>{summary.processing_orders} ({Math.round((summary.processing_orders / totalOrdersPipeline) * 100)}%)</span>
              </div>
              <div className="pipelineTrack">
                <div 
                  className="pipelineFill processing" 
                  style={{ width: `${(summary.processing_orders / totalOrdersPipeline) * 100}%` }} 
                />
              </div>
            </div>

            {/* Shipped */}
            <div className="pipelineBarRow">
              <div className="pipelineBarMeta">
                <span style={{ color: "#7c3aed" }}>Dispatched / In Transit</span>
                <span>{summary.shipped_orders} ({Math.round((summary.shipped_orders / totalOrdersPipeline) * 100)}%)</span>
              </div>
              <div className="pipelineTrack">
                <div 
                  className="pipelineFill shipped" 
                  style={{ width: `${(summary.shipped_orders / totalOrdersPipeline) * 100}%` }} 
                />
              </div>
            </div>

            {/* Delivered */}
            <div className="pipelineBarRow">
              <div className="pipelineBarMeta">
                <span style={{ color: "#16a34a" }}>Delivered Successfully</span>
                <span>{summary.delivered_orders} ({Math.round((summary.delivered_orders / totalOrdersPipeline) * 100)}%)</span>
              </div>
              <div className="pipelineTrack">
                <div 
                  className="pipelineFill delivered" 
                  style={{ width: `${(summary.delivered_orders / totalOrdersPipeline) * 100}%` }} 
                />
              </div>
            </div>

            {/* Cancelled */}
            <div className="pipelineBarRow">
              <div className="pipelineBarMeta">
                <span style={{ color: "#dc2626" }}>Cancelled / Refunded</span>
                <span>{summary.cancelled_orders} ({Math.round((summary.cancelled_orders / totalOrdersPipeline) * 100)}%)</span>
              </div>
              <div className="pipelineTrack">
                <div 
                  className="pipelineFill cancelled" 
                  style={{ width: `${(summary.cancelled_orders / totalOrdersPipeline) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Split & Velocity */}
        <div className="pipelineCard">
          <div className="chartTitleWrap">
            <h3>Payment Channels & Settlement Split</h3>
            <p>Cash on Delivery vs Online prepaid transaction distribution</p>
          </div>

          <div className="paymentSplitBar">
            <div 
              className="paymentFillCod" 
              style={{ width: `${codPercent}%` }} 
              title={`COD: ${codPercent}%`} 
            />
            <div 
              className="paymentFillOnline" 
              style={{ width: `${onlinePercent}%` }} 
              title={`Online: ${onlinePercent}%`} 
            />
          </div>

          <div className="paymentSplitDetails">
            <div className="paymentSplitItem">
              <div className="paymentSplitHeader">
                <span className="dot" style={{ background: "#a57c36" }} />
                Cash On Delivery
              </div>
              <div className="paymentSplitAmount">{codCount} Orders</div>
              <div className="paymentSplitPercent">{codPercent}% of total volume</div>
            </div>

            <div className="paymentSplitItem">
              <div className="paymentSplitHeader">
                <span className="dot" style={{ background: "#1557a6" }} />
                Online / Prepaid
              </div>
              <div className="paymentSplitAmount">{onlineCount} Orders</div>
              <div className="paymentSplitPercent">{onlinePercent}% of total volume</div>
            </div>
          </div>

          <div style={{ marginTop: "18px", padding: "12px", background: "#faf8f5", borderRadius: "8px", fontSize: "12px", color: "var(--admin-muted)" }}>
            <strong style={{ color: "var(--admin-dark)" }}>Risk Insight:</strong> Online prepaid orders experience a 98% fulfillment success rate compared to standard COD returns.
          </div>
        </div>
      </div>

      {/* Inventory Watchlist & Recent Live Orders Feed */}
      <div className="dashTablesGrid">
        {/* Inventory Watchlist */}
        <div className="dashSectionCard">
          <div className="dashSectionHeader">
            <h3>Catalog Watchlist</h3>
            <Link to="/admin/products" className="dashSectionLink">
              Manage All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="dashProductList">
            {(data?.top_products && data.top_products.length > 0) ? (
              data.top_products.slice(0, 5).map((prod) => (
                <div className="dashProductItem" key={prod.id}>
                  {prod.image ? (
                    <img src={prod.image} alt={prod.name} className="dashProductThumb" />
                  ) : (
                    <div className="dashProductThumb" style={{ display: "grid", placeItems: "center" }}>
                      <Sparkles size={16} color="#a57c36" />
                    </div>
                  )}
                  <div className="dashProductInfo">
                    <div className="dashProductTitle" title={prod.name}>{prod.name}</div>
                    <div className="dashProductCategory">{prod.category_name || "Jewelry"}</div>
                  </div>
                  <div className="dashProductPrice">{money(prod.price)}</div>
                  <div>
                    {prod.stock <= 5 ? (
                      <span className="stockBadge low">
                        <AlertTriangle size={11} /> {prod.stock} left
                      </span>
                    ) : (
                      <span className="stockBadge good">
                        {prod.stock} in stock
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--admin-muted)", fontSize: "13px" }}>
                No inventory items to display.
              </div>
            )}
          </div>
        </div>

        {/* Live Orders Feed */}
        <div className="dashSectionCard">
          <div className="dashSectionHeader">
            <h3>Recent Store Orders</h3>
            <Link to="/admin/orders" className="dashSectionLink">
              View All Orders <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="recentOrdersTable">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recent_orders && data.recent_orders.length > 0) ? (
                  data.recent_orders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <strong style={{ color: "var(--admin-dark)", fontFamily: "monospace" }}>
                          {ord.order_number}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.customer_name || "Guest Shopper"}</div>
                        <span style={{ fontSize: "10px", color: "var(--admin-muted)" }}>
                          {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : "Recent"}
                        </span>
                      </td>
                      <td>
                        <strong>{money(ord.total)}</strong>
                      </td>
                      <td>
                        <span style={{ textTransform: "uppercase", fontSize: "11px", fontWeight: 700, color: ord.payment_method === 'online' ? '#1557a6' : '#a57c36' }}>
                          {ord.payment_method || "COD"}
                        </span>
                      </td>
                      <td>
                        <span className={`statusPill ${ord.status || 'pending'}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/orders`} className="dashSectionLink">
                          <ExternalLink size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--admin-muted)" }}>
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Administrative Action Bar */}
      <div className="dashQuickActionsBar">
        <Link to="/admin/products" className="quickActionTile">
          <div className="quickActionIcon">
            <PlusCircle size={20} />
          </div>
          <div>
            <span>New Product</span>
            <small style={{ display: "block", color: "var(--admin-muted)", fontSize: "10px" }}>Add catalog item</small>
          </div>
        </Link>

        <Link to="/admin/orders" className="quickActionTile">
          <div className="quickActionIcon">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span>Process Orders</span>
            <small style={{ display: "block", color: "var(--admin-muted)", fontSize: "10px" }}>Ship & invoice</small>
          </div>
        </Link>

        <Link to="/admin/coupons" className="quickActionTile">
          <div className="quickActionIcon">
            <Percent size={20} />
          </div>
          <div>
            <span>Discount Coupons</span>
            <small style={{ display: "block", color: "var(--admin-muted)", fontSize: "10px" }}>Promotions & sales</small>
          </div>
        </Link>

        <Link to="/admin/analytics" className="quickActionTile">
          <div className="quickActionIcon">
            <Sparkles size={20} />
          </div>
          <div>
            <span>Deep Analytics</span>
            <small style={{ display: "block", color: "var(--admin-muted)", fontSize: "10px" }}>Funnels & events</small>
          </div>
        </Link>

        <Link to="/admin/messages" className="quickActionTile">
          <div className="quickActionIcon">
            <MessageSquare size={20} />
          </div>
          <div>
            <span>Customer Inbox</span>
            <small style={{ display: "block", color: "var(--admin-muted)", fontSize: "10px" }}>Support tickets</small>
          </div>
        </Link>
      </div>
    </>
  );
}
