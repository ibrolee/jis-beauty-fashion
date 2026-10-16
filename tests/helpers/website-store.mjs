import { loadSource } from "./load-source.mjs";

// Isolated storage boundary for the real server actions and public getters.
export function websiteStore() {
  const rows = new Map();
  const writes = [];
  let user = { id: 1, role: "admin", firstName: "Test", lastName: "Owner" };
  let preview = false;
  let locks = 0;
  const table = { key: "key" };
  const whereKey = (where) => typeof where === "function" ? where(table, { eq: (_, key) => key }) : where;
  const db = {
    select() { return { from() { return { async where(keys) { return [...rows].filter(([key]) => keys.includes(key)).map(([key, value]) => ({ key, value: structuredClone(value) })); } }; } }; },
    query: { siteSettings: { async findFirst({ where }) { const key = whereKey(where); return rows.has(key) ? { key, value: structuredClone(rows.get(key)) } : undefined; } } },
    async execute() { locks++; },
    insert() { return { values(row) { return { async onConflictDoUpdate() { writes.push(row.key); rows.set(row.key, structuredClone(row.value)); } }; } }; },
    delete() { return { async where(key) { writes.push(key); rows.delete(key); } }; },
    async transaction(run) {
      const before = structuredClone(rows);
      try { return await run(db); } catch (error) { rows.clear(); before.forEach((value, key) => rows.set(key, value)); throw error; }
    },
  };
  const overrides = {
    "@/db": { db }, "@/db/schema": { siteSettings: table },
    "@/db/ensure-seed": { async ensureSeeded() {} },
    "drizzle-orm": { eq: (_, key) => key, inArray: (_, keys) => keys, sql: () => "advisory lock" },
    "@/lib/auth/session": {
      async getCurrentUser() { return user; },
      async requireAdmin() { if (user?.role !== "admin") throw new Error("ADMIN_REQUIRED"); return user; },
    },
    "next/headers": { async draftMode() { return { isEnabled: preview, enable() { preview = true; }, disable() { preview = false; } }; } },
    "next/navigation": { redirect(path) { throw new Error(`REDIRECT:${path}`); } },
    "next/cache": { revalidatePath() {} },
  };
  return {
    rows, writes, overrides,
    load: (path) => loadSource(path, overrides),
    setUser(next) { user = next; }, setPreview(next) { preview = next; },
    preview: () => preview, locks: () => locks,
  };
}
