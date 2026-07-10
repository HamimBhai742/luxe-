import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Us | LUXE Marketplace",
  description: "Learn about the mission, values, and story of LUXE - the premier marketplace for minimalist, high-performance design and premium workspace electronics.",
};

export default function AboutPage() {
  const stats = [
    { label: "Founded", value: "2024" },
    { label: "Premium Products", value: "150+" },
    { label: "Happy Customers", value: "10K+" },
    { label: "Global Designers", value: "25+" },
  ];

  const values = [
    {
      title: "Minimalist Aesthetics",
      description: "We believe in form meeting function. Every curve, texture, and light profile is curated to foster focused, uncluttered spaces.",
      icon: (
        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5L4.5 9H9zM9 9h4.5M10.5 15.75L12 18m0 0l1.5-2.25M12 18V10.5m-7.5 9h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 20.25z" />
        </svg>
      ),
    },
    {
      title: "Uncompromising Quality",
      description: "From aircraft-grade aluminum casing to fine-grain leather linings, we source components built to outlast ordinary electronics.",
      icon: (
        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
    },
    {
      title: "Sustainable Craftsmanship",
      description: "We partner with brands that prioritize circular supply chains, dynamic solar manufacturing, and recyclable packaging materials.",
      icon: (
        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513c0 .9.477 1.733 1.256 2.193l.317.187m5.244-7.251c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513c0 .9-.477 1.733-1.256 2.193l-.317.187m-4.427-7.251c-.167-.009-.335-.013-.503-.013-1.42 0-2.77.29-4 .812m1.077 7.747L12 18.75m0 0l-2.077-3.151M12 18.75V10.5m0 0a3 3 0 11-6 0c0-1.657 2.686-3 6-3s6 1.343 6 3a3 3 0 01-6 0z" />
        </svg>
      ),
    },
    {
      title: "Workspace Harmony",
      description: "Our gadgets are designed to co-exist quietly. Smooth connection protocols and uniform color systems bind your workspace as one.",
      icon: (
        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 18c-5.922 0-10.75-4.75-10.75-10.75S6.078 1.25 12 1.25s10.75 4.75 10.75 10.75-4.75 10.75-10.75 10.75z" />
        </svg>
      ),
    },
  ];

  const milestones = [
    { year: "2024", title: "The Spark", desc: "LUXE was founded by a collective of designers frustrated by generic plastic electronics. We launched our first line of minimalist watches." },
    { year: "2025", title: "Workspace Integration", desc: "Expanded into high-performance audio and workspace gadgets, securing partnerships with elite Swiss and Japanese mechanical engineering workshops." },
    { year: "2026", title: "Carbon Neutrality & Beyond", desc: "Launched our 100% solar-built audio line and transitioned 90% of our supply routes to zero-emission shipping corridors." },
  ];

  const team = [
    {
      name: "Marcus Sterling",
      role: "Founder & Creative Director",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      bio: "Former lead industrial designer specializing in minimalist workspace geometry and clean aluminum structures.",
    },
    {
      name: "Elena Rostova",
      role: "Lead Hardware Engineer",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
      bio: "Aerospace acoustics veteran dedicating her mechanical expertise to high-fidelity audio structures and ANC protocols.",
    },
    {
      name: "Hassan Al-Jamil",
      role: "Head of Supply Chain & Sustainability",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      bio: "Pioneered sustainable material routes and circular packaging standards across luxury manufacturing hubs.",
    },
  ];

  return (
    <div className="bg-white dark:bg-black text-zinc-800 dark:text-zinc-200 transition-colors duration-500 min-h-screen">
      
      {styleBlock}

      {/* ========================================================================= */}
      {/* HERO BANNER SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-10 left-1/4 h-80 w-80 rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 dark:bg-purple-600/5 blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 text-center space-y-6 max-w-3xl mx-auto">
          <span className="inline-flex items-center rounded-full bg-blue-500/10 dark:bg-blue-400/10 px-4 py-1.5 text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase ring-1 ring-inset ring-blue-500/20">
            About Our Brand
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Minimalist Design, <span className="block text-blue-600 dark:text-blue-400 mt-1 sm:mt-2">High-Performance Living.</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto">
            At LUXE, we merge industrial perfection with daily workflow essentials, crafting an environment of focus, peace, and productivity.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* STATS HIGHLIGHT ROW */}
      {/* ========================================================================= */}
      <section className="border-y border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <span className="block text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-455 tracking-tight">
                  {stat.value}
                </span>
                <span className="block text-xs font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BRAND NARRATIVE / STORY SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Text details */}
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-serif">
              Our Journey: Reimagining Daily Tools
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every item we interact with dictates our mental clarity. In 2024, our founders looked around their workspaces and saw cluttered cables, plastic builds, and compromises. LUXE was born out of a decision to change that narrative.
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We choose metal over plastic, matte finishes over glossy coatings, and quiet dials over beeping alerts. By combining high-grade microchip engineering with sustainable Swiss craftsmanship, we design gear that performs at the highest tier while elevating your aesthetics.
            </p>

            <div className="pt-4">
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-5 py-3 text-xs font-bold transition-all shadow-md"
              >
                <span>Browse The Collection</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Image grids */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 relative">
            <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5 blur-3xl pointer-events-none rounded-2xl" />
            <div className="space-y-4 sm:space-y-6">
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-100 animate-float-slow">
                <Image
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=350&auto=format&fit=crop"
                  alt="Aura Audio Engineering"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-100 translate-x-4 sm:translate-x-6">
                <Image
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=350&auto=format&fit=crop"
                  alt="AuraBook Desk Layout"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6 pt-8">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-100 -translate-x-4 sm:-translate-x-6">
                <Image
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=350&auto=format&fit=crop"
                  alt="Premium Workspace Accessories"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-100 animate-float-reverse">
                <Image
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=350&auto=format&fit=crop"
                  alt="Sustainable Solar Assembly"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* CORE VALUES GRID SECTION */}
      {/* ========================================================================= */}
      <section className="bg-zinc-50/50 dark:bg-zinc-950/20 border-y border-zinc-100 dark:border-zinc-900 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-serif">
              Our Core Design Principles
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-500 max-w-md mx-auto">
              LUXE gadgets don&apos;t just blend in; they are crafted to lead, sustain, and unify your performance workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((val, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-md hover:scale-102 transition-all duration-300 group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-955/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  {val.icon}
                </div>
                <h3 className="mt-5 text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  {val.title}
                </h3>
                <p className="mt-3 text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {val.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* TIMELINE / MILESTONES SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-serif">
            Our Milestones
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-500 max-w-xs mx-auto">
            From humble drawings to carbon-neutral shipping operations.
          </p>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-y-0 before:left-4 sm:before:left-1/2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
          {milestones.map((stone, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={idx} className="relative flex flex-col sm:flex-row items-start sm:justify-between group">
                
                {/* Timeline Bubble indicator */}
                <div className="absolute left-4 sm:left-1/2 transform -translate-x-[7px] sm:-translate-x-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-black border-2 border-blue-600 dark:border-blue-400 z-10 group-hover:scale-125 transition-transform duration-300" />

                {/* Left block (renders empty on desktop if odd, or content if even) */}
                <div className={`w-full sm:w-[45%] pl-10 sm:pl-0 ${isEven ? "sm:text-right" : "sm:order-2"}`}>
                  <div className="bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
                    <span className="inline-block text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5">
                      {stone.year}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2">
                      {stone.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                      {stone.desc}
                    </p>
                  </div>
                </div>

                {/* Right spacer for clean layout structure */}
                <div className="hidden sm:block w-[45%]" />

              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TEAM / LEADERSHIP SECTION */}
      {/* ========================================================================= */}
      <section className="bg-zinc-50/50 dark:bg-zinc-950/20 border-y border-zinc-100 dark:border-zinc-900 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-serif">
              Meet The Founders & Innovators
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-500 max-w-md mx-auto">
              A diverse team bound by a single mission: defining the hardware standards of clean spaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col text-center"
              >
                <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-103"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                      {member.name}
                    </h3>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mt-1">
                      {member.role}
                    </span>
                    <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL JOIN CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative overflow-hidden">
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-serif">
            Ready to Redefine Your Space?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed max-w-md mx-auto">
            Experience electronics curated for performance. Elevate your desk layout with modern, high-precision peripherals.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/collections"
              className="rounded-full bg-blue-600 hover:bg-blue-550 text-white px-7 py-3 text-xs font-bold transition-all shadow-md hover:scale-102"
            >
              Explore Shop
            </Link>
            <Link
              href="/dashboard/support"
              className="rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-7 py-3 text-xs font-bold transition-all"
            >
              Contact Team
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

const styleBlock = (
  <style>{`
    @keyframes float-slow {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(0.2deg); }
    }
    @keyframes float-reverse {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(8px) rotate(-0.2deg); }
    }
    .animate-float-slow {
      animation: float-slow 8s ease-in-out infinite;
    }
    .animate-float-reverse {
      animation: float-reverse 9s ease-in-out infinite;
    }
    .hover\\:scale-102:hover {
      transform: scale(1.02);
    }
    .hover\\:scale-103:hover {
      transform: scale(1.03);
    }
    .hover\\:scale-110:hover {
      transform: scale(1.1);
    }
  `}</style>
);
