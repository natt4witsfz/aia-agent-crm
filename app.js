/* app.js — UI glue: navigation, CRUD forms, dashboard, settings */

const CUSTOMER_TYPES = ["life", "health", "saving", "invest", "group", "prospect"];
const CUSTOMER_STATUSES = ["active", "vip", "prospect", "lapsed"];
const CLAIM_STATUSES = ["pending", "approved", "paid", "rejected"];
const REMINDER_TYPES = ["renewal", "birthday", "followup", "other"];

const App = {
  currentView: "dashboard",
  customerFilter: "all",

  async init() {
    applyI18n();
    await Store.init();
    this.bindNav();
    this.bindGlobal();
    this.bindSettings();
    this.bindFinance();
    this.bindAI();
    this.renderAll();
    this.updateStorageUI();
  },

  /* ---------- navigation ---------- */
  bindNav() {
    document.querySelectorAll(".nav-item").forEach(btn =>
      btn.addEventListener("click", () => this.switchView(btn.dataset.view)));
    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-view-link]");
      if (link) this.switchView(link.dataset.viewLink);
    });
    document.getElementById("langToggle").addEventListener("click", toggleLang);
  },

  switchView(view) {
    this.currentView = view;
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === view));
    document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + view));
    if (view === "map") CustomerMap.init();
    if (view === "ai") document.getElementById("aiNoKey").hidden = !!AI.apiKey;
  },

  bindGlobal() {
    document.getElementById("modalClose").addEventListener("click", () => this.closeModal());
    document.getElementById("modalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "modalOverlay") this.closeModal();
    });
    document.getElementById("btnAddCustomer").addEventListener("click", () => this.openCustomerForm());
    document.getElementById("btnAddReminder").addEventListener("click", () => this.openReminderForm());
    document.getElementById("btnAddPolicy").addEventListener("click", () => this.openPolicyForm());
    document.getElementById("btnAddClaim").addEventListener("click", () => this.openClaimForm());
    document.getElementById("customerSearch").addEventListener("input", () => this.renderCustomers());
  },

  /* ---------- render ---------- */
  renderAll() {
    this.renderDashboard();
    this.renderCustomers();
    this.renderReminders();
    this.renderPolicies();
    this.renderClaims();
    if (CustomerMap.initialized) CustomerMap.refresh();
  },

  fmtDate(d) {
    if (!d) return "-";
    try { return new Date(d + "T00:00:00").toLocaleDateString(LANG === "th" ? "th-TH" : "en-GB", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return d; }
  },

  renderDashboard() {
    const customers = Store.list("customers"), policies = Store.list("policies"),
          claims = Store.list("claims"), reminders = Store.list("reminders");
    const dueReminders = reminders.filter(r => !r.done && r.remind_date <= this.plusDays(7));
    document.getElementById("dashStats").innerHTML = [
      [customers.length, t("statCustomers")],
      [policies.length, t("statPolicies")],
      [claims.length, t("statClaims")],
      [dueReminders.length, t("statDueReminders")],
    ].map(([n, l]) => `<div class="stat-tile"><div class="num">${n}</div><div class="lbl">${l}</div></div>`).join("");

    const upcoming = reminders.filter(r => !r.done).sort((a, b) => (a.remind_date || "").localeCompare(b.remind_date || "")).slice(0, 6);
    document.getElementById("dashReminders").innerHTML = upcoming.length
      ? upcoming.map(r => `<div class="detail-row"><span>${this.fmtDate(r.remind_date)}</span><span>${esc(r.title)}</span></div>`).join("")
      : `<span class="hint">${t("noData")}</span>`;

    const recent = customers.slice(0, 6);
    document.getElementById("dashCustomers").innerHTML = recent.length
      ? recent.map(c => `<div class="detail-row"><span>${esc(c.name)}</span><span class="chip" style="background:${CustomerMap.STATUS_COLORS[c.status] || "#2f6fd0"}">${t("status" + cap(c.status))}</span></div>`).join("")
      : `<span class="hint">${t("noData")}</span>`;

    const badge = document.getElementById("reminderBadge");
    badge.hidden = dueReminders.length === 0;
    badge.textContent = dueReminders.length;
  },

  plusDays(n) {
    const d = new Date(); d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  },

  renderCustomers() {
    const q = document.getElementById("customerSearch").value.trim().toLowerCase();
    let list = Store.list("customers");
    if (this.customerFilter !== "all") list = list.filter(c => c.status === this.customerFilter);
    if (q) list = list.filter(c => (c.name + " " + (c.phone || "") + " " + (c.note || "")).toLowerCase().includes(q));

    document.getElementById("customerFilters").innerHTML =
      [`<button class="filter-pill ${this.customerFilter === "all" ? "active" : ""}" data-f="all">${t("all")}</button>`,
       ...CUSTOMER_STATUSES.map(s =>
        `<button class="filter-pill ${this.customerFilter === s ? "active" : ""}" data-f="${s}">
           <span class="color-dot" style="background:${CustomerMap.STATUS_COLORS[s]}"></span>${t("status" + cap(s))}</button>`)].join("");
    document.querySelectorAll("#customerFilters .filter-pill").forEach(p =>
      p.addEventListener("click", () => { this.customerFilter = p.dataset.f; this.renderCustomers(); }));

    document.getElementById("customerList").innerHTML = list.length ? list.map(c => `
      <div class="item-card" onclick="App.openCustomerDetail('${c.id}')">
        <span class="color-dot" style="background:${CustomerMap.STATUS_COLORS[c.status] || "#2f6fd0"}"></span>
        <div class="item-main">
          <div class="item-title">${CustomerMap.TYPE_ICONS[c.type] || ""} ${esc(c.name)}</div>
          <div class="item-sub">${esc(c.phone || "")} · ${t("type" + cap(c.type))} · ${Store.list("policies").filter(p => p.customer_id === c.id).length} ${t("navPolicies")}</div>
        </div>
        ${c.lat ? `<button class="btn btn-sm" onclick="event.stopPropagation();CustomerMap.focusCustomer('${c.id}')">🗺️</button>` : ""}
      </div>`).join("") : this.emptyState("👥", t("addCustomer"), "App.openCustomerForm()");
  },

  renderReminders() {
    const list = Store.list("reminders").slice().sort((a, b) => (a.done - b.done) || (a.remind_date || "").localeCompare(b.remind_date || ""));
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById("reminderList").innerHTML = list.length ? list.map(r => {
      const overdue = !r.done && r.remind_date < today;
      const cust = r.customer_id ? Store.get("customers", r.customer_id) : null;
      return `<div class="item-card" style="${r.done ? "opacity:.55" : ""}">
        <input type="checkbox" style="width:auto" ${r.done ? "checked" : ""} onchange="App.toggleReminder('${r.id}')">
        <div class="item-main">
          <div class="item-title" style="${r.done ? "text-decoration:line-through" : ""}">${esc(r.title)}</div>
          <div class="item-sub" style="${overdue ? "color:#c0392b;font-weight:600" : ""}">${this.fmtDate(r.remind_date)} · ${t("rem" + cap(r.rem_type))}${cust ? " · " + esc(cust.name) : ""}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-sm" onclick="App.openReminderForm('${r.id}')">${t("edit")}</button>
          <button class="btn btn-sm btn-danger" onclick="App.deleteRow('reminders','${r.id}')">${t("delete")}</button>
        </div>
      </div>`;
    }).join("") : this.emptyState("🔔", t("addReminder"), "App.openReminderForm()");
  },

  renderPolicies() {
    const list = Store.list("policies");
    document.getElementById("policyList").innerHTML = list.length ? list.map(p => {
      const c = Store.get("customers", p.customer_id);
      return `<div class="item-card" onclick="App.openPolicyForm('${p.id}')">
        <div class="item-main">
          <div class="item-title">📄 ${esc(p.plan_name)} <span class="hint">#${esc(p.policy_no || "-")}</span></div>
          <div class="item-sub">${c ? esc(c.name) : "?"} · ${t("fPremium")}: ${Finance.fmt(p.premium || 0)} · ${t("fRenewalDate")}: ${this.fmtDate(p.renewal_date)}</div>
        </div>
        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();App.deleteRow('policies','${p.id}')">${t("delete")}</button>
      </div>`;
    }).join("") : this.emptyState("📄", t("addPolicy"), "App.openPolicyForm()");
  },

  renderClaims() {
    const list = Store.list("claims");
    const colors = { pending: "#e8a13a", approved: "#2f6fd0", paid: "#1d9e5f", rejected: "#c0392b" };
    document.getElementById("claimList").innerHTML = list.length ? list.map(cl => {
      const c = Store.get("customers", cl.customer_id);
      return `<div class="item-card" onclick="App.openClaimForm('${cl.id}')">
        <div class="item-main">
          <div class="item-title">🏥 ${c ? esc(c.name) : "?"} · ${esc(cl.claim_type || "")}</div>
          <div class="item-sub">${this.fmtDate(cl.claim_date)} · ${Finance.fmt(cl.amount || 0)} ${t("baht")} · ${esc(cl.detail || "")}</div>
        </div>
        <span class="chip" style="background:${colors[cl.status] || "#8a93a0"}">${t("claim" + cap(cl.status))}</span>
        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();App.deleteRow('claims','${cl.id}')">${t("delete")}</button>
      </div>`;
    }).join("") : this.emptyState("🏥", t("addClaim"), "App.openClaimForm()");
  },

  emptyState(emoji, btnLabel, onclick) {
    return `<div class="empty-state"><span class="emoji">${emoji}</span>${t("noData")}<br>
      <button class="btn btn-primary" onclick="${onclick}">${btnLabel}</button></div>`;
  },

  async deleteRow(tbl, id) {
    if (!confirm(t("confirmDelete"))) return;
    await Store.remove(tbl, id);
    this.renderAll();
  },

  async toggleReminder(id) {
    const r = Store.get("reminders", id);
    r.done = !r.done;
    await Store.upsert("reminders", r);
    this.renderAll();
  },

  /* ---------- modal helpers ---------- */
  openModal(title, bodyHtml) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = bodyHtml;
    document.getElementById("modalOverlay").hidden = false;
  },
  closeModal() { document.getElementById("modalOverlay").hidden = true; },

  customerOptions(selected) {
    return Store.list("customers").map(c =>
      `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${esc(c.name)}</option>`).join("");
  },

  /* ---------- customer detail ---------- */
  openCustomerDetail(id) {
    const c = Store.get("customers", id);
    if (!c) return;
    const policies = Store.list("policies").filter(p => p.customer_id === id);
    const claims = Store.list("claims").filter(cl => cl.customer_id === id);
    this.openModal(c.name, `
      <div class="detail-row"><span>${t("fPhone")}</span><span>${esc(c.phone || "-")}</span></div>
      <div class="detail-row"><span>${t("fEmail")}</span><span>${esc(c.email || "-")}</span></div>
      <div class="detail-row"><span>${t("fAddress")}</span><span>${esc(c.address || "-")}</span></div>
      <div class="detail-row"><span>${t("fBirthdate")}</span><span>${this.fmtDate(c.birthdate)}</span></div>
      <div class="detail-row"><span>${t("fType")}</span><span>${t("type" + cap(c.type))}</span></div>
      <div class="detail-row"><span>${t("fStatus")}</span><span class="chip" style="background:${CustomerMap.STATUS_COLORS[c.status]}">${t("status" + cap(c.status))}</span></div>
      <div class="detail-row"><span>${t("fNote")}</span><span>${esc(c.note || "-")}</span></div>
      <div class="section-sub">${t("policiesOf")} (${policies.length})</div>
      ${policies.map(p => `<div class="detail-row"><span>${esc(p.plan_name)} #${esc(p.policy_no || "")}</span><span>${Finance.fmt(p.premium || 0)} ${t("baht")}/yr · ${this.fmtDate(p.renewal_date)}</span></div>`).join("") || `<span class="hint">${t("noData")}</span>`}
      <div class="section-sub">${t("claimsOf")} (${claims.length})</div>
      ${claims.map(cl => `<div class="detail-row"><span>${this.fmtDate(cl.claim_date)} ${esc(cl.claim_type || "")}</span><span>${Finance.fmt(cl.amount || 0)} ${t("baht")} · ${t("claim" + cap(cl.status))}</span></div>`).join("") || `<span class="hint">${t("noData")}</span>`}
      <div class="modal-actions">
        ${c.lat ? `<button class="btn" onclick="App.closeModal();CustomerMap.focusCustomer('${c.id}')">${t("viewOnMap")}</button>` : ""}
        <button class="btn" onclick="App.openCustomerForm('${c.id}')">${t("edit")}</button>
        <button class="btn btn-danger" onclick="App.closeModal();App.deleteRow('customers','${c.id}')">${t("delete")}</button>
        <button class="btn btn-primary" onclick="App.closeModal()">${t("close")}</button>
      </div>`);
  },

  /* ---------- forms ---------- */
  openCustomerForm(id = null, preset = {}) {
    const c = id ? Store.get("customers", id) : Object.assign({ type: "life", status: "prospect" }, preset);
    this.openModal(id ? t("edit") + " — " + c.name : t("addCustomer"), `
      <div class="form-grid">
        <label><span>${t("fName")}</span><input id="f_name" value="${esc(c.name || "")}"></label>
        <label><span>${t("fPhone")}</span><input id="f_phone" value="${esc(c.phone || "")}"></label>
        <label><span>${t("fEmail")}</span><input id="f_email" value="${esc(c.email || "")}"></label>
        <label><span>${t("fBirthdate")}</span><input id="f_birthdate" type="date" value="${c.birthdate || ""}"></label>
        <label><span>${t("fType")}</span><select id="f_type">${CUSTOMER_TYPES.map(x => `<option value="${x}" ${c.type === x ? "selected" : ""}>${t("type" + cap(x))}</option>`).join("")}</select></label>
        <label><span>${t("fStatus")}</span><select id="f_status">${CUSTOMER_STATUSES.map(x => `<option value="${x}" ${c.status === x ? "selected" : ""}>${t("status" + cap(x))}</option>`).join("")}</select></label>
      </div>
      <label><span>${t("fAddress")}</span><input id="f_address" value="${esc(c.address || "")}"></label><br><br>
      <div class="form-grid">
        <label><span>${t("fLatLng")} — lat</span><input id="f_lat" type="number" step="any" value="${c.lat ?? ""}"></label>
        <label><span>lng</span><input id="f_lng" type="number" step="any" value="${c.lng ?? ""}"></label>
      </div>
      <label><span>${t("fNote")}</span><textarea id="f_note" rows="2">${esc(c.note || "")}</textarea></label>
      <div class="modal-actions">
        <button class="btn" onclick="App.closeModal()">${t("cancel")}</button>
        <button class="btn btn-primary" onclick="App.saveCustomer('${id || ""}')">${t("save")}</button>
      </div>`);
  },

  async saveCustomer(id) {
    const v = k => document.getElementById("f_" + k).value.trim();
    if (!v("name")) { document.getElementById("f_name").focus(); return; }
    const row = id ? Object.assign({}, Store.get("customers", id)) : {};
    Object.assign(row, {
      name: v("name"), phone: v("phone"), email: v("email"),
      birthdate: v("birthdate") || null, type: v("type"), status: v("status"),
      address: v("address"), note: v("note"),
      lat: v("lat") ? parseFloat(v("lat")) : null,
      lng: v("lng") ? parseFloat(v("lng")) : null,
    });
    await Store.upsert("customers", row);
    this.closeModal();
    this.renderAll();
  },

  openPolicyForm(id = null) {
    const p = id ? Store.get("policies", id) : {};
    this.openModal(id ? t("edit") : t("addPolicy"), `
      <div class="form-grid">
        <label><span>${t("fCustomer")}</span><select id="f_customer_id">${this.customerOptions(p.customer_id)}</select></label>
        <label><span>${t("fPolicyNo")}</span><input id="f_policy_no" value="${esc(p.policy_no || "")}"></label>
        <label><span>${t("fPlanName")}</span><input id="f_plan_name" value="${esc(p.plan_name || "")}"></label>
        <label><span>${t("fPremium")}</span><input id="f_premium" type="number" value="${p.premium ?? ""}"></label>
        <label><span>${t("fSumAssured")}</span><input id="f_sum_assured" type="number" value="${p.sum_assured ?? ""}"></label>
        <label><span>${t("fStartDate")}</span><input id="f_start_date" type="date" value="${p.start_date || ""}"></label>
        <label><span>${t("fRenewalDate")}</span><input id="f_renewal_date" type="date" value="${p.renewal_date || ""}"></label>
      </div>
      <div class="modal-actions">
        <button class="btn" onclick="App.closeModal()">${t("cancel")}</button>
        <button class="btn btn-primary" onclick="App.savePolicy('${id || ""}')">${t("save")}</button>
      </div>`);
  },

  async savePolicy(id) {
    const v = k => document.getElementById("f_" + k).value.trim();
    const row = id ? Object.assign({}, Store.get("policies", id)) : {};
    Object.assign(row, {
      customer_id: v("customer_id"), policy_no: v("policy_no"), plan_name: v("plan_name"),
      premium: v("premium") ? parseFloat(v("premium")) : null,
      sum_assured: v("sum_assured") ? parseFloat(v("sum_assured")) : null,
      start_date: v("start_date") || null, renewal_date: v("renewal_date") || null,
    });
    await Store.upsert("policies", row);
    // auto-create a renewal reminder 14 days before renewal date
    if (!id && row.renewal_date) {
      const d = new Date(row.renewal_date + "T00:00:00"); d.setDate(d.getDate() - 14);
      const c = Store.get("customers", row.customer_id);
      await Store.upsert("reminders", {
        title: (LANG === "th" ? "ต่ออายุ " : "Renewal ") + (c ? c.name : "") + " #" + (row.policy_no || ""),
        remind_date: d.toISOString().slice(0, 10), rem_type: "renewal",
        customer_id: row.customer_id, done: false,
      });
    }
    this.closeModal();
    this.renderAll();
  },

  openClaimForm(id = null) {
    const cl = id ? Store.get("claims", id) : { status: "pending" };
    this.openModal(id ? t("edit") : t("addClaim"), `
      <div class="form-grid">
        <label><span>${t("fCustomer")}</span><select id="f_customer_id">${this.customerOptions(cl.customer_id)}</select></label>
        <label><span>${t("fClaimDate")}</span><input id="f_claim_date" type="date" value="${cl.claim_date || new Date().toISOString().slice(0, 10)}"></label>
        <label><span>${t("fClaimType")}</span><input id="f_claim_type" value="${esc(cl.claim_type || "")}" placeholder="OPD / IPD / อุบัติเหตุ..."></label>
        <label><span>${t("fClaimAmount")}</span><input id="f_amount" type="number" value="${cl.amount ?? ""}"></label>
        <label><span>${t("fClaimStatus")}</span><select id="f_status">${CLAIM_STATUSES.map(x => `<option value="${x}" ${cl.status === x ? "selected" : ""}>${t("claim" + cap(x))}</option>`).join("")}</select></label>
      </div>
      <label><span>${t("fClaimDetail")}</span><textarea id="f_detail" rows="2">${esc(cl.detail || "")}</textarea></label>
      <div class="modal-actions">
        <button class="btn" onclick="App.closeModal()">${t("cancel")}</button>
        <button class="btn btn-primary" onclick="App.saveClaim('${id || ""}')">${t("save")}</button>
      </div>`);
  },

  async saveClaim(id) {
    const v = k => document.getElementById("f_" + k).value.trim();
    const row = id ? Object.assign({}, Store.get("claims", id)) : {};
    Object.assign(row, {
      customer_id: v("customer_id"), claim_date: v("claim_date") || null,
      claim_type: v("claim_type"), amount: v("amount") ? parseFloat(v("amount")) : null,
      status: v("status"), detail: v("detail"),
    });
    await Store.upsert("claims", row);
    this.closeModal();
    this.renderAll();
  },

  openReminderForm(id = null) {
    const r = id ? Store.get("reminders", id) : { rem_type: "followup" };
    this.openModal(id ? t("edit") : t("addReminder"), `
      <div class="form-grid">
        <label><span>${t("fRemTitle")}</span><input id="f_title" value="${esc(r.title || "")}"></label>
        <label><span>${t("fRemDate")}</span><input id="f_remind_date" type="date" value="${r.remind_date || new Date().toISOString().slice(0, 10)}"></label>
        <label><span>${t("fRemType")}</span><select id="f_rem_type">${REMINDER_TYPES.map(x => `<option value="${x}" ${r.rem_type === x ? "selected" : ""}>${t("rem" + cap(x))}</option>`).join("")}</select></label>
        <label><span>${t("fCustomer")}</span><select id="f_customer_id"><option value="">-</option>${this.customerOptions(r.customer_id)}</select></label>
      </div>
      <div class="modal-actions">
        <button class="btn" onclick="App.closeModal()">${t("cancel")}</button>
        <button class="btn btn-primary" onclick="App.saveReminder('${id || ""}')">${t("save")}</button>
      </div>`);
  },

  async saveReminder(id) {
    const v = k => document.getElementById("f_" + k).value.trim();
    if (!v("title")) return;
    const row = id ? Object.assign({}, Store.get("reminders", id)) : { done: false };
    Object.assign(row, {
      title: v("title"), remind_date: v("remind_date") || null,
      rem_type: v("rem_type"), customer_id: v("customer_id") || null,
    });
    await Store.upsert("reminders", row);
    this.closeModal();
    this.renderAll();
  },

  /* ---------- settings ---------- */
  updateStorageUI() {
    const dot = document.getElementById("storageStatus");
    dot.classList.toggle("online", Store.online);
    dot.title = Store.online ? "Supabase connected" : "Local storage";
    document.getElementById("storageBanner").hidden = Store.online;
  },

  bindSettings() {
    document.getElementById("setSupabaseUrl").value = Store.settings.get("supabase_url");
    document.getElementById("setSupabaseKey").value = Store.settings.get("supabase_key");
    document.getElementById("setClaudeKey").value = Store.settings.get("claude_key");
    document.getElementById("setClaudeModel").value = Store.settings.get("claude_model", "claude-sonnet-5");

    document.getElementById("btnSaveSupabase").addEventListener("click", async () => {
      const status = document.getElementById("supabaseStatus");
      const url = document.getElementById("setSupabaseUrl").value.trim();
      const key = document.getElementById("setSupabaseKey").value.trim();
      if (!url || !key) { status.textContent = "⚠️ URL / key ?"; return; }
      status.textContent = "⏳ ...";
      try {
        await Store.connect(url, key);
        status.textContent = "✅ Connected";
        this.updateStorageUI();
        this.renderAll();
      } catch (e) {
        status.textContent = "❌ " + (e.message || e);
      }
    });

    document.getElementById("btnSaveClaude").addEventListener("click", () => {
      Store.settings.set("claude_key", document.getElementById("setClaudeKey").value.trim());
      Store.settings.set("claude_model", document.getElementById("setClaudeModel").value);
      document.getElementById("claudeStatus").textContent = "✅";
      document.getElementById("aiNoKey").hidden = !!AI.apiKey;
    });

    document.getElementById("btnExport").addEventListener("click", () => Store.exportAll());
    document.getElementById("btnImport").addEventListener("click", () => document.getElementById("importFile").click());
    document.getElementById("importFile").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const json = JSON.parse(await file.text());
        await Store.importAll(json);
        this.renderAll();
        alert("✅ Imported");
      } catch (err) { alert("❌ " + err.message); }
      e.target.value = "";
    });
  },

  /* ---------- finance ---------- */
  bindFinance() {
    document.querySelectorAll("#financeTabs .tab").forEach(tab =>
      tab.addEventListener("click", () => {
        document.querySelectorAll("#financeTabs .tab").forEach(x => x.classList.toggle("active", x === tab));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === "tab-" + tab.dataset.tab));
      }));

    document.getElementById("btnCalcTax").addEventListener("click", () => {
      const num = id => parseFloat(document.getElementById(id).value) || 0;
      const r = Finance.thaiTax({
        income: num("taxIncome"), expense: num("taxExpense"), personal: num("taxPersonal"),
        life: num("taxLife"), health: num("taxHealth"), other: num("taxOther"),
      });
      const box = document.getElementById("taxResult");
      box.hidden = false;
      box.innerHTML = `<table>
        <tr><td>${t("taxNet")}</td><td>${Finance.fmt(r.net)} ${t("baht")}</td></tr>
        <tr class="total"><td>${t("taxAmount")}</td><td>${Finance.fmt(r.tax, 2)} ${t("baht")}</td></tr>
        <tr><td>${t("taxEffective")}</td><td>${(r.effective * 100).toFixed(2)}%</td></tr>
      </table>`;
    });

    document.getElementById("btnCalcIRR").addEventListener("click", () => {
      const flows = document.getElementById("irrCashflows").value
        .split(/[,\n]/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
      const irr = Finance.irr(flows);
      const box = document.getElementById("irrResult");
      box.hidden = false;
      box.innerHTML = irr === null
        ? `<span style="color:#c0392b">${t("irrInvalid")}</span>`
        : `<table><tr class="total"><td>${t("irrAnswer")}</td><td>${(irr * 100).toFixed(2)}%</td></tr></table>`;
    });

    document.getElementById("btnCalcInvest").addEventListener("click", () => {
      const num = id => parseFloat(document.getElementById(id).value) || 0;
      const r = Finance.invest({
        principal: num("invPrincipal"), monthly: num("invMonthly"),
        annualRatePct: num("invRate"), years: num("invYears"),
      });
      const box = document.getElementById("investResult");
      box.hidden = false;
      box.innerHTML = `<table>
        <tr><td>${t("invContrib")}</td><td>${Finance.fmt(r.contributed)} ${t("baht")}</td></tr>
        <tr><td>${t("invGain")}</td><td>${Finance.fmt(r.gain)} ${t("baht")}</td></tr>
        <tr class="total"><td>${t("invTotal")}</td><td>${Finance.fmt(r.total)} ${t("baht")}</td></tr>
      </table>`;
    });
  },

  /* ---------- AI ---------- */
  bindAI() {
    const input = document.getElementById("aiInput");
    const sendBtn = document.getElementById("btnAiSend");
    const doSend = async (text) => {
      text = (text || input.value).trim();
      if (!text) return;
      if (!AI.apiKey) { this.switchView("settings"); return; }
      input.value = "";
      this.aiAppend("user", text);
      const thinking = this.aiAppend("assistant thinking", LANG === "th" ? "กำลังคิด..." : "Thinking...");
      sendBtn.disabled = true;
      try {
        const reply = await AI.send(text);
        thinking.className = "ai-msg assistant";
        thinking.textContent = reply;
      } catch (e) {
        thinking.className = "ai-msg assistant";
        thinking.textContent = "❌ " + e.message;
      } finally {
        sendBtn.disabled = false;
      }
    };
    sendBtn.addEventListener("click", () => doSend());
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); }
    });
    document.querySelectorAll(".ai-quick").forEach(btn =>
      btn.addEventListener("click", () => doSend(AI.QUICK_PROMPTS[btn.dataset.prompt][LANG])));
  },

  aiAppend(cls, text) {
    const box = document.getElementById("aiMessages");
    const el = document.createElement("div");
    el.className = "ai-msg " + cls;
    el.textContent = text;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    return el;
  },
};

window.renderAll = () => App.renderAll();
App.init();
