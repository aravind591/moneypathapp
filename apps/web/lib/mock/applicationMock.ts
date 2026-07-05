// Central mock data for the dashboard screens. Every value here is lifted directly
// from the designer's mockups so the screens stay numerically consistent with one
// another (and with the images). This is presentational mock data only — the backend
// does not model most of these fields yet (interest rate, processing fee, tranches,
// credit score, EMI, lenders). When real APIs land, map them onto these shapes.

export interface StepDef {
  /** Node number as printed in the mockup (note the design skips 4). */
  num: number;
  label: string;
}

// The 9-node horizontal progress used on the Dashboard and My Application screens.
// The mockup prints nodes 1,2,3,5,6,7,8,9 (skipping 4) with these labels.
export const PROGRESS_STEPS: StepDef[] = [
  { num: 1, label: "Submitted" },
  { num: 2, label: "Under Review" },
  { num: 3, label: "Sanctioned / Hold / Declined" },
  { num: 5, label: "Sanctioned" },
  { num: 6, label: "Processing Fee" },
  { num: 7, label: "Disbursement" },
  { num: 8, label: "Completed" },
  { num: 9, label: "" },
];

// Index of the current step (0-based) — "Under Review" is active in the mockups.
export const CURRENT_STEP_INDEX = 1;
export const PROGRESS_PERCENT = 22;
export const PROGRESS_STARTED = "Started Jan 14";

// Map the backend's 5-stage LoanStage (+ status) onto the 9-node presentational
// stepper index. The backend stays the source of truth; this is display-only.
// Stepper nodes: 0 Submitted · 1 Under Review · 2 Sanctioned/Hold/Declined ·
// 3 Sanctioned · 4 Processing Fee · 5 Disbursement · 6 Completed.
export function stageToStepIndex(stage?: string, status?: string): number {
  if (status === "REJECTED" || status === "HOLD") return 2; // decision node
  switch (stage) {
    case "SUBMITTED":
      return 0;
    case "DOCUMENT_REVIEW":
      return 1;
    case "SENT_TO_BANK":
      return 2;
    case "SANCTIONED":
      return 3;
    case "DISBURSED":
      return 5;
    default:
      return CURRENT_STEP_INDEX;
  }
}

// Rough completion percentage for the progress caption, by stepper index.
export function stepPercent(index: number): number {
  const pct = [11, 22, 33, 55, 66, 78, 100];
  return pct[Math.min(index, pct.length - 1)] ?? PROGRESS_PERCENT;
}

// Human-friendly label for the status badge, derived from the real stage/status.
export function statusLabel(stage?: string, status?: string): string {
  if (status === "REJECTED") return "Declined";
  if (status === "HOLD") return "On Hold";
  switch (stage) {
    case "SUBMITTED":
      return "Submitted";
    case "DOCUMENT_REVIEW":
      return "Under Review";
    case "SENT_TO_BANK":
      return "Sent to Bank";
    case "SANCTIONED":
      return "Sanctioned";
    case "DISBURSED":
      return "Disbursed";
    default:
      return "Submitted";
  }
}

// Short, friendly label for each stage — used in the Recent Activity timeline.
export function stageActivityLabel(stage?: string): string {
  switch (stage) {
    case "SUBMITTED":
      return "Application Submitted";
    case "DOCUMENT_REVIEW":
      return "Document Review Started";
    case "SENT_TO_BANK":
      return "Sent to Lender";
    case "SANCTIONED":
      return "Loan Sanctioned";
    case "DISBURSED":
      return "Funds Disbursed";
    default:
      return "Status Updated";
  }
}

