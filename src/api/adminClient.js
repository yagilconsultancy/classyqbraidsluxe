// Authenticated client for /api/admin/* -- every call attaches the current
// Clerk session token as a Bearer token, verified server-side by
// functions/api/admin/_middleware.js. Uses window.Clerk directly (Clerk's
// documented approach for non-component code) rather than threading
// useAuth().getToken() through every query function.

async function authHeaders() {
  const token = await window.Clerk?.session?.getToken();
  if (!token) {
    throw new Error("Not signed in");
  }
  return { Authorization: `Bearer ${token}` };
}

async function adminFetch(path, options = {}) {
  const headers = { ...(options.headers || {}), ...(await authHeaders()) };
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).error || ""; } catch { /* ignore */ }
    throw new Error(`${path} failed: ${res.status} ${detail || res.statusText}`);
  }
  return res.status === 204 ? null : res.json();
}

function getJson(path) {
  return adminFetch(path);
}
function postJson(path, data) {
  return adminFetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
}
function patchJson(path, data) {
  return adminFetch(path, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
}
function del(path) {
  return adminFetch(path, { method: "DELETE" });
}

export const adminApi = {
  analytics: {
    get: () => getJson("/api/admin/analytics"),
  },
  bookings: {
    list: () => getJson("/api/admin/bookings"),
    update: (id, data) => patchJson(`/api/admin/bookings/${id}`, data),
  },
  orders: {
    list: () => getJson("/api/admin/orders"),
    update: (id, data) => patchJson(`/api/admin/orders/${id}`, data),
  },
  hairstyles: {
    list: () => getJson("/api/admin/hairstyles"),
    create: (data) => postJson("/api/admin/hairstyles", data),
    update: (id, data) => patchJson(`/api/admin/hairstyles/${id}`, data),
    delete: (id) => del(`/api/admin/hairstyles/${id}`),
  },
  products: {
    list: () => getJson("/api/admin/products"),
    create: (data) => postJson("/api/admin/products", data),
    update: (id, data) => patchJson(`/api/admin/products/${id}`, data),
    delete: (id) => del(`/api/admin/products/${id}`),
  },
  availability: {
    list: () => getJson("/api/admin/availability"),
    create: (data) => postJson("/api/admin/availability", data),
    update: (id, data) => patchJson(`/api/admin/availability/${id}`, data),
    delete: (id) => del(`/api/admin/availability/${id}`),
  },
  customers: {
    list: () => getJson("/api/admin/customers"),
  },
};
