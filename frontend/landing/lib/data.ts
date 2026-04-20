// lib/data.ts — All content data for AndikishaHR landing

export const COMPANY = {
  name: "AndikishaHR",
  tagline: "Built for Kenya. Ready for Africa.",
  description:
    "HR and Payroll built for the realities of African business. Starting with Kenya.",
  email: "hello@andikishahr.com",
  phone: "+254 700 000 000",
  whatsapp: "https://wa.me/254700000000",
  address: "Westlands, Nairobi, Kenya",
  social: {
    twitter: "https://twitter.com/andikishahr",
    linkedin: "https://linkedin.com/company/andikishahr",
    instagram: "https://instagram.com/andikishahr",
  },
};

export const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const STATS = [
  { value: "500+", label: "companies onboarded", animated: true, target: 500 },
  { value: "KES 2.1B+", label: "payroll processed" },
  { value: "99.8%", label: "platform uptime" },
  { value: "28hrs", label: "saved per payroll cycle" },
];

export const FEATURES_TABS = [
  {
    id: "payroll",
    label: "Payroll & Compliance",
    items: [
      {
        title: "Automated PAYE calculation",
        description:
          "Current KRA brackets applied automatically. Personal relief, insurance relief, and all deductions calculated without manual input.",
      },
      {
        title: "Full statutory stack",
        description:
          "NSSF Tier I & II, SHIF, Housing Levy, NITA levy, and HELB deductions — all computed in a single payroll run.",
      },
      {
        title: "One-click KRA filing",
        description:
          "Submit PAYE returns directly from the platform. No logging into iTax separately. The audit trail stays in your account.",
      },
      {
        title: "Payslip delivery by SMS and email",
        description:
          "Every employee gets their payslip the moment payroll is approved. On their phone, in their preferred language.",
      },
    ],
    mockupTitle: "Payroll Run — March 2026",
    mockupRows: [
      { label: "Basic Salary", value: "KES 2,840,000" },
      { label: "PAYE Deducted", value: "KES 428,500" },
      { label: "NSSF (Employee)", value: "KES 41,160" },
      { label: "SHIF", value: "KES 64,800" },
      { label: "Housing Levy", value: "KES 48,600" },
      { label: "Net Pay", value: "KES 2,256,940" },
      { label: "KRA Filing Status", badge: "Filed", badgeColor: "green" },
      { label: "Processing Time", badge: "24 minutes", badgeColor: "amber" },
    ],
  },
  {
    id: "people",
    label: "People Management",
    items: [
      {
        title: "Employee lifecycle management",
        description:
          "From offer letter to exit interview — onboarding, contract management, role changes, and offboarding in one place.",
      },
      {
        title: "Leave and time-off management",
        description:
          "Annual leave, sick leave, maternity, and paternity — fully configurable. Leave balances update automatically with each approval.",
      },
      {
        title: "Full audit trail",
        description:
          "Every change to employee data, salary, or benefits is logged with a timestamp and the user who made it.",
      },
      {
        title: "Role-based access control",
        description:
          "HR Managers, Payroll Officers, Line Managers, and Employees each see only what they need.",
      },
    ],
    mockupTitle: "Employee Profile",
    mockupRows: [
      { label: "Name", value: "Wanjiru M." },
      { label: "Department", value: "Operations" },
      { label: "Contract Type", badge: "Permanent", badgeColor: "blue" },
      { label: "Annual Leave", value: "18 / 21 days" },
      { label: "Sick Leave Taken", value: "2 days" },
      { label: "Last Salary Review", value: "Jan 2026" },
      { label: "Documents", badge: "4 on file", badgeColor: "green" },
    ],
  },
  {
    id: "employee",
    label: "Employee Experience",
    items: [
      {
        title: "Mobile-first employee portal",
        description:
          "Employees check payslips, request leave, and update details from their phone. No app install required.",
      },
      {
        title: "M-Pesa salary disbursement",
        description:
          "Pay employees directly to their M-Pesa wallets. No bank account required. Confirmation sent instantly on both sides.",
      },
      {
        title: "WhatsApp and SMS notifications",
        description:
          "Payslip delivery, leave approval updates, and compliance alerts via the channels your team already uses.",
      },
      {
        title: "Swahili language option",
        description:
          "The employee portal switches to Kiswahili with one tap. Every employee understands their payslip.",
      },
    ],
    mockupTitle: "Employee App — March 2026",
    mockupRows: [
      { label: "Net Salary", value: "KES 48,320" },
      { label: "Payment Method", badge: "M-Pesa ✓", badgeColor: "green" },
      { label: "Leave Balance", value: "8 days remaining" },
      { label: "Pending Request", badge: "Under Review", badgeColor: "amber" },
      { label: "Payslip", badge: "Download PDF", badgeColor: "blue" },
      { label: "Language", value: "Kiswahili / English" },
    ],
  },
];

