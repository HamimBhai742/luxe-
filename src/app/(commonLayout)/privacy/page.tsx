import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | LUXE Marketplace",
  description: "Understand how LUXE collects, secures, encrypts, and handles your user account details, payment logs, and workspace preferences.",
};

export default function PrivacyPage() {
  const sections = [
    { id: "collection", title: "1. Information We Collect" },
    { id: "usage", title: "2. How We Use Information" },
    { id: "sharing", title: "3. Information Sharing & Disclosure" },
    { id: "security", title: "4. Data Security & Encryption" },
    { id: "cookies", title: "5. Cookies & Tracking Technologies" },
    { id: "rights", title: "6. Your Rights & Settings Control" },
    { id: "third-party", title: "7. Third-Party Integrations" },
    { id: "contact", title: "8. Contact Our Data Officer" },
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
            Data Safety
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Privacy Policy
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
                Policy Divisions
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
                  className="text-xs font-bold text-blue-655 hover:text-blue-500 dark:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Have questions?</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Column: Policies Prose */}
          <div className="flex-1 space-y-12 max-w-3xl">
            
            {/* Encryption Callout */}
            <div className="rounded-2xl border border-zinc-150/60 bg-zinc-50/30 p-6 dark:border-zinc-850 dark:bg-zinc-900/10">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2">Our Security Guarantee</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                LUXE respects your rights to personal data isolation. All profile settings, avatar URLs, transaction histories, and connection sessions are hashed and encrypted. We do not sell your personal logs to third-party ad brokers.
              </p>
            </div>

            {/* 1. Information We Collect */}
            <section id="collection" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">1. Information We Collect</h2>
              <div className="text-xs sm:text-[13px] text-zinc-650 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  We collect info you provide directly during account registration, profile updates, checkout flows, and customer help tickets. This contains:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Account Credentials:</strong> Full name, email address, hashed passwords, and workspace style selections.</li>
                  <li><strong>Profile Settings:</strong> Optional fields such as phone, avatar URL, biography, geographic location, website, and Twitter handle.</li>
                  <li><strong>Billing & Shipping:</strong> Delivery address, contact details, and transaction purchase histories. (We do not save raw credit card numbers on our database).</li>
                </ul>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 2. How We Use Information */}
            <section id="usage" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">2. How We Use Information</h2>
              <div className="text-xs sm:text-[13px] text-zinc-650 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  We utilize your collected records to maintain your customer experience, process checkout carts, and securely update your settings dashboard. Specifically, data helps us to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Authenticate secure account logins and protect dashboard details.</li>
                  <li>Process, package, and ship premium workspace hardware items to your location.</li>
                  <li>Respond to support tickets raised in the customer help panel.</li>
                  <li>Synchronize dynamic workspace styles across header greeting banners.</li>
                </ul>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 3. Information Sharing & Disclosure */}
            <section id="sharing" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">3. Information Sharing & Disclosure</h2>
              <div className="text-xs sm:text-[13px] text-zinc-650 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  We do not sell, rent, or trade your personal files. Your info is disclosed only to secure operational partners performing vital services on our behalf:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Supabase (PostgreSQL Database):</strong> Stores user profile settings, security fields, and billing logs safely behind access tokens.</li>
                  <li><strong>Cloudinary Integration:</strong> Hosts secure uploads of avatar pictures sent through your profile settings page.</li>
                  <li><strong>Shipping Carriers:</strong> Receives delivery address records to execute physical packet transport.</li>
                </ul>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 4. Data Security & Encryption */}
            <section id="security" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">4. Data Security & Encryption</h2>
              <div className="text-xs sm:text-[13px] text-zinc-650 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  We implement robust technical and structural security policies. Hashed passwords utilize industrial `bcryptjs` salts, preventing plain-text data access. All traffic transmitted to the express server is protected by SSL/TLS encryption protocols.
                </p>
                <p>
                  However, please note that no system is 100% immune to external threats. We advise choosing strong passwords and logging out of your dashboard profile when using shared workspace computers.
                </p>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 5. Cookies & Tracking Technologies */}
            <section id="cookies" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">5. Cookies & Tracking Technologies</h2>
              <div className="text-xs sm:text-[13px] text-zinc-650 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  LUXE uses browser local storage and essential session cookies to remember who you are. This keeps you logged in across pages and preserves items loaded in your shopping cart.
                </p>
                <p>
                  You can configure your browser to block or refuse cookies. However, this will de-optimize your shopping experience and prevent the checkout portal from mapping items to your account.
                </p>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 6. Your Rights & Settings Control */}
            <section id="rights" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">6. Your Rights & Settings Control</h2>
              <div className="text-xs sm:text-[13px] text-zinc-650 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  We believe you should have complete control over your files. You have the right to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access and export your registered profile settings directly from the dashboard.</li>
                  <li>Update, correct, or delete settings properties (location, avatar, bios) at any time.</li>
                  <li>Request permanent removal of your account records from our Supabase database.</li>
                </ul>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 7. Third-Party Integrations */}
            <section id="third-party" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">7. Third-Party Integrations</h2>
              <div className="text-xs sm:text-[13px] text-zinc-650 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  The LUXE website and dashboard portal may contain links to external design platforms or Unsplash image resources. We are not responsible for the privacy practices, cookie collection, or terms of use governing those external websites.
                </p>
              </div>
            </section>

            <div className="border-t border-zinc-100 dark:border-zinc-900" />

            {/* 8. Contact Our Data Officer */}
            <section id="contact" className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif">8. Contact Our Data Officer</h2>
              <div className="text-xs sm:text-[13px] text-zinc-650 dark:text-zinc-400 leading-relaxed space-y-3 font-medium">
                <p>
                  If you wish to request total deletion of your profile database entries, or have questions concerning our encryption algorithms, please contact our data safety team through the <Link href="/dashboard/support" className="text-blue-650 dark:text-blue-400 font-bold hover:underline">Support Portal</Link>.
                </p>
              </div>
            </section>

          </div>
        </div>
      </section>

    </div>
  );
}