// Build a short, human application reference from the real UUID, e.g.
// "5f3c1a2b-..." -> "MP-5F3C1A2B". Stable per application, no fabrication.
export function applicationRef(id?: string): string {
  if (!id) return "—";
  return `MP-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

// Format an ISO date string as "14 Jan 2025, 11:32 AM" (or "—" if missing).
export function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Format an ISO date string as a short date, e.g. "14 Jan 2025".
export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const mockUser = {
  name: "Michael Robinson",
  email: "michael.robin@gmail.com",
  firstName: "Siddarth", // dashboard greeting uses this
};

export const mockApplication = {
  id: "MP-2025-00847",
  ref: "LN-HDFC-2025-4721",
  status: "Under Review",
  submittedOn: "Submitted 14 Jan 2025",
  lender: "HDFC Credila",
  advisor: "Priya Mehta",
  submissionDate: "14 Jan 2025, 11:32 AM",
  lastUpdated: "Today, 9:15 AM",
  estCompletion: "28 Feb 2025",
  university: "University of Toronto",
  course: "M.S. Computer Science",
  country: "Canada",
  countryFlag: "🇨🇦",
  loanAmount: "₹40,00,000",
  loanAmountNumber: 4000000,
  coApplicant: "Suresh Ramesh",
  intake: "Fall 2025",
};

export const mockRecentActivity = [
  {
    title: "Application Under Review",
    time: "Today, 9:15 AM · HDFC Credila Team",
    body: "Your application has been assigned to the underwriting team. Initial review in progress.",
    badge: "In Progress",
    state: "current" as const,
  },
  {
    title: "Documents Uploaded",
    time: "15 Jan 2025, 4:30 PM",
    body: "8 documents submitted including PAN, Aadhaar, bank statements, and offer letter.",
    badge: "Done",
    state: "done" as const,
  },
  {
    title: "Application Submitted",
    time: "14 Jan 2025, 11:32 AM",
    body: "Application MP-2025-00847 successfully submitted to HDFC Credila.",
    badge: "Done",
    state: "done" as const,
  },
];

export const mockAdvisorUpdate = {
  initials: "PM",
  name: "Priya Mehta",
  role: "Senior Loan Advisor · Moneypath",
  message:
    "Your application is progressing well. The underwriter has received all documents and review typically takes 3–5 business days. I'll update you once credit check is initiated.",
  time: "Today, 9:30 AM",
};

// ---- Dashboard ----
export const mockDashboardStats = [
  { label: "LOAN TARGET", value: "₹1.1Cr", sub: "MS CS · MIT · Fall 2025", tone: "default" as const },
  { label: "ELIGIBILITY SCORE", value: "87", suffix: "/100", sub: "+4 pts since last week", tone: "info" as const },
  { label: "APP COMPLETION", value: "72%", sub: "3 actions remaining", tone: "warning" as const },
  { label: "MATCHED LENDERS", value: "14", sub: "Best rate: 10.5%", tone: "info" as const },
];

export const mockApplicationStage = [
  { num: 1, title: "Profile & Basic Info", sub: "Completed · 2 days ago", badge: "Done" },
  { num: 2, title: "Academic & Financial Details", sub: "Completed · 1 day ago", badge: "Done" },
  { num: 3, title: "Document Verification", sub: "In progress · 7 of 10 docs uploaded", badge: "Active" },
  { num: 4, title: "Lender Submission", sub: "Awaiting document completion", badge: "" },
  { num: 5, title: "Approval & Disbursement", sub: "Est. 5–10 business days after submission", badge: "" },
];

export const mockMatchedLenders = [
  { name: "HDFC Credila", rate: "10.50%", match: 91, speed: "Fast" },
  { name: "HDFC Credila", rate: "10.50%", match: 91, speed: "Fast" },
  { name: "HDFC Credila", rate: "10.50%", match: 91, speed: "Fast" },
];

export const mockProfileCompletion = {
  percent: 72,
  incompleteSections: 3,
  rows: [
    { label: "Personal Info", value: "✓", pct: 100, tone: "brand" as const },
    { label: "Documents", value: "70%", pct: 70, tone: "brand" as const },
    { label: "Co-applicant", value: "60%", pct: 60, tone: "warning" as const },
    { label: "Financial Details", value: "40%", pct: 40, tone: "danger" as const },
  ],
};

export const mockPendingActions = [
  { title: "Upload Passport", sub: "Required for international applications", action: "Upload" },
  { title: "Co-applicant Income Proof", sub: "3 months salary slips needed", action: "Add" },
  { title: "E-sign Consent Form", sub: "Required before lender submission", action: "Sign" },
];

// ---- Credit Check ----
export const mockCreditCheck = {
  progress: 68,
  estLeft: "Estimated 2 days left",
  lastUpdated: "Today, 9:15 AM",
  started: "Started Jan 17, 2025",
  student: {
    name: "Arjun Ramesh · Primary Applicant",
    status: "In Review",
    rows: [
      { title: "Credit Score", sub: "CIBIL via TransUnion", badge: "Excellent", state: "done" as const },
      { title: "Identity Verification", sub: "PAN · Aadhaar", badge: "Verified", state: "done" as const },
      { title: "Financial Verification", sub: "Bank statements · ITR", badge: "In Progress", state: "current" as const },
    ],
  },
  coApplicant: {
    name: "Suresh Ramesh · Father",
    status: "Verified",
    rows: [
      { title: "Income Verification", sub: "₹1.8L / month gross", badge: "Verified", state: "done" as const },
      { title: "Employment Verification", sub: "Salaried · 12+ yrs", badge: "Verified", state: "done" as const },
      { title: "Credit Verification", sub: "CIBIL Score: 748", badge: "Cleared", state: "done" as const },
    ],
  },
  timeline: [
    { title: "Credit Check Initiated", time: "17 Jan 2025, 10:00 AM", body: "Credit assessment formally initiated by HDFC Credila underwriting team.", state: "done" as const },
    { title: "Documents Reviewed", time: "17 Jan 2025, 3:45 PM", body: "All 8 submitted documents reviewed and accepted by the lender.", state: "done" as const },
    { title: "Verification Running", time: "Today, 9:15 AM · In Progress", body: "Financial and employment verification currently active. Est. completion: Jan 21.", state: "current" as const },
    { title: "Assessment Completed", time: "Est. 21 Jan 2025", body: "", state: "upcoming" as const },
  ],
  insights: {
    positive: [
      { bold: "Strong CIBIL Score", text: " — 762 is well above the lender's minimum threshold of 700." },
      { bold: "Stable co-applicant income", text: " — Monthly income exceeds the required EMI coverage ratio by 2.4×." },
      { bold: "Clean repayment history", text: " — No defaults or late payments in the past 36 months." },
    ],
    attention: [
      { bold: "6-month bank statement", text: " — Jan–June 2024 statement shows 2 months of lower balance." },
    ],
    additional: [
      { bold: "letter of explanation", text: "Lender may request a ", textAfter: " for the employment gap in Apr–May 2023. Have it ready." },
    ],
  },
};

// ---- Loan Sanction ----
export const mockSanction = {
  approvedAmount: "₹38,50,000",
  requestedAmount: "₹40,00,000",
  sanctionedOn: "HDFC Credila · Sanctioned 28 Jan 2025 · Offer valid until 28 Feb 2025",
  details: [
    { label: "Lender", value: "HDFC Credila", accent: false },
    { label: "Interest Rate", value: "10.50% p.a.", accent: true },
    { label: "Processing Fee", value: "₹15,000 (0.04%)", accent: false },
    { label: "Loan Tenure", value: "120 months (10 yrs)", accent: false },
    { label: "Moratorium", value: "Course + 12 months", accent: false },
  ],
  emi: { value: "₹52,140", sub: "/month post moratorium" },
  comparison: [
    { metric: "Amount", requested: "₹40,00,000", approved: "₹38,50,000" },
    { metric: "Tenure", requested: "120 mo.", approved: "120 mo." },
    { metric: "Rate", requested: "—", approved: "10.50%" },
  ],
  documents: [
    { title: "Sanction Letter", sub: "Official PDF · HDFC Credila", action: "download" as const },
    { title: "Offer PDF", sub: "Loan terms & conditions", action: "download" as const },
    { title: "Terms & Conditions", sub: "Full agreement document", action: "view" as const },
  ],
  expiry: "Offer expires 28 Feb 2025. Accepting initiates processing fee and disbursement flow.",
};

// ---- Notifications / Application On Hold ----
export const mockNotifications = [
  {
    group: "TODAY",
    items: [
      { title: "Application on hold!", time: "11:24 AM", body: "MP-2025-00847 · HDFC Credila · 4 actions required to proceed", tags: ["Document Request", "Urgent"], urgent: true, unread: true },
      { title: "New message from HDFC Credila", time: "11:10 AM", body: "Please ensure passport copy includes all pages including blank ones…", tags: ["Lender Message"], unread: true },
      { title: "PAN Card verified successfully", time: "9:45 AM", body: "Your PAN Card has been verified via NSDL database. Identity confirmed.", tags: ["Verification"], unread: true },
      { title: "Tranche 2 disbursed — ₹21,00,000", time: "Yesterday", body: "Living allowance has been credited to your HDFC Bank account ending 4821", tags: ["Disbursement"], unread: true },
      { title: "Tranche 3 scheduled — Jan 15, 2026", time: "Yesterday", body: "Semester 2 tuition of ₹21L will be released on January 15, 2026", tags: ["Disbursement"] },
    ],
  },
  {
    group: "MAY 17, 2025",
    items: [
      { title: "Application submitted to HDFC Credila", time: "10:24 AM", body: "Your loan application #MP-2025-00847 has been successfully submitted", tags: ["Application"] },
      { title: "3 loan offers received", time: "6:42 PM", body: "HDFC Credila, Avanse, and SBI have approved your application. Review offers now.", tags: ["Loan Offer"] },
      { title: "Welcome to Moneypath", time: "May 15", body: "Your account is ready. Start your loan application today.", tags: ["System"] },
    ],
  },
];

export const mockHold = {
  title: "Application On Hold",
  sub: "MP-2025-00847 · HDFC Credila · 4 actions required to proceed",
  respondBy: "25 Jan 2025",
  daysRemaining: 5,
  actions: [
    { title: "Upload Updated Bank Statement", sub: "Latest 6-month statement (Jul–Dec 2024) required" },
    { title: "Upload Salary Certificate", sub: "Co-applicant salary certificate from employer" },
    { title: "Upload Admission Letter", sub: "Official admission letter from University of Toronto" },
    { title: "Complete KYC Verification", sub: "Video KYC with HDFC Credila representative pending" },
  ],
  documents: [
    { title: "Bank Statement (Jul–Dec 2024)", sub: "PDF · Max 10MB · 6-month consolidated" },
    { title: "Salary Certificate", sub: "PDF or JPG · Employer letterhead required" },
    { title: "Admission Letter", sub: "Official PDF from university portal" },
  ],
  deadlineHoldPlaced: "Hold placed Jan 20",
  deadlineExpires: "Expires Jan 25",
  deadlineDate: "Deadline: 25 Jan 2025",
  advisorNote: {
    initials: "PM",
    name: "Priya Mehta",
    message:
      "The lender has put your application on hold pending 4 documents. Please upload them before Jan 25 to avoid delays. The bank statement is the most critical — make sure it covers July–December 2024. I'm available for a quick call if needed.",
    time: "20 Jan 2025, 2:30 PM",
  },
  nextSteps: [
    "Upload all 4 documents",
    "Notify advisor after upload",
    "Complete video KYC",
    "Resubmit for review",
  ],
};

// ---- Processing Fee ----
export const mockProcessingFee = {
  stats: [
    { label: "TOTAL FEE", value: "₹15,000", sub: "HDFC Credila · 0.04% of loan", tone: "default" as const },
    { label: "AMOUNT PAID", value: "₹10,000", sub: "2 payments made", tone: "brand" as const },
    { label: "REMAINING", value: "₹5,000", sub: "Due: 10 Feb 2025", tone: "warning" as const },
    { label: "COMPLETION", value: "67%", sub: "₹5,000 to complete", tone: "info" as const },
  ],
  percent: 67,
  paidLabel: "₹10,000 paid of ₹15,000 total",
  paid: "₹10,000",
  remaining: "₹5,000",
  history: [
    { date: "29 Jan 2025", txn: "TXN-HDFC-8821-01", amount: "₹5,000", method: "UPI · GPay", status: "Paid" },
    { date: "30 Jan 2025", txn: "TXN-HDFC-8821-02", amount: "₹5,000", method: "NEFT · SBI", status: "Paid" },
    { date: "10 Feb 2025", txn: "—", amount: "₹5,000", method: "—", status: "Pending" },
  ],
  receipts: [
    { title: "Payment Receipt — ₹5,000", sub: "TXN-HDFC-8821-01 · 29 Jan 2025", view: true, download: true },
    { title: "Payment Receipt — ₹5,000", sub: "TXN-HDFC-8821-02 · 30 Jan 2025", view: true, download: true },
    { title: "Receipt — ₹5,000", sub: "Pending · Available after payment", view: false, download: false },
    { title: "Processing Fee Invoice", sub: "Full invoice · HDFC Credila · ₹15,000", view: true, download: true },
  ],
};

// ---- Disbursement ----
export const mockDisbursement = {
  stats: [
    { label: "SANCTIONED AMOUNT", value: "₹38,50,000", sub: "HDFC Credila · Approved 28 Jan 2025", tone: "info" as const },
    { label: "TOTAL DISBURSED", value: "₹24,00,000", sub: "2 disbursements · 62.3% of sanction", tone: "brand" as const },
    { label: "REMAINING BALANCE", value: "₹14,50,000", sub: "Next disbursement: Aug 2025", tone: "warning" as const },
  ],
  percent: 62.3,
  progressLabel: "₹24,00,000 of ₹38,50,000",
  firstDisbursed: "First disbursed: 15 Feb 2025",
  releasedLabel: "62.3% Released",
  milestones: [
    { ord: "1st", title: "First Disbursement", sub: "15 Feb 2025 · Semester 1", amount: "₹12,00,000", badge: "Released", done: true },
    { ord: "2nd", title: "Second Disbursement", sub: "20 Feb 2025 · Living expense", amount: "₹12,00,000", badge: "Released", done: true },
    { ord: "3rd", title: "Third Disbursement", sub: "Aug 2025 · Semester 2", amount: "₹14,50,000", badge: "Scheduled", done: false },
  ],
  remittance: {
    university: "University of Toronto",
    sub: "Canada · CAD Tuition",
    flag: "🇨🇦",
    status: "Completed",
    rows: [
      { label: "Amount Sent (INR)", value: "₹12,00,000" },
      { label: "Amount in CAD", value: "CAD 19,290" },
      { label: "Exchange Rate", value: "1 CAD = ₹62.21" },
      { label: "Transfer Date", value: "16 Feb 2025" },
      { label: "Transaction Ref", value: "WIRE-2025-CAD-00419" },
    ],
  },
  remittanceStatus: [
    { title: "Tuition — Semester 1", sub: "CAD 19,290 · 16 Feb 2025", flag: "🇨🇦", badge: "Done", done: true },
    { title: "Living Expenses", sub: "INR account · 20 Feb 2025", badge: "Done", done: true },
    { title: "Tuition — Semester 2", sub: "Scheduled Aug 2025", flag: "🇨🇦", badge: "Upcoming", done: false },
  ],
  documents: [
    { title: "Transfer Confirmation", sub: "HDFC Credila · Feb 2025" },
    { title: "Payment Proof", sub: "University receipt · UoT" },
  ],
};

// ---- Lenders (no mockup — same visual language) ----
export const mockLenders = [
  { name: "HDFC Credila", rate: "10.50%", match: 91, speed: "Fast", maxAmount: "₹50L", processing: "0.04%" },
  { name: "Avanse", rate: "11.25%", match: 86, speed: "Fast", maxAmount: "₹45L", processing: "1.00%" },
  { name: "SBI Education", rate: "9.80%", match: 78, speed: "Moderate", maxAmount: "₹40L", processing: "0.50%" },
  { name: "ICICI Bank", rate: "10.90%", match: 74, speed: "Moderate", maxAmount: "₹40L", processing: "1.00%" },
  { name: "Axis Bank", rate: "11.50%", match: 69, speed: "Slow", maxAmount: "₹35L", processing: "1.00%" },
  { name: "InCred", rate: "12.00%", match: 64, speed: "Fast", maxAmount: "₹30L", processing: "1.50%" },
];
