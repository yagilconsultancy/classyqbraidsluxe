// Read client for the Cloudflare Functions backed by D1 (functions/api/*.js).
// Mirrors the base44.entities.X.list()/.filter() shape so the public pages
// that moved off Base44 needed minimal changes.
//
// Note for local dev: plain `npm run dev` (vite) does NOT serve /functions --
// use `npm run pages:dev` (wrangler pages dev) to exercise these endpoints
// locally, or these calls will 404.

async function getJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function matches(item, filters) {
  return Object.entries(filters).every(([key, value]) => item[key] === value);
}

async function postJson(path, data) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Replaces base44.integrations.Core.UploadFile({ file }) -- same {file_url}
// shape, backed by /api/upload + R2 instead of Base44's file storage.
export async function uploadFile(file, folder = "uploads") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    throw new Error(`/api/upload failed: ${res.status} ${res.statusText}`);
  }
  return res.json(); // { file_url }
}

export const dataApi = {
  hairstyles: {
    list: () => getJson("/api/hairstyles"),
    filter: async (filters = {}) => {
      const all = await getJson("/api/hairstyles");
      return all.filter((item) => matches(item, filters));
    },
  },
  products: {
    list: () => getJson("/api/products"),
    filter: async (filters = {}) => {
      const all = await getJson("/api/products");
      return all.filter((item) => matches(item, filters));
    },
  },
  // Non-identifying columns only on list/filter -- see functions/api/bookings.js.
  bookings: {
    list: () => getJson("/api/bookings"),
    filter: async (filters = {}) => {
      const all = await getJson("/api/bookings");
      return all.filter((item) => matches(item, filters));
    },
    create: (data) => postJson("/api/bookings", data), // returns { ref }
  },
  availability: {
    list: () => getJson("/api/availability"),
    filter: async (filters = {}) => {
      const all = await getJson("/api/availability");
      return all.filter((item) => matches(item, filters));
    },
  },
};