export const BENEFITS = [
  {
    icon: "clock",
    title: "From 3 days to 30 minutes",
    body: "A payroll run that used to take three days of gathering timesheets, calculating deductions, and handling exceptions now completes in under 30 minutes. Your HR team processes payroll for 50 employees in the time it previously took to reconcile one department.",
    stat: "28 hours saved per payroll cycle on average",
  },
  {
    icon: "shield",
    title: "Stop paying for compliance mistakes",
    body: "KRA penalties for late or incorrect PAYE filings start at KES 10,000 and can reach 25% of the outstanding tax. AndikishaHR flags errors before you submit — not after the audit arrives. Every statutory obligation has a pre-flight check.",
    stat: "Zero penalty incidents across all active accounts",
  },
  {
    icon: "trending-up",
    title: "Built to scale with you",
    body: "Going from 10 to 100 employees changes your HR complexity more than most founders expect. AndikishaHR adds employees, not spreadsheet rows. Your payroll structure, compliance rules, and approval flows scale without a system change.",
    stat: "Customers scale from 5 to 500 employees on the same plan",
  },
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Add your team",
    description:
      "Import your employee roster, set salary structures, and configure your statutory obligations. Takes about 45 minutes for a company of 30 people.",
  },
  {
    step: 2,
    title: "Run payroll",
    description:
      "Click \"Run Payroll.\" AndikishaHR calculates every deduction, checks compliance, and generates payslips. Review the summary, then approve.",
  },
  {
    step: 3,
    title: "File and pay",
    description:
      "One click submits your statutory returns to KRA and NSSF. Employees receive their payslips. Your finance team gets the reconciliation report.",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "We used to spend three days every month preparing payroll for 45 people. Now it takes less than an hour and I no longer worry about KRA. The compliance piece alone was worth switching.",
    name: "Wanjiru M.",
    role: "HR Manager",
    company: "Logistics company, Nairobi",
    employees: "48 employees",
    initials: "WM",
  },
  {
    quote:
      "The PAYE calculation used to terrify me because the brackets keep changing. AndikishaHR updates automatically. I review the run, approve it, and move on. That peace of mind is real.",
    name: "David O.",
    role: "Finance Director",
    company: "Mombasa",
    employees: "22 employees",
    initials: "DO",
  },
  {
    quote:
      "Our employees actually like the system. They check their payslips on their phones the same day payroll runs. That alone cut the questions coming to my desk by more than half.",
    name: "Amina H.",
    role: "People Operations Lead",
    company: "Tech company, Nairobi",
    employees: "67 employees",
    initials: "AH",
  },
];

export const PRICING_PLANS = [
  {
    name: "Starter",
    description: "Up to 20 employees. Everything you need to run compliant payroll.",
    price: "KES 500",
    unit: "per employee / month",
    featured: false,
    cta: "Start Free (14 days)",
    ctaHref: "/demo",
    features: [
      "Full payroll & compliance (PAYE, NSSF, SHIF, Housing Levy)",
      "KRA one-click filing",
      "Employee self-service portal",
      "SMS & email payslip delivery",
      "Email support",
    ],
  },
  {
    name: "Growth",
    description:
      "Up to 100 employees. The complete HR and payroll platform for growing teams.",
    price: "KES 750",
    unit: "per employee / month",
    featured: true,
    badge: "Most Popular",
    cta: "Start Free (14 days)",
    ctaHref: "/demo",
    features: [
      "Everything in Starter",
      "Leave & absence management",
      "Time & attendance tracking",
      "M-Pesa payroll disbursement",
      "Priority support (chat + phone)",
    ],
  },
  {
    name: "Scale",
    description:
      "100+ employees. Custom integrations, dedicated support, and an SLA guarantee.",
    price: "Custom",
    unit: "Tailored to your headcount",
    featured: false,
    cta: "Talk to Sales",
    ctaHref: "/contact",
    features: [
      "Everything in Growth",
      "Custom API integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "Multi-branch / multi-county payroll",
    ],
  },
];

