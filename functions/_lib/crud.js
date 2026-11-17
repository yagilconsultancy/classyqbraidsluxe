// Tiny whitelisted-column CRUD helper for admin endpoints. Column names come
// only from the `cols` spec (never from the request), values are always bound.
// type: "text" | "num" | "bool" | "json"
function coerce(type, v) {
  if (v === undefined) return undefined;
  if (v === null || v === "") return type === "num" ? null : type === "json" ? "[]" : null;
  if (type === "bool") return v ? 1 : 0;
  if (type === "num") { const n = Number(v); return Number.isFinite(n) ? n : null; }
  if (type === "json") return typeof v === "string" ? v : JSON.stringify(v);
  return String(v);
}

function parseRow(cols, row) {
  const out = { ...row };
  for (const [k, c] of Object.entries(cols)) {
    if (c.type === "json" && typeof out[k] === "string") {
      try { out[k] = JSON.parse(out[k]); } catch { out[k] = c.obj ? {} : []; }
    }
    if (c.type === "bool") out[k] = !!out[k];
  }
  return out;
}

export function makeCrud(table, cols, { orderBy = "created_date DESC", enums = {} } = {}) {
  const names = Object.keys(cols);

  const prepare = (body, requireAll) => {
    const sets = {};
    for (const k of names) {
      const v = coerce(cols[k].type, body[k]);
      if (v === undefined) {
        if (requireAll && cols[k].required) return { error: `Missing ${k}` };
        continue;
      }
      if (cols[k].required && (v === null)) return { error: `Missing ${k}` };
      if (enums[k] && v !== null && !enums[k].includes(v)) return { error: `Invalid ${k}` };
      sets[k] = v;
    }
    return { sets };
  };

  return {
    async list({ env }) {
      const { results } = await env.DB.prepare(`SELECT * FROM ${table} ORDER BY ${orderBy}`).all();
      return Response.json(results.map((r) => parseRow(cols, r)));
    },
    async create({ request, env }) {
      let body;
      try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
      const { sets, error } = prepare(body, true);
      if (error) return Response.json({ error }, { status: 400 });
      const id = crypto.randomUUID();
      const keys = Object.keys(sets);
      await env.DB.prepare(
        `INSERT INTO ${table} (id${keys.map((k) => `, ${k}`).join("")}) VALUES (?${keys.map(() => ", ?").join("")})`
      ).bind(id, ...keys.map((k) => sets[k])).run();
      return Response.json({ id }, { status: 201 });
    },
    async update({ request, env, params }) {
      let body;
      try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
      const { sets, error } = prepare(body, false);
      if (error) return Response.json({ error }, { status: 400 });
      const keys = Object.keys(sets);
      if (!keys.length) return Response.json({ error: "No updatable fields provided" }, { status: 400 });
      const r = await env.DB.prepare(
        `UPDATE ${table} SET ${keys.map((k) => `${k} = ?`).join(", ")}, updated_date = datetime('now') WHERE id = ?`
      ).bind(...keys.map((k) => sets[k]), params.id).run();
      if (!r.meta.changes) return Response.json({ error: "Not found" }, { status: 404 });
      return Response.json({ ok: true });
    },
    async remove({ env, params }) {
      await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(params.id).run();
      return Response.json({ ok: true });
    },
  };
}
