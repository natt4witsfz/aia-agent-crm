/* i18n — Thai default, EN toggle */
const I18N = {
  th: {
    brandSub: "ระบบจัดการลูกค้าประกัน",
    navDashboard: "แดชบอร์ด", navCustomers: "ลูกค้า", navMap: "แผนที่ลูกค้า",
    navReminders: "การแจ้งเตือน", navPolicies: "กรมธรรม์", navClaims: "เคลม",
    navFinance: "เครื่องมือการเงิน", navAI: "ผู้ช่วย AI", navSettings: "ตั้งค่า",
    storageBannerText: "ข้อมูลถูกเก็บในเครื่องชั่วคราว — เชื่อมต่อ Supabase ในหน้าตั้งค่าเพื่อบันทึกบนคลาวด์",
    goSettings: "ไปที่ตั้งค่า",
    dashUpcoming: "แจ้งเตือนที่ใกล้ถึง", dashRecentCustomers: "ลูกค้าล่าสุด",
    statCustomers: "ลูกค้าทั้งหมด", statPolicies: "กรมธรรม์", statClaims: "เคลม", statDueReminders: "แจ้งเตือนค้าง",
    searchCustomers: "ค้นหาลูกค้า...", addCustomer: "+ เพิ่มลูกค้า",
    mapAddMode: "โหมดปักหมุดลูกค้าใหม่ (คลิกแผนที่)",
    addReminder: "+ เพิ่มการแจ้งเตือน", addPolicy: "+ เพิ่มกรมธรรม์", addClaim: "+ บันทึกเคลม",
    tabTax: "ภาษีเงินได้บุคคลธรรมดา", tabIRR: "คำนวณ IRR", tabInvest: "การลงทุน",
    taxTitle: "คำนวณภาษีเงินได้บุคคลธรรมดา (อัตราไทย)",
    taxIncome: "เงินได้ทั้งปี (บาท)", taxExpense: "หักค่าใช้จ่าย (สูงสุด 100,000)",
    taxPersonal: "ลดหย่อนส่วนตัว", taxInsurance: "เบี้ยประกันชีวิต (สูงสุด 100,000)",
    taxHealth: "เบี้ยประกันสุขภาพ (สูงสุด 25,000)", taxOther: "ลดหย่อนอื่น ๆ",
    irrTitle: "คำนวณ IRR จากกระแสเงินสด",
    irrHint: "ใส่กระแสเงินสดต่อปี คั่นด้วยจุลภาค เริ่มจากเงินจ่ายออก (ติดลบ) เช่น -50000, -50000, ..., 300000",
    investTitle: "เครื่องคำนวณการลงทุน (ดอกเบี้ยทบต้น)",
    investPrincipal: "เงินต้น (บาท)", investMonthly: "ออมเพิ่มต่อเดือน (บาท)",
    investRate: "ผลตอบแทนต่อปี (%)", investYears: "ระยะเวลา (ปี)",
    calc: "คำนวณ", save: "บันทึก", saveConnect: "บันทึกและเชื่อมต่อ", send: "ส่ง",
    cancel: "ยกเลิก", delete: "ลบ", edit: "แก้ไข", close: "ปิด", done: "เสร็จสิ้น",
    aiNoKey: "ยังไม่ได้ใส่ Claude API Key — ไปที่หน้าตั้งค่าเพื่อเปิดใช้งาน AI",
    aiPlaceholder: "ถาม AI เช่น สรุปกรมธรรม์ของลูกค้า, ร่างข้อความแจ้งต่ออายุ...",
    aiShortcuts: "คำสั่งด่วน",
    aiQuickSummary: "สรุปภาพรวมลูกค้าทั้งหมด", aiQuickRenewals: "ใครใกล้ถึงวันต่ออายุบ้าง",
    aiQuickDraft: "ร่างข้อความแจ้งเตือนต่ออายุ", aiQuickClaims: "วิเคราะห์ประวัติเคลม",
    supabaseHint: "สมัครฟรีที่ supabase.com สร้างโปรเจกต์ แล้วรัน supabase-schema.sql ใน SQL Editor จากนั้นวาง URL และ anon key ที่นี่",
    claudeHint: "สร้าง API key ได้ที่ platform.claude.com — key จะถูกเก็บไว้ในเครื่องคุณเท่านั้น",
    backupTitle: "สำรองข้อมูล", exportData: "ดาวน์โหลดข้อมูลทั้งหมด (JSON)", importData: "นำเข้าข้อมูลจากไฟล์",
    aiModel: "โมเดล",
    // customer fields
    fName: "ชื่อ-นามสกุล", fPhone: "โทรศัพท์", fEmail: "อีเมล", fAddress: "ที่อยู่",
    fType: "ประเภทลูกค้า", fStatus: "สถานะ", fNote: "บันทึกเพิ่มเติม",
    fBirthdate: "วันเกิด", fLatLng: "พิกัด (คลิกจากแผนที่)",
    typeLife: "ประกันชีวิต", typeHealth: "ประกันสุขภาพ", typeSaving: "สะสมทรัพย์",
    typeInvest: "Unit Linked/ลงทุน", typeGroup: "ประกันกลุ่ม", typeProspect: "ผู้มุ่งหวัง",
    statusActive: "ลูกค้าปัจจุบัน", statusProspect: "ผู้มุ่งหวัง", statusLapsed: "ขาดต่อ", statusVip: "VIP",
    // policy fields
    fPolicyNo: "เลขกรมธรรม์", fPlanName: "แบบประกัน", fPremium: "เบี้ย/ปี (บาท)",
    fSumAssured: "ทุนประกัน (บาท)", fStartDate: "วันเริ่มสัญญา", fRenewalDate: "วันครบกำหนดชำระ", fCustomer: "ลูกค้า",
    // claims
    fClaimDate: "วันที่เคลม", fClaimType: "ประเภทเคลม", fClaimAmount: "จำนวนเงิน (บาท)",
    fClaimStatus: "สถานะเคลม", fClaimDetail: "รายละเอียด",
    claimPending: "รอพิจารณา", claimApproved: "อนุมัติ", claimPaid: "จ่ายแล้ว", claimRejected: "ปฏิเสธ",
    // reminders
    fRemTitle: "หัวข้อ", fRemDate: "วันที่แจ้งเตือน", fRemType: "ประเภท",
    remRenewal: "ต่ออายุกรมธรรม์", remBirthday: "วันเกิดลูกค้า", remFollowup: "ติดตามลูกค้า", remOther: "อื่น ๆ",
    confirmDelete: "ยืนยันการลบ?",
    noData: "ยังไม่มีข้อมูล",
    all: "ทั้งหมด",
    viewOnMap: "ดูบนแผนที่", openDetail: "เปิดรายละเอียด",
    newCustomerHere: "เพิ่มลูกค้าที่ตำแหน่งนี้", emptyPin: "ตำแหน่งว่าง",
    policiesOf: "กรมธรรม์", claimsOf: "ประวัติเคลม",
    taxNet: "เงินได้สุทธิ", taxAmount: "ภาษีที่ต้องชำระ", taxEffective: "อัตราภาษีเฉลี่ย",
    irrAnswer: "IRR ต่อปี", irrInvalid: "คำนวณไม่ได้ — ตรวจสอบกระแสเงินสด (ต้องมีทั้งค่าบวกและลบ)",
    invTotal: "เงินรวมปลายทาง", invContrib: "เงินที่ใส่ทั้งหมด", invGain: "ผลตอบแทนที่ได้",
    baht: "บาท",
  },
  en: {
    brandSub: "Insurance Agent CRM",
    navDashboard: "Dashboard", navCustomers: "Customers", navMap: "Customer Map",
    navReminders: "Reminders", navPolicies: "Policies", navClaims: "Claims",
    navFinance: "Financial Tools", navAI: "AI Assistant", navSettings: "Settings",
    storageBannerText: "Data is stored locally for now — connect Supabase in Settings for cloud storage",
    goSettings: "Open Settings",
    dashUpcoming: "Upcoming reminders", dashRecentCustomers: "Recent customers",
    statCustomers: "Customers", statPolicies: "Policies", statClaims: "Claims", statDueReminders: "Due reminders",
    searchCustomers: "Search customers...", addCustomer: "+ Add customer",
    mapAddMode: "Pin new customer mode (click map)",
    addReminder: "+ Add reminder", addPolicy: "+ Add policy", addClaim: "+ Record claim",
    tabTax: "Personal Income Tax", tabIRR: "IRR Calculator", tabInvest: "Investment",
    taxTitle: "Thai Personal Income Tax Calculator",
    taxIncome: "Annual income (THB)", taxExpense: "Expense deduction (max 100,000)",
    taxPersonal: "Personal allowance", taxInsurance: "Life insurance premium (max 100,000)",
    taxHealth: "Health insurance premium (max 25,000)", taxOther: "Other deductions",
    irrTitle: "IRR from cashflows",
    irrHint: "Enter yearly cashflows separated by commas, starting with outflows (negative), e.g. -50000, -50000, ..., 300000",
    investTitle: "Investment calculator (compound interest)",
    investPrincipal: "Principal (THB)", investMonthly: "Monthly contribution (THB)",
    investRate: "Annual return (%)", investYears: "Years",
    calc: "Calculate", save: "Save", saveConnect: "Save & connect", send: "Send",
    cancel: "Cancel", delete: "Delete", edit: "Edit", close: "Close", done: "Done",
    aiNoKey: "No Claude API key set — open Settings to enable AI",
    aiPlaceholder: "Ask AI: summarize a customer's policies, draft a renewal message...",
    aiShortcuts: "Quick actions",
    aiQuickSummary: "Summarize all customers", aiQuickRenewals: "Who has renewals coming up",
    aiQuickDraft: "Draft a renewal reminder message", aiQuickClaims: "Analyze claims history",
    supabaseHint: "Sign up free at supabase.com, create a project, run supabase-schema.sql in the SQL editor, then paste the URL and anon key here",
    claudeHint: "Create an API key at platform.claude.com — stored only on your device",
    backupTitle: "Backup", exportData: "Download all data (JSON)", importData: "Import from file",
    aiModel: "Model",
    fName: "Full name", fPhone: "Phone", fEmail: "Email", fAddress: "Address",
    fType: "Customer type", fStatus: "Status", fNote: "Notes",
    fBirthdate: "Birthdate", fLatLng: "Coordinates (click on map)",
    typeLife: "Life", typeHealth: "Health", typeSaving: "Savings",
    typeInvest: "Unit Linked/Investment", typeGroup: "Group", typeProspect: "Prospect",
    statusActive: "Active", statusProspect: "Prospect", statusLapsed: "Lapsed", statusVip: "VIP",
    fPolicyNo: "Policy no.", fPlanName: "Plan name", fPremium: "Premium/yr (THB)",
    fSumAssured: "Sum assured (THB)", fStartDate: "Start date", fRenewalDate: "Renewal date", fCustomer: "Customer",
    fClaimDate: "Claim date", fClaimType: "Claim type", fClaimAmount: "Amount (THB)",
    fClaimStatus: "Claim status", fClaimDetail: "Details",
    claimPending: "Pending", claimApproved: "Approved", claimPaid: "Paid", claimRejected: "Rejected",
    fRemTitle: "Title", fRemDate: "Remind on", fRemType: "Type",
    remRenewal: "Policy renewal", remBirthday: "Customer birthday", remFollowup: "Follow up", remOther: "Other",
    confirmDelete: "Confirm delete?",
    noData: "No data yet",
    all: "All",
    viewOnMap: "View on map", openDetail: "Open details",
    newCustomerHere: "Add customer here", emptyPin: "Empty location",
    policiesOf: "Policies", claimsOf: "Claims history",
    taxNet: "Net income", taxAmount: "Tax payable", taxEffective: "Effective rate",
    irrAnswer: "Annual IRR", irrInvalid: "Cannot compute — cashflows need both positive and negative values",
    invTotal: "Final amount", invContrib: "Total contributed", invGain: "Total gain",
    baht: "THB",
  }
};

let LANG = localStorage.getItem("aiacrm_lang") || "th";
function t(key) { return (I18N[LANG] && I18N[LANG][key]) || I18N.th[key] || key; }

function applyI18n() {
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  const btn = document.getElementById("langToggle");
  if (btn) btn.textContent = LANG === "th" ? "EN" : "TH";
}

function toggleLang() {
  LANG = LANG === "th" ? "en" : "th";
  localStorage.setItem("aiacrm_lang", LANG);
  applyI18n();
  if (window.renderAll) window.renderAll();
}
