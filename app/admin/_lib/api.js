export const getApiBase = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    if (host === 'localhost' || host === '127.0.0.1' || /^(\d+\.){3}\d+$/.test(host)) {
      return `${protocol}//${host}/elores_ecom/elores_backend/api`;
    }
  }
  const env = process.env.NEXT_PUBLIC_API_URL || '';
  if (env && env.includes('elores_ecom')) return env.replace(/\/+$/, '');
  return 'http://localhost/elores_ecom/elores_backend/api';
};

const API_BASE = getApiBase();

export async function adminApi(path, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("elores_admin_token") || sessionStorage.getItem("elores_admin_token")
      : null;

  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const cleanApi = getApiBase().replace(/\/+$/, "");
  const response = await fetch(`${cleanApi}${cleanPath}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If unauthorized and on a protected page, purge stale token and redirect
    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.endsWith("/admin/login")
    ) {
      localStorage.removeItem("elores_admin_token");
      sessionStorage.removeItem("elores_admin_token");
      document.cookie = "elores_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.replace("/admin/login");
    }

    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }
  return data;
}

export function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function getImageUrl(url) {
  if (!url) return '';
  if (typeof url === 'string' && url.includes(':8080/uploads/')) {
    url = url.substring(url.indexOf('/uploads/'));
  }
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const backendBase = getApiBase().replace(/\/api\/?$/, '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
}
