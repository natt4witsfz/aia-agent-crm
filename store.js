/* store.js — data layer: Supabase when configured, localStorage fallback.
   Tables: customers, policies, claims, reminders. All rows carry a client-side uuid `id`. */

const Store = {
  supabase: null,
  online: false,
  tables: ["customers", "policies", "claims", "reminders"],
  cache: { customers: [], policies: [], claims: [], reminders: [] },

  uuid() {
    return crypto.randomUUID ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
        });
  },

  settings: {
    get(key, def = "") { return localStorage.getItem("aiacrm_" + key) ?? def; },
    set(key, val) { localStorage.setItem("aiacrm_" + key, val); },
  },

  async init() {
    const url = this.settings.get("supabase_url");
    const key = this.settings.get("supabase_key");
    if (url && key && window.supabase) {
      try {
        this.supabase = window.supabase.createClient(url, key);
        await this.loadAllRemote();
        this.online = true;
      } catch (e) {
        console.warn("Supabase connect failed, falling back to local:", e);
        this.online = false;
        this.loadAllLocal();
      }
    } else {
      this.loadAllLocal();
    }
  },

  async connect(url, key) {
    this.settings.set("supabase_url", url);
    this.settings.set("supabase_key", key);
    this.supabase = window.supabase.createClient(url, key);
    // test + initial sync: push local data that isn't on the server yet
    const { error } = await this.supabase.from("customers").select("id").limit(1);
    if (error) throw error;
    for (const tbl of this.tables) {
      const local = this.cache[tbl];
      if (local.length) await this.supabase.from(tbl).upsert(local);
    }
    await this.loadAllRemote();
    this.online = true;
  },

  loadAllLocal() {
    for (const tbl of this.tables) {
      try { this.cache[tbl] = JSON.parse(localStorage.getItem("aiacrm_data_" + tbl)) || []; }
      catch { this.cache[tbl] = []; }
    }
  },

  saveLocal(tbl) {
    localStorage.setItem("aiacrm_data_" + tbl, JSON.stringify(this.cache[tbl]));
  },

  async loadAllRemote() {
    for (const tbl of this.tables) {
      const { data, error } = await this.supabase.from(tbl).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      this.cache[tbl] = data || [];
      this.saveLocal(tbl); // keep local mirror as offline backup
    }
  },

  list(tbl) { return this.cache[tbl]; },
  get(tbl, id) { return this.cache[tbl].find(r => r.id === id); },

  async upsert(tbl, row) {
    if (!row.id) row.id = this.uuid();
    if (!row.created_at) row.created_at = new Date().toISOString();
    const i = this.cache[tbl].findIndex(r => r.id === row.id);
    if (i >= 0) this.cache[tbl][i] = row; else this.cache[tbl].unshift(row);
    this.saveLocal(tbl);
    if (this.online) {
      const { error } = await this.supabase.from(tbl).upsert(row);
      if (error) console.error("Supabase upsert failed:", error);
    }
    return row;
  },

  async remove(tbl, id) {
    this.cache[tbl] = this.cache[tbl].filter(r => r.id !== id);
    this.saveLocal(tbl);
    if (this.online) {
      const { error } = await this.supabase.from(tbl).delete().eq("id", id);
      if (error) console.error("Supabase delete failed:", error);
    }
  },

  exportAll() {
    const blob = new Blob([JSON.stringify(this.cache, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "aia-crm-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  },

  async importAll(json) {
    for (const tbl of this.tables) {
      if (Array.isArray(json[tbl])) {
        for (const row of json[tbl]) await this.upsert(tbl, row);
      }
    }
  },
};
