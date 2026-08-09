import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LandingPage({ token }) {
  const navigate = useNavigate();

  // Interactive Mini-Kanban State for live testing
  const [demoTickets, setDemoTickets] = useState([
    {
      id: 'TICK-101',
      title: 'Fix Safari backdrop blur on sticky headers',
      project: 'Core UI',
      priority: 'High',
      status: 'Open',
      author: 'alex_dev',
      commentsCount: 3,
      tag: 'Bug'
    },
    {
      id: 'TICK-102',
      title: 'Implement 6-character invite code generation',
      project: 'Auth & Teams',
      priority: 'High',
      status: 'In Progress',
      author: 'sarah_arch',
      commentsCount: 5,
      tag: 'Feature'
    },
    {
      id: 'TICK-103',
      title: 'Optimistic UI update for Kanban drag & drop',
      project: 'Sync Engine',
      priority: 'Medium',
      status: 'In Progress',
      author: 'mahmoud_e',
      commentsCount: 8,
      tag: 'Enhancement'
    },
    {
      id: 'TICK-104',
      title: 'Auto-archive resolved tickets with closer timestamp',
      project: 'Audit System',
      priority: 'Low',
      status: 'Resolved',
      author: 'david_qa',
      closedBy: 'sarah_arch',
      closedAt: 'Just now',
      commentsCount: 2,
      tag: 'Security'
    }
  ]);

  const [activeTab, setActiveTab] = useState('All');
  const [notificationToast, setNotificationToast] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Move ticket between columns in demo
  const moveTicket = (id, newStatus) => {
    setDemoTickets(prev =>
      prev.map(ticket => {
        if (ticket.id === id) {
          const updated = { ...ticket, status: newStatus };
          if (newStatus === 'Resolved') {
            updated.closedBy = 'you (Admin)';
            updated.closedAt = 'Just now';
          } else {
            delete updated.closedBy;
            delete updated.closedAt;
          }
          return updated;
        }
        return ticket;
      })
    );

    setNotificationToast(`Ticket ${id} moved to "${newStatus}"`);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  const columns = ['Open', 'In Progress', 'Resolved'];

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'High':
        return 'bg-red-500/15 text-red-700 border-red-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-800 border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f0] text-[#0d382b] font-grotesk selection:bg-[#facc15] selection:text-[#08241b] relative overflow-x-hidden">

      {/* Floating Notification Toast */}
      {notificationToast && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 bg-[#08241b] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-2xl border border-[#22c55e]/40 flex items-center gap-3 animate-[scaleIn_0.2s_ease-out] max-w-[90vw]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] animate-ping shrink-0" />
          <p className="text-xs sm:text-sm font-mono tracking-tight truncate">{notificationToast}</p>
        </div>
      )}

      {/* Top Technical Status Header Bar */}
      <div className="border-b border-[#0d382b]/15 bg-[#eaf0e5]/90 backdrop-blur-md px-3 sm:px-6 lg:px-12 py-2 text-[10px] sm:text-[11px] font-mono flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 truncate">
          <span className="flex items-center gap-1.5 font-bold tracking-wider text-[#0e382b]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#22c55e]" />
            SYS.STATUS // ALL SYSTEMS OPTIMAL
          </span>
          <span className="text-[#0d382b]/40 hidden md:inline">|</span>
          <span className="text-[#0d382b]/70 hidden md:inline">LAT 34.0522° N</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-[#0d382b]/80 font-semibold hidden sm:inline">NATURE-TECH PROTOCOL</span>
          <span className="px-2 py-0.5 bg-[#facc15] text-[#08241b] font-bold rounded text-[9px] sm:text-[10px] uppercase tracking-wider">
            Live Demo
          </span>
        </div>
      </div>

      {/* Primary Navigation */}
      <header className="sticky top-0 z-40 bg-[#f3f6f0]/95 backdrop-blur-md border-b border-[#0d382b]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3.5 sm:py-4 flex items-center justify-between">
          
          {/* Logo & Monogram */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0d382b] text-[#facc15] flex items-center justify-center font-syne font-black text-lg sm:text-xl shadow-md group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <div>
              <span className="font-syne font-extrabold text-xl sm:text-2xl tracking-tight text-[#0d382b] block leading-none">
                SyncIssue
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#0d382b]/60 block mt-0.5">
                Issue Engine
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#0d382b]/80">
            <a href="#manifesto" className="hover:text-[#0d382b] transition-colors flex items-center gap-1">
              <span className="text-[10px] font-mono text-[#0d382b]/50">[01]</span> Manifesto
            </a>
            <a href="#demo" className="hover:text-[#0d382b] transition-colors flex items-center gap-1">
              <span className="text-[10px] font-mono text-[#0d382b]/50">[02]</span> Live Board
            </a>
            <a href="#features" className="hover:text-[#0d382b] transition-colors flex items-center gap-1">
              <span className="text-[10px] font-mono text-[#0d382b]/50">[03]</span> Features
            </a>
            <a href="#architecture" className="hover:text-[#0d382b] transition-colors flex items-center gap-1">
              <span className="text-[10px] font-mono text-[#0d382b]/50">[04]</span> Architecture
            </a>
            <a href="#faq" className="hover:text-[#0d382b] transition-colors flex items-center gap-1">
              <span className="text-[10px] font-mono text-[#0d382b]/50">[05]</span> FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {token ? (
              <Link
                to="/dashboard"
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#0d382b] hover:bg-[#144636] text-[#facc15] font-syne font-bold rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center gap-1.5"
              >
                <span>Workspace</span>
                <span>→</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#0d382b] hover:bg-[#0d382b]/5 rounded-lg transition-colors hidden xs:inline-block"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-[#facc15] hover:bg-[#eab308] text-[#08241b] font-syne font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1 border border-[#0d382b]/20"
                >
                  <span>Launch Free</span>
                  <span>↗</span>
                </Link>
              </>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl theme-panel border theme-border theme-muted hover:text-[#0d382b] transition-colors"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Nav Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pb-4 pt-2 border-t border-[#0d382b]/15 bg-[#f3f6f0] flex flex-col gap-2 font-mono text-xs">
            <a
              href="#manifesto"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-[#edf3e8] text-[#0d382b] font-bold"
            >
              [01] Manifesto
            </a>
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-[#edf3e8] text-[#0d382b] font-bold"
            >
              [02] Live Kanban Simulator
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-[#edf3e8] text-[#0d382b] font-bold"
            >
              [03] Features Bento
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-[#edf3e8] text-[#0d382b] font-bold"
            >
              [04] Tech Stack
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-[#edf3e8] text-[#0d382b] font-bold"
            >
              [05] FAQ
            </a>
            <div className="pt-2 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl border border-[#0d382b]/20 font-bold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl bg-[#facc15] text-[#08241b] font-syne font-bold"
              >
                Get Started ↗
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 1. HERO POSTER SECTION (Responsive Poster Artwork)                       */}
      {/* ========================================================================= */}
      <section className="relative pt-4 sm:pt-6 pb-12 sm:pb-20 px-3 sm:px-6 lg:px-12 border-b border-[#0d382b]/15 bg-[#f4f7f0]">
        
        {/* Background Blueprint Grid */}
        <div className="absolute inset-0 poster-grid-bg opacity-70 pointer-events-none" />

        {/* Poster Canvas Container */}
        <div className="relative max-w-7xl mx-auto border-2 border-[#0d382b] rounded-2xl sm:rounded-3xl bg-[#f8faf6] shadow-xl overflow-hidden">
          
          {/* Top Editorial Grid Quadrants */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-b-2 border-[#0d382b] text-xs font-mono">
            
            {/* Top Left: Catchphrase */}
            <div className="p-4 sm:p-6 md:border-r-2 border-b md:border-b-0 border-[#0d382b] flex flex-col justify-between bg-[#edf3e8]">
              <div>
                <span className="text-[9px] sm:text-[10px] text-[#0d382b]/60 block mb-1">SECTION // 01</span>
                <h3 className="font-syne font-black text-xl sm:text-2xl tracking-tighter text-[#0d382b] uppercase leading-none">
                  YOU REALLY<br />NEED TO
                </h3>
              </div>
              <p className="mt-3 text-[#0d382b]/80 font-sans font-medium text-xs leading-relaxed">
                Break out of endless notification loops. Unify issue tracking in one fluid canvas.
              </p>
            </div>

            {/* Top Center: Editorial Prose */}
            <div className="p-4 sm:p-6 md:border-r-2 border-b md:border-b-0 border-[#0d382b] flex flex-col justify-center bg-[#f4f7f0]">
              <span className="text-[9px] sm:text-[10px] text-[#0d382b]/60 block mb-1">MANIFESTO // PHILOSOPHY</span>
              <p className="text-xs sm:text-sm font-sans font-semibold text-[#0d382b]/90 leading-snug">
                "Sometimes the backlog feels like the whole world — but it's not. Step away from the screen, breathe in the air, and ship software with peace of mind."
              </p>
            </div>

            {/* Top Right: Callout */}
            <div className="p-4 sm:p-6 flex flex-col justify-between bg-[#edf3e8]">
              <div>
                <span className="text-[9px] sm:text-[10px] text-[#0d382b]/60 block mb-1">AUDIT STAMP // 2026</span>
                <p className="font-syne font-bold text-xs sm:text-sm text-[#0d382b] leading-tight">
                  Rest your mind, sync the team, and feel in control again.
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#0d382b]/70">
                <span>[ STATUS: DEPLOYED ]</span>
                <span className="text-emerald-700 font-bold">OPEN SOURCE</span>
              </div>
            </div>

          </div>

          {/* Central Monumental Headline Area */}
          <div className="relative min-h-[440px] sm:min-h-[520px] lg:min-h-[620px] flex flex-col justify-between p-5 sm:p-8 lg:p-14 overflow-hidden">
            
            {/* Visual Landscape Backdrop */}
            <div className="absolute inset-0 z-0">
              <img
                src="/touch_grass_hills.png"
                alt="Lush rolling green hills landscape"
                className="w-full h-full object-cover object-center opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08241b]/80 via-transparent to-[#f4f7f0]/60" />
            </div>

            {/* Glowing Wireframe Hands SVG */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-90 overflow-hidden">
              <svg
                viewBox="0 0 1000 600"
                className="w-full h-full max-w-5xl animate-pulse-glow"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Left Hand */}
                <g stroke="#67e8f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
                  <path d="M 80,480 C 140,430 220,380 290,360 C 350,340 400,320 440,300" strokeDasharray="6 3" />
                  <path d="M 120,530 C 190,470 270,410 350,380 C 410,360 450,330 460,310" />
                  <path d="M 290,360 C 320,330 360,290 410,270 C 440,260 470,260 480,270" />
                  <path d="M 350,380 C 380,360 420,340 460,330 C 480,325 495,330 490,345" />
                  <circle cx="480" cy="270" r="4" fill="#a7f3d0" />
                  <circle cx="460" cy="300" r="3" fill="#67e8f9" />
                  <circle cx="490" cy="345" r="3" fill="#67e8f9" />
                  <rect x="260" y="340" width="12" height="12" stroke="#a7f3d0" strokeWidth="1.5" />
                </g>

                {/* Right Hand */}
                <g stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
                  <path d="M 920,480 C 860,430 780,380 710,360 C 650,340 600,320 560,300" strokeDasharray="6 3" />
                  <path d="M 880,530 C 810,470 730,410 650,380 C 590,360 550,330 540,310" />
                  <path d="M 710,360 C 680,330 640,290 590,270 C 560,260 530,260 520,270" />
                  <path d="M 650,380 C 620,360 580,340 540,330 C 520,325 505,330 510,345" />
                  <circle cx="520" cy="270" r="4" fill="#facc15" />
                  <circle cx="540" cy="300" r="3" fill="#4ade80" />
                  <circle cx="510" cy="345" r="3" fill="#4ade80" />
                  <rect x="720" y="340" width="12" height="12" stroke="#facc15" strokeWidth="1.5" />
                </g>

                {/* Spark Touch */}
                <circle cx="500" cy="270" r="8" fill="#facc15" opacity="0.7" />
                <circle cx="500" cy="270" r="3" fill="#ffffff" />
              </svg>
            </div>

            {/* Top Sub-Prompt */}
            <div className="relative z-20 max-w-lg">
              <div className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-[#0d382b]/80 backdrop-blur-md text-[#a7f3d0] font-mono text-[10px] sm:text-xs rounded-lg border border-[#22c55e]/40 mb-2">
                // ISSUE TRIAGE PARADIGM SHIFT
              </div>
              <p className="text-xs sm:text-sm md:text-base font-sans font-medium text-white/95 leading-relaxed drop-shadow-md">
                You've spent hours scrolling through chaotic, disjointed bug reports. The real world's been waiting — sync your sprint and go meet it halfway.
              </p>
            </div>

            {/* Monumental Headline */}
            <div className="relative z-20 my-auto py-4 sm:py-6">
              
              <div className="relative inline-block max-w-full">
                
                <h1 className="font-syne font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[130px] leading-[0.85] tracking-tighter text-[#09281e] select-none">
                  touch<br />
                  <span className="text-[#0d382b] relative">
                    grass
                  </span>
                </h1>

                {/* Overlapping Crinkled Sunny Yellow Smiley Badge */}
                <div className="absolute top-[28%] sm:top-[35%] right-[-8px] sm:right-[-25px] md:right-[-40px] lg:right-[-55px] w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full bg-[#facc15] border-3 sm:border-4 border-[#09281e] shadow-xl flex items-center justify-center p-2 sm:p-3 animate-sticker cursor-pointer group select-none shrink-0">
                  <div className="absolute inset-0 rounded-full border border-black/15 pointer-events-none" />
                  <div className="absolute top-2 left-3 w-8 sm:w-12 h-8 sm:h-12 bg-white/30 rounded-full blur-[4px] pointer-events-none" />
                  
                  <svg viewBox="0 0 100 100" className="w-full h-full text-[#09281e]">
                    <ellipse cx="36" cy="38" rx="6.5" ry="11" fill="currentColor" />
                    <ellipse cx="64" cy="38" rx="6.5" ry="11" fill="currentColor" />
                    <path
                      d="M 26,56 C 34,80 66,80 74,56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  </svg>

                  <span className="absolute -bottom-1.5 sm:-bottom-2 bg-[#09281e] text-[#facc15] text-[8px] sm:text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    100% ZEN
                  </span>
                </div>

              </div>

              {/* Responsive CTAs */}
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto text-center px-6 sm:px-8 py-3.5 sm:py-4 bg-[#0d382b] hover:bg-[#144636] text-[#facc15] font-syne font-black text-base sm:text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 border border-[#22c55e]/40 hover:scale-105 active:scale-95"
                >
                  <span>Start Free Workspace</span>
                  <span className="text-xl">→</span>
                </Link>

                <a
                  href="#demo"
                  className="w-full sm:w-auto text-center px-5 sm:px-6 py-3.5 sm:py-4 bg-[#f4f7f0]/90 hover:bg-white text-[#0d382b] font-grotesk font-bold text-sm sm:text-base rounded-2xl shadow-md transition-all border border-[#0d382b]/30 flex items-center justify-center gap-2"
                >
                  <span>⚡ Test Drive Live Board</span>
                </a>
              </div>

            </div>

            {/* Bottom Metadata Bar */}
            <div className="relative z-20 pt-4 sm:pt-6 border-t-2 border-[#0d382b]/30 flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-xs font-mono text-white">
              <div className="flex items-center gap-2">
                <span className="font-syne font-black text-sm sm:text-base px-2 py-0.5 bg-[#facc15] text-[#08241b] rounded tracking-wider">
                  SYNCISSUE
                </span>
                <span className="text-[#a7f3d0] font-semibold hidden xs:inline">
                  SEC.01 // PLATFORM
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-white/90">
                <span className="text-[#facc15]">contact ↘</span>
                <a href="mailto:contact@syncissue.dev" className="underline hover:text-[#facc15]">
                  contact@syncissue.dev
                </a>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className="tracking-widest text-[#a7f3d0]">||||| | ||||</span>
                <span className="text-[10px] text-white/70">2026</span>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 2. INTERACTIVE LIVE KANBAN TEST-DRIVE                                     */}
      {/* ========================================================================= */}
      <section id="demo" className="py-12 sm:py-20 px-3 sm:px-6 lg:px-12 bg-[#edf3e8] border-b border-[#0d382b]/15">
        
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0d382b] text-[#facc15] font-mono text-[10px] sm:text-xs font-bold rounded-lg mb-2">
                <span>[ 02 ] INTERACTIVE ENGINE</span>
                <span>•</span>
                <span>TRY IT LIVE</span>
              </div>
              <h2 className="font-syne font-black text-3xl sm:text-5xl text-[#0d382b] tracking-tight">
                Feel The Triage Flow
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#0d382b]/70 font-sans max-w-xl">
                Click any action to move tickets between stages or mark bugs as resolved with accountability stamps.
              </p>
            </div>

            {/* Quick Filter Pill */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#f4f7f0] p-1.5 rounded-2xl border border-[#0d382b]/20 text-xs font-bold">
              {['All', 'Core UI', 'Auth & Teams', 'Sync Engine'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeTab === tab
                      ? 'bg-[#0d382b] text-[#facc15] shadow-sm'
                      : 'text-[#0d382b]/70 hover:text-[#0d382b]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive 3-Column Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {columns.map(columnStatus => {
              const colTickets = demoTickets.filter(
                t => t.status === columnStatus && (activeTab === 'All' || t.project === activeTab)
              );

              const colTheme =
                columnStatus === 'Open'
                  ? { border: 'border-amber-600/30', header: 'bg-amber-100 text-amber-900', badge: 'bg-amber-500' }
                  : columnStatus === 'In Progress'
                  ? { border: 'border-cyan-600/30', header: 'bg-cyan-100 text-cyan-900', badge: 'bg-cyan-500' }
                  : { border: 'border-emerald-600/30', header: 'bg-emerald-100 text-emerald-900', badge: 'bg-emerald-500' };

              return (
                <div
                  key={columnStatus}
                  className="bg-[#f8faf6] rounded-2xl border-2 border-[#0d382b]/20 shadow-md p-3.5 sm:p-4 flex flex-col min-h-[400px] sm:min-h-[440px]"
                >
                  {/* Column Header */}
                  <div className={`px-3.5 py-2 rounded-xl ${colTheme.header} flex items-center justify-between font-syne font-bold text-xs sm:text-sm mb-3.5 border border-[#0d382b]/10`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${colTheme.badge}`} />
                      <span>{columnStatus}</span>
                    </div>
                    <span className="font-mono text-xs px-2 py-0.5 bg-white/70 rounded-full font-bold">
                      {colTickets.length}
                    </span>
                  </div>

                  {/* Ticket List */}
                  <div className="space-y-3 flex-1">
                    {colTickets.length === 0 ? (
                      <div className="h-32 border-2 border-dashed border-[#0d382b]/15 rounded-xl flex items-center justify-center text-xs font-mono text-[#0d382b]/40">
                        No tickets in this stage
                      </div>
                    ) : (
                      colTickets.map(ticket => (
                        <div
                          key={ticket.id}
                          className="bg-white rounded-xl p-3.5 border border-[#0d382b]/15 shadow-sm hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                            <span className="font-bold text-[#0d382b]/80">{ticket.id}</span>
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getPriorityBadge(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>

                          <h4 className="font-syne font-bold text-xs sm:text-sm text-[#0d382b] leading-snug">
                            {ticket.title}
                          </h4>

                          <div className="mt-2.5 flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-[#0d382b]/60">
                            <span className="px-2 py-0.5 bg-[#edf3e8] rounded border border-[#0d382b]/10">
                              📂 {ticket.project}
                            </span>
                            <span>💬 {ticket.commentsCount}</span>
                          </div>

                          {ticket.closedBy && (
                            <div className="mt-2.5 pt-2 border-t border-[#0d382b]/10 text-[10px] font-mono text-emerald-800 flex items-center justify-between">
                              <span>✓ Resolved by {ticket.closedBy}</span>
                              <span className="text-[#0d382b]/50">{ticket.closedAt}</span>
                            </div>
                          )}

                          {/* Quick Interactive Move Triggers */}
                          <div className="mt-2.5 pt-2 border-t border-[#0d382b]/10 flex items-center justify-between gap-1 text-[10px] sm:text-[11px] font-mono">
                            <span className="text-[#0d382b]/50">Move:</span>
                            <div className="flex items-center gap-1">
                              {columns.filter(c => c !== ticket.status).map(targetCol => (
                                <button
                                  key={targetCol}
                                  onClick={() => moveTicket(ticket.id, targetCol)}
                                  className="px-2 py-0.5 bg-[#edf3e8] hover:bg-[#0d382b] hover:text-[#facc15] text-[#0d382b] font-bold rounded transition-colors"
                                >
                                  {targetCol === 'Open' ? '← Open' : targetCol === 'In Progress' ? '⚡ Prog' : '✓ Resolve'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-[#f8faf6] rounded-2xl border border-[#0d382b]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl">✨</span>
              <p className="text-xs sm:text-sm font-sans font-medium text-[#0d382b]">
                In the real app, drag and drop is powered by <code className="font-mono bg-[#edf3e8] px-1 py-0.5 rounded text-[11px]">@hello-pangea/dnd</code> with full mobile touch swipe support.
              </p>
            </div>
            <Link
              to="/register"
              className="w-full sm:w-auto text-center px-5 py-2.5 bg-[#0d382b] text-[#facc15] font-syne font-extrabold text-xs sm:text-sm rounded-xl hover:scale-105 transition-transform shrink-0"
            >
              Open Full Board →
            </Link>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 3. MANIFESTO / REALITY CHECK                                             */}
      {/* ========================================================================= */}
      <section id="manifesto" className="py-12 sm:py-20 px-3 sm:px-6 lg:px-12 bg-[#08241b] text-white relative overflow-hidden">
        <div className="absolute inset-0 poster-grid-dark opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <div className="inline-block px-3 py-1 bg-[#facc15] text-[#08241b] font-mono text-[10px] sm:text-xs font-extrabold rounded-lg uppercase tracking-wider mb-3">
              [ 03 ] THE REALITY CHECK
            </div>
            <h2 className="font-syne font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight text-white">
              Stop Drowning In Backlogs.<br />
              <span className="text-[#4ade80]">Reclaim Your Sanity.</span>
            </h2>
            <p className="mt-3 sm:mt-4 text-xs sm:text-base font-sans text-white/80 leading-relaxed">
              Traditional issue trackers are bloated spreadsheets masked as software. SyncIssue strips away the noise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-[#0e382b]/60 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-red-500/30">
              <span className="px-3 py-1 bg-red-500/20 text-red-400 font-mono text-[10px] sm:text-xs font-bold rounded-lg border border-red-500/30 block w-max mb-4">
                ❌ THE BACKLOG NIGHTMARE
              </span>
              <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-sans text-white/80">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Scattered bug reports across Slack DMs and messy Notion boards.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>No one knows who closed a ticket or why an issue was quietly dismissed.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Heavy enterprise tools taking 10+ seconds to render a single Kanban view.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#0e382b] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-[#22c55e] shadow-lg">
              <span className="px-3 py-1 bg-[#22c55e]/20 text-[#4ade80] font-mono text-[10px] sm:text-xs font-bold rounded-lg border border-[#22c55e]/40 block w-max mb-4">
                ✓ THE SYNCISSUE PARADIGM
              </span>
              <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-sans text-white/95">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#4ade80] font-bold">✓</span>
                  <span><strong>6-Character Team Codes:</strong> Instant workspace onboarding with zero friction.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#4ade80] font-bold">✓</span>
                  <span><strong>Embedded Discussions:</strong> Every bug keeps its exact context and resolution notes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#4ade80] font-bold">✓</span>
                  <span><strong>Immutable Audit Logs:</strong> Cryptographic timestamps on every resolution.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="p-4 sm:p-6 bg-[#0e382b]/40 rounded-2xl border border-white/10">
              <div className="font-syne font-black text-2xl sm:text-3xl text-[#facc15]">0.02s</div>
              <div className="text-[10px] font-mono text-white/60 mt-1 uppercase">Render Latency</div>
            </div>
            <div className="p-4 sm:p-6 bg-[#0e382b]/40 rounded-2xl border border-white/10">
              <div className="font-syne font-black text-2xl sm:text-3xl text-[#4ade80]">6 CHAR</div>
              <div className="text-[10px] font-mono text-white/60 mt-1 uppercase">Team Codes</div>
            </div>
            <div className="p-4 sm:p-6 bg-[#0e382b]/40 rounded-2xl border border-white/10">
              <div className="font-syne font-black text-2xl sm:text-3xl text-[#67e8f9]">100%</div>
              <div className="text-[10px] font-mono text-white/60 mt-1 uppercase">Audit Trail</div>
            </div>
            <div className="p-4 sm:p-6 bg-[#0e382b]/40 rounded-2xl border border-white/10">
              <div className="font-syne font-black text-2xl sm:text-3xl text-[#facc15]">∞</div>
              <div className="text-[10px] font-mono text-white/60 mt-1 uppercase">Peace of Mind</div>
            </div>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 4. CORE FEATURES (Bento Grid)                                             */}
      {/* ========================================================================= */}
      <section id="features" className="py-12 sm:py-20 px-3 sm:px-6 lg:px-12 bg-[#f4f7f0] border-b border-[#0d382b]/15">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-4">
            <div>
              <div className="inline-block px-3 py-1 bg-[#0d382b] text-[#facc15] font-mono text-[10px] sm:text-xs font-bold rounded-lg mb-2">
                [ 04 ] ARCHITECTURAL CAPABILITIES
              </div>
              <h2 className="font-syne font-black text-3xl sm:text-5xl text-[#0d382b] tracking-tight">
                Engineered For Velocity
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#0d382b]/70 font-sans max-w-md">
              Every detail is designed to remove cognitive overhead, allowing developers to triage and resolve blockers effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            <div className="bg-[#f8faf6] p-6 sm:p-7 rounded-2xl sm:rounded-3xl border-2 border-[#0d382b] shadow-md flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-4">🏢</div>
                <h3 className="font-syne font-bold text-lg sm:text-xl text-[#0d382b] mb-2">
                  Team Organizations & Invite Codes
                </h3>
                <p className="text-xs sm:text-sm font-sans text-[#0d382b]/80 leading-relaxed">
                  Create a workspace and instantly invite developers and QA leads using 6-character team codes. Manage permissions with admin controls.
                </p>
              </div>
              <div className="mt-4 p-2.5 bg-[#edf3e8] rounded-xl border border-[#0d382b]/10 font-mono text-[11px] flex items-center justify-between">
                <span>CODE:</span>
                <span className="px-2 py-0.5 bg-[#0d382b] text-[#facc15] font-bold rounded">#ALPHA1</span>
              </div>
            </div>

            <div className="bg-[#f8faf6] p-6 sm:p-7 rounded-2xl sm:rounded-3xl border-2 border-[#0d382b] shadow-md flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-4">🗂️</div>
                <h3 className="font-syne font-bold text-lg sm:text-xl text-[#0d382b] mb-2">
                  Multi-Project Scoping
                </h3>
                <p className="text-xs sm:text-sm font-sans text-[#0d382b]/80 leading-relaxed">
                  Keep microservices, frontend apps, and client repositories completely organized. Switch between project scopes seamlessly.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 font-mono text-[11px] text-[#0d382b]/70">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                <span>Zero Reload Filter Engine</span>
              </div>
            </div>

            <div className="bg-[#f8faf6] p-6 sm:p-7 rounded-2xl sm:rounded-3xl border-2 border-[#0d382b] shadow-md flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-4">📋</div>
                <h3 className="font-syne font-bold text-lg sm:text-xl text-[#0d382b] mb-2">
                  Fluid Touch Kanban
                </h3>
                <p className="text-xs sm:text-sm font-sans text-[#0d382b]/80 leading-relaxed">
                  Interactive pipelines powered by <code className="font-mono text-xs bg-[#edf3e8] px-1 py-0.5 rounded">@hello-pangea/dnd</code> for smooth drag motions across all devices.
                </p>
              </div>
              <div className="mt-4 font-mono text-[11px] text-emerald-800 font-bold">
                ✓ Touch Snap Grids
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 5. TECH STACK GALAXY                                                     */}
      {/* ========================================================================= */}
      <section id="architecture" className="py-12 sm:py-20 px-3 sm:px-6 lg:px-12 bg-[#edf3e8] border-b border-[#0d382b]/15">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <div className="inline-block px-3 py-1 bg-[#0d382b] text-[#facc15] font-mono text-[10px] sm:text-xs font-bold rounded-lg uppercase tracking-wider mb-2">
              [ 05 ] TECHNOLOGY STACK GALAXY
            </div>
            <h2 className="font-syne font-black text-3xl sm:text-5xl text-[#0d382b] tracking-tight">
              MERN Supercharged
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-[#f8faf6] p-5 sm:p-6 rounded-2xl border-2 border-[#0d382b]/20 shadow-sm">
              <div className="text-[10px] font-mono font-bold text-[#0d382b]/60 mb-1">01 // CLIENT</div>
              <h4 className="font-syne font-extrabold text-base sm:text-lg text-[#0d382b] mb-1">React 19 + Vite 7</h4>
              <p className="text-xs font-sans text-[#0d382b]/80 leading-relaxed">
                Client-side routing with React Router 7 and chart analytics via Recharts.
              </p>
            </div>

            <div className="bg-[#f8faf6] p-5 sm:p-6 rounded-2xl border-2 border-[#0d382b]/20 shadow-sm">
              <div className="text-[10px] font-mono font-bold text-[#0d382b]/60 mb-1">02 // STYLING</div>
              <h4 className="font-syne font-extrabold text-base sm:text-lg text-[#0d382b] mb-1">Tailwind CSS v4</h4>
              <p className="text-xs font-sans text-[#0d382b]/80 leading-relaxed">
                Responsive glassmorphic backdrop filters and custom snap scrolling.
              </p>
            </div>

            <div className="bg-[#f8faf6] p-5 sm:p-6 rounded-2xl border-2 border-[#0d382b]/20 shadow-sm">
              <div className="text-[10px] font-mono font-bold text-[#0d382b]/60 mb-1">03 // SERVER</div>
              <h4 className="font-syne font-extrabold text-base sm:text-lg text-[#0d382b] mb-1">Node + Express 5</h4>
              <p className="text-xs font-sans text-[#0d382b]/80 leading-relaxed">
                Non-blocking RESTful routing architecture for ultra-low latency CRUD operations.
              </p>
            </div>

            <div className="bg-[#f8faf6] p-5 sm:p-6 rounded-2xl border-2 border-[#0d382b]/20 shadow-sm">
              <div className="text-[10px] font-mono font-bold text-[#0d382b]/60 mb-1">04 // DATABASE</div>
              <h4 className="font-syne font-extrabold text-base sm:text-lg text-[#0d382b] mb-1">MongoDB + JWT</h4>
              <p className="text-xs font-sans text-[#0d382b]/80 leading-relaxed">
                Relational document embedding protected by Bcrypt & JWT security tokens.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 6. FAQ ACCORDION                                                         */}
      {/* ========================================================================= */}
      <section id="faq" className="py-12 sm:py-20 px-3 sm:px-6 lg:px-12 bg-[#f4f7f0] border-b border-[#0d382b]/15">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block px-3 py-1 bg-[#0d382b] text-[#facc15] font-mono text-[10px] sm:text-xs font-bold rounded-lg uppercase tracking-wider mb-2">
              [ 06 ] QUESTIONS & ANSWERS
            </div>
            <h2 className="font-syne font-black text-2xl sm:text-4xl text-[#0d382b] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {[
              {
                q: 'How does team onboarding with 6-character codes work?',
                a: 'When an Admin creates a workspace, SyncIssue generates a unique 6-character code (e.g. ALPHA1). Teammates can enter this code during registration to join immediately.'
              },
              {
                q: 'Can I organize multiple projects inside a single team?',
                a: 'Yes! Admins can create unlimited Projects under the team umbrella, and members can switch between project views seamlessly.'
              },
              {
                q: 'How are closed tickets and resolutions tracked?',
                a: 'Whenever a ticket status changes to Resolved, the server automatically binds the authenticated user\'s username and timestamp into the ticket document.'
              },
              {
                q: 'Can I run SyncIssue locally or self-host it?',
                a: 'Yes! SyncIssue is open source. You can run both backend and frontend servers locally with npm run dev.'
              }
            ].map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[#f8faf6] rounded-2xl border-2 border-[#0d382b]/20 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left font-syne font-bold text-sm sm:text-base text-[#0d382b] flex items-center justify-between gap-3 hover:bg-[#edf3e8] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="font-mono text-lg font-black text-[#0d382b] shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm font-sans text-[#0d382b]/80 border-t border-[#0d382b]/10 bg-[#edf3e8]/50 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 7. BOTTOM CTA BANNER                                                     */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-3 sm:px-6 lg:px-12 bg-[#09281e] text-white relative overflow-hidden">
        <div className="absolute inset-0 poster-grid-dark opacity-30 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 border-2 sm:border-4 border-[#22c55e]/40 rounded-2xl sm:rounded-3xl p-6 sm:p-14 bg-gradient-to-b from-[#0e382b] to-[#08241b] shadow-2xl">
          
          <div className="inline-block px-3 py-1 bg-[#facc15] text-[#08241b] font-mono text-[10px] sm:text-xs font-black rounded-lg uppercase tracking-widest mb-4 sm:mb-6">
            // READY TO TOUCH GRASS?
          </div>

          <h2 className="font-syne font-black text-3xl sm:text-5xl md:text-6xl tracking-tighter leading-tight text-white max-w-2xl mx-auto">
            Stop Debugging Chaos.<br />
            <span className="text-[#4ade80]">Start Shipping Today.</span>
          </h2>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto text-center px-6 sm:px-8 py-3.5 sm:py-4 bg-[#facc15] hover:bg-[#eab308] text-[#08241b] font-syne font-black text-base sm:text-lg rounded-xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span>Create Free Workspace</span>
              <span className="text-xl">→</span>
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto text-center px-6 sm:px-8 py-3.5 sm:py-4 bg-[#0e382b] hover:bg-[#144636] text-white font-grotesk font-bold text-sm sm:text-base rounded-xl border border-white/20 transition-all"
            >
              Sign In to Account
            </Link>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 8. EDITORIAL FOOTER                                                      */}
      {/* ========================================================================= */}
      <footer className="bg-[#f3f6f0] border-t-2 border-[#0d382b] px-4 sm:px-6 lg:px-12 py-8 sm:py-12 text-[#0d382b] font-mono text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#0d382b] text-[#facc15] flex items-center justify-center font-syne font-black text-sm">
                ⚡
              </span>
              <span className="font-syne font-black text-lg text-[#0d382b]">SyncIssue</span>
            </div>
            <p className="font-sans text-xs text-[#0d382b]/70 leading-relaxed">
              A modern issue & project management platform designed for speed and peace of mind.
            </p>
          </div>

          <div>
            <h5 className="font-syne font-bold text-xs uppercase mb-2">Navigation</h5>
            <ul className="space-y-1.5 text-[#0d382b]/80 text-[11px]">
              <li><a href="#manifesto" className="hover:underline">Manifesto</a></li>
              <li><a href="#demo" className="hover:underline">Kanban Simulator</a></li>
              <li><a href="#features" className="hover:underline">Feature Bento</a></li>
              <li><a href="#architecture" className="hover:underline">Tech Stack</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-syne font-bold text-xs uppercase mb-2">Resources</h5>
            <ul className="space-y-1.5 text-[#0d382b]/80 text-[11px]">
              <li>
                <a href="https://github.com/MahmoudEsawi/Full-stack-Bug-Tracker" target="_blank" rel="noreferrer" className="hover:underline">
                  GitHub Repository ↗
                </a>
              </li>
              <li>
                <a href="https://full-stack-bug-tracker.vercel.app" target="_blank" rel="noreferrer" className="hover:underline">
                  Vercel Live Demo ↗
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-1 text-[11px]">
            <h5 className="font-syne font-bold text-xs uppercase mb-2">Credits</h5>
            <p className="font-sans text-[#0d382b]/80">
              Engineered by <strong className="text-[#0d382b]">Mahmoud Esawi</strong>.
            </p>
            <div className="text-[10px] text-[#0d382b]/50 pt-1">
              © 2026 SyncIssue. All rights reserved.
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
