/* ai.js — Claude API assistant with CRM data context */

const AI = {
  history: [],

  get apiKey() { return Store.settings.get("claude_key"); },
  get model() { return Store.settings.get("claude_model", "claude-sonnet-5"); },

  buildContext() {
    const customers = Store.list("customers").map(c => ({
      name: c.name, phone: c.phone, type: c.type, status: c.status,
      birthdate: c.birthdate, note: c.note,
    }));
    const policies = Store.list("policies").map(p => {
      const c = Store.get("customers", p.customer_id);
      return { customer: c ? c.name : "?", policy_no: p.policy_no, plan: p.plan_name,
        premium_per_year: p.premium, sum_assured: p.sum_assured,
        start_date: p.start_date, renewal_date: p.renewal_date };
    });
    const claims = Store.list("claims").map(cl => {
      const c = Store.get("customers", cl.customer_id);
      return { customer: c ? c.name : "?", date: cl.claim_date, type: cl.claim_type,
        amount: cl.amount, status: cl.status, detail: cl.detail };
    });
    const reminders = Store.list("reminders").map(r => ({
      title: r.title, date: r.remind_date, type: r.rem_type, done: r.done }));
    return JSON.stringify({ customers, policies, claims, reminders,
      today: new Date().toISOString().slice(0, 10) });
  },

  systemPrompt() {
    return `You are an assistant for a Thai insurance agent using their CRM app. Answer in ${LANG === "th" ? "Thai" : "English"}. Be concise and practical. You can summarize policies, spot upcoming renewals or birthdays, analyze claims history, draft polite customer messages (LINE/SMS style for Thai customers), and explain financial concepts like IRR, personal income tax deductions from insurance premiums, and investment returns. Use only the CRM data provided; if data is missing, say so.

CRM DATA:
${this.buildContext()}`;
  },

  async send(userText) {
    this.history.push({ role: "user", content: userText });
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        system: this.systemPrompt(),
        messages: this.history.map(m => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || res.status + " " + res.statusText);
    }
    const data = await res.json();
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n") || "(no response)";
    this.history.push({ role: "assistant", content: text });
    if (this.history.length > 20) this.history = this.history.slice(-20);
    return text;
  },

  QUICK_PROMPTS: {
    summarize: { th: "สรุปภาพรวมลูกค้าทั้งหมดของฉัน แยกตามประเภทและสถานะ พร้อมข้อสังเกต", en: "Summarize all my customers by type and status, with observations" },
    renewals: { th: "ลูกค้าคนไหนมีวันครบกำหนดชำระเบี้ยหรือวันเกิดใกล้ถึงบ้าง เรียงตามวัน", en: "Which customers have renewals or birthdays coming up, sorted by date" },
    draft: { th: "ช่วยร่างข้อความ LINE สุภาพสำหรับแจ้งเตือนลูกค้าที่ใกล้ครบกำหนดชำระเบี้ย", en: "Draft a polite LINE message reminding a customer about their upcoming premium due date" },
    claims: { th: "วิเคราะห์ประวัติเคลมทั้งหมด มีแนวโน้มหรือข้อควรระวังอะไรบ้าง", en: "Analyze all claims history — any trends or things to watch" },
  },
};
