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
};
