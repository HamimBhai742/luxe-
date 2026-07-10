import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions | LUXE Marketplace",
  description: "Read the Terms and Conditions governing your use of LUXE Marketplace, purchases, licensing, and account settings.",
};

export default function TermsPage() {
  const sections = [
    { id: "introduction", title: "1. Introduction" },
    { id: "accounts", title: "2. Account Registry & Security" },
    { id: "purchases", title: "3. Purchases, Payments & Pricing" },
    { id: "shipping", title: "4. Shipping, Customs & Returns" },
    { id: "licensing", title: "5. Intellectual Property & License" },
    { id: "liability", title: "6. Limitation of Liability" },
    { id: "changes", title: "7. Modifications to Terms" },
    { id: "governing-law", title: "8. Governing Law & Jurisdiction" },
  ];

  return (
    <div className="bg-white dark:bg-black text-zinc-800 dark:text-zinc-200 transition-colors duration-500 min-h-screen">
      
      {/* ========================================================================= */}
      {/* HEADER BANNER */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden border-b border-zinc-100 dark:border-zinc-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center rounded-full bg-blue-500/10 dark:bg-blue-400/10 px-4 py-1.5 text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase ring-1 ring-inset ring-blue-500/20">
            Legal Policies
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-500">
            Last Updated: July 9, 2026 • Effective Date: July 9, 2026
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DUAL-COLUMN POLICIES CONTENT */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left Column: Sticky Section Links (Desktop only) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 space-y-6">
              <h3 className="text-xs font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                Table of Contents
              </h3>
              <nav className="flex flex-col space-y-3.5">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block text-xs font-bold text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-6">
                <Link
                  href="/dashboard/support"
                  className="text-xs font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Need legal help?</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Column: Policies Prose */}
          <div className="flex-1 space-y-12 max-w-3xl">
            
            {/* Introductory Callout */}
            <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50/30 p-6 dark:border-zinc-800 dark:bg-zinc-900/10">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2">Please Read Carefully</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                These terms govern your access to and use of the LUXE Marketplace website, dashboard portals, and electronic purchasing systems. By browsing the website or creating a registered user account, you signify your full agreement to these policies.
              </p>
            </div>

            {/* 1. Introduction */}
            <section id="introduction" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">1. Introduction</h2>
              <div className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  Welcome to LUXE Marketplace (&quot;LUXE&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and LUXE, concerning your access to and use of the website located at http://localhost:3000 as well as any other media form, mobile application, or dashboard portal connected thereto.
                </p>
                <p>
                  Failure to read, agree with, or comply with these terms bars you from utilizing any services, placing orders, or accessing dashboard functions. We advise retaining a digital copy of these terms for your record-keeping.
                </p>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 2. Account Registry & Security */}
            <section id="accounts" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">2. Account Registry & Security</h2>
              <div className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  To complete orders or modify settings (e.g. bio, location, password), you must register a customer profile on our system. You agree to provide accurate, current, and complete registration info and promptly update it in the settings dashboard if changes occur.
                </p>
                <p>
                  You are solely responsible for maintaining the confidentiality of your account credentials (including passwords) and monitor all activities occurring under your session. LUXE reserves the right to suspend, terminate, or remove accounts found using suspicious base64 payloads, or attempting unauthorized operations.
                </p>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 3. Purchases, Payments & Pricing */}
            <section id="purchases" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">3. Purchases, Payments & Pricing</h2>
              <div className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  All transactions placed through the cart and checkout routes are processed securely using our encrypted gateway. Prices listed in collections are denominated in USD and are subject to immediate adjustments depending on component sourcing constraints.
                </p>
                <p>
                  By finalizing payment, you verify that you hold authorization to charge the specified credit card, digital wallet, or balance. LUXE reserves the right to reject, cancel, or flag any order containing suspicious quantities, incorrect listed values, or mismatching bank clearances.
                </p>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 4. Shipping, Customs & Returns */}
            <section id="shipping" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">4. Shipping, Customs & Returns</h2>
              <div className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  Shipping timelines are estimations and can shift due to solar corridor transport delays or regional customs checks. Customers are responsible for any localized import tariffs, customs clearances, or storage fees.
                </p>
                <p>
                  If you are unsatisfied with a premium workspace hardware purchase, you may initiate a return request within 14 calendar days of receipt. All hardware must remain in its original minimalist glassmorphic packaging, completely free of user wear or scuffs.
                </p>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 5. Intellectual Property & License */}
            <section id="licensing" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">5. Intellectual Property & License</h2>
              <div className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  Unless stated otherwise, all website assets, code blocks, layout styles, vector SVGs, and brand typography are the exclusive intellectual property of LUXE and protected under international copy laws.
                </p>
                <p>
                  You are granted a limited, revocable, non-transferable license to access the site and place orders. Any attempts to reverse-engineer dashboard hooks, scrap catalog prices, or copy our custom UI designs for competing portals will trigger immediate legal revocation.
                </p>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 6. Limitation of Liability */}
            <section id="liability" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">6. Limitation of Liability</h2>
              <div className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  LUXE and its engineers shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your inability to access catalog features, purchase specific workspace parts, or configure user preferences.
                </p>
                <p>
                  Our services are provided on an &quot;as is&quot; and &quot;as available&quot; base without implied warranty profiles of any kind. We do not guarantee zero system latency or uninterrupted database connections.
                </p>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 7. Modifications to Terms */}
            <section id="changes" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">7. Modifications to Terms</h2>
              <div className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  We reserve the exclusive right to alter, edit, or swap these Terms and Conditions at our sole discretion. Any changes will be highlighted with a revised effective date at the top of this page.
                </p>
                <p>
                  Continued use of our shop or account settings after modifications are published indicates your full legal validation and approval of the updated policy parameters.
                </p>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 8. Governing Law & Jurisdiction */}
            <section id="governing-law" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">8. Governing Law & Jurisdiction</h2>
              <div className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  These terms and conditions are governed by and construed in compliance with the local laws of our operational headquarters. Any legal claims or disputes arising under these terms shall be subject to the exclusive jurisdiction of the state or federal courts located therein.
                </p>
              </div>
            </section>

          </div>
        </div>
      </section>

    </div>
  );
}