export const FAQ_ITEMS = [
  {
    question: "How does AndikishaHR handle KRA regulatory changes?",
    answer:
      "When KRA updates PAYE brackets, NSSF tiers change, or SHIF rates are revised, we update the platform before the effective date. You do not need to track gazette notices or manually update any formulas. Your next payroll run uses the correct rates automatically.",
  },
  {
    question: "Can I migrate from my current spreadsheet or payroll system?",
    answer:
      "Yes. You can import employee data from a CSV template that takes about 10 minutes to complete for a team of 30. We also offer a one-time guided setup for Growth and Scale plan customers where our team does the migration with you on a call.",
  },
  {
    question: "Does it support M-Pesa for salary payments?",
    answer:
      "M-Pesa salary disbursement is included in the Growth plan. Employees receive a payment confirmation on their phone the moment you approve the payroll run. You can mix bank and M-Pesa payments in the same payroll cycle.",
  },
  {
    question:
      "What happens if I have both permanent and casual employees?",
    answer:
      "The platform handles both employment types with separate compliance rules. Casual workers have different PAYE withholding obligations under KRA guidelines, and the system applies the correct treatment automatically based on the contract type you assign each employee.",
  },
  {
    question: "Is my data safe — where is it stored?",
    answer:
      "Your data is stored in East Africa on encrypted infrastructure. We use schema-level tenant isolation — meaning your data is never shared with or visible to another company. The platform is GDPR-ready and we are working toward ISO 27001 certification.",
  },
  {
    question:
      "Can employees access their payslips on mobile without installing an app?",
    answer:
      "Yes. The employee portal is a mobile-optimised web app. Employees open a link on their phone — no download required. They log in, view their payslip, download a PDF, request leave, and update personal details, all from the browser.",
  },
  {
    question: "Does it handle multi-branch or multi-county payroll?",
    answer:
      "Multi-branch payroll with consolidated reporting is available on the Scale plan. You can run separate payrolls per branch with a single consolidated view for finance. Multi-country support (Uganda, Tanzania) is coming in Phase 2 of our roadmap.",
  },
  {
    question: "What support do you offer during setup?",
    answer:
      "All plans include email support and access to our knowledge base. Growth plan customers get priority chat and phone support plus a guided onboarding call. Scale customers get a dedicated account manager from day one.",
  },
];

export const BLOG_POSTS = [
  {
    slug: "paye-2026-bracket-changes",
    title: "2026 PAYE Bracket Changes: What Every Kenyan Employer Needs to Know",
    excerpt:
      "KRA updated the PAYE tax brackets effective January 2026. Here is a plain-English breakdown of what changed, who is affected, and how AndikishaHR handles the transition automatically.",
    date: "March 15, 2026",
    category: "Compliance",
    readTime: "5 min read",
  },
  {
    slug: "spreadsheet-payroll-cost",
    title: "The Real Cost of Running Payroll on Spreadsheets",
    excerpt:
      "85% of Kenyan SMEs still use Excel for payroll. We looked at the actual financial and time cost for a 30-person company — and the numbers are harder to ignore than most business owners realise.",
    date: "February 28, 2026",
    category: "Payroll",
    readTime: "7 min read",
  },
  {
    slug: "nssf-tier-explainer",
    title: "NSSF Tier I and Tier II: A Clear Explainer for HR Teams",
    excerpt:
      "The NSSF Act introduced tiered contributions that still confuse many HR managers. Here is exactly how the tiers work, which employees qualify for which tier, and what employers need to remit.",
    date: "February 10, 2026",
    category: "Compliance",
    readTime: "6 min read",
  },
  {
    slug: "onboarding-kenya-sme",
    title: "How to Onboard a New Employee in Kenya: The Complete Checklist",
    excerpt:
      "From PIN certificate to NSSF registration to contract signing — onboarding in Kenya has more steps than most people expect. This checklist covers every legal requirement for employers.",
    date: "January 22, 2026",
    category: "HR Management",
    readTime: "8 min read",
  },
  {
    slug: "shif-vs-nhif",
    title: "SHIF vs NHIF: What Changed and What It Means for Your Payroll",
    excerpt:
      "The transition from NHIF to SHIF brought new contribution rates, a new calculation basis, and questions many employers have not fully resolved. We break it down clearly.",
    date: "January 8, 2026",
    category: "Compliance",
    readTime: "5 min read",
  },
  {
    slug: "housing-levy-guide",
    title: "Kenya Housing Levy: Employer and Employee Obligations Explained",
    excerpt:
      "The 1.5% + 1.5% Housing Levy applies to most Kenyan employees. Here is what you need to deduct, what you need to contribute as an employer, and how to remit correctly.",
    date: "December 18, 2025",
    category: "Compliance",
    readTime: "4 min read",
  },
];
