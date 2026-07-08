/* finance.js — Thai personal income tax, IRR, compound investment */

const Finance = {
  // Thai progressive tax brackets (2024+): net income → rate
  TAX_BRACKETS: [
    { upTo: 150000, rate: 0 },
    { upTo: 300000, rate: 0.05 },
    { upTo: 500000, rate: 0.10 },
    { upTo: 750000, rate: 0.15 },
    { upTo: 1000000, rate: 0.20 },
    { upTo: 2000000, rate: 0.25 },
    { upTo: 5000000, rate: 0.30 },
    { upTo: Infinity, rate: 0.35 },
  ],

  thaiTax({ income, expense, personal, life, health, other }) {
    expense = Math.min(expense || 0, 100000);
    life = Math.min(life || 0, 100000);
    health = Math.min(health || 0, 25000);
    // combined life+health cap 100,000 per Thai rules
    if (life + health > 100000) health = Math.max(0, 100000 - life);
    const net = Math.max(0, (income || 0) - expense - (personal || 0) - life - health - (other || 0));
    let tax = 0, prev = 0;
    for (const b of this.TAX_BRACKETS) {
      if (net > prev) tax += (Math.min(net, b.upTo) - prev) * b.rate;
      prev = b.upTo;
      if (net <= b.upTo) break;
    }
    return { net, tax, effective: income > 0 ? tax / income : 0 };
  },

  npv(rate, cashflows) {
    return cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i), 0);
  },

  // IRR via bisection — robust for typical insurance cashflows
  irr(cashflows) {
    const hasPos = cashflows.some(c => c > 0), hasNeg = cashflows.some(c => c < 0);
    if (!hasPos || !hasNeg) return null;
    let lo = -0.9999, hi = 10;
    let fLo = this.npv(lo, cashflows), fHi = this.npv(hi, cashflows);
    if (fLo * fHi > 0) return null;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      const fMid = this.npv(mid, cashflows);
      if (Math.abs(fMid) < 1e-7) return mid;
      if (fLo * fMid < 0) { hi = mid; fHi = fMid; } else { lo = mid; fLo = fMid; }
    }
    return (lo + hi) / 2;
  },

  // compound growth with monthly contributions
  invest({ principal, monthly, annualRatePct, years }) {
    const r = (annualRatePct || 0) / 100 / 12;
    const n = Math.round((years || 0) * 12);
    let total;
    if (r === 0) total = principal + monthly * n;
    else total = principal * Math.pow(1 + r, n) + monthly * ((Math.pow(1 + r, n) - 1) / r);
    const contributed = principal + monthly * n;
    return { total, contributed, gain: total - contributed };
  },

  fmt(n, digits = 0) {
    return Number(n).toLocaleString(LANG === "th" ? "th-TH" : "en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
  },
};
