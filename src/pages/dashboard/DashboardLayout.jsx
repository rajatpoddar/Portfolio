import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/dashboard',           icon: '📊', label: 'Overview',   end: true },
  { to: '/dashboard/clients',   icon: '👥', label: 'Clients'              },
  { to: '/dashboard/quotes',    icon: '📋', label: 'Quotations'           },
  { to: '/dashboard/invoices',  icon: '🧾', label: 'Invoices'             },
  { to: '/dashboard/leads',     icon: '🎯', label: 'Leads'                },
  { to: '/dashboard/pricing',   icon: '💰', label: 'Pricing'              },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#050508]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>
            RP
          </div>
          <div>
            <div className="text-sm font-bold text-white">Business OS</div>
            <div className="text-xs text-white/30">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#6c63ff]/15 text-white border border-[#6c63ff]/25'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`
            }>
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 flex flex-col gap-1.5">
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
          <span>🌐</span> View Portfolio
        </a>
        <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="text-xs text-white/30 truncate">{user?.email}</div>
        </div>
        <button onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer text-left">
          <span>🚪</span> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050508] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-white/5 fixed top-0 left-0 bottom-0 z-30 bg-[#050508]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden" />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-56 border-r border-white/5 z-50 md:hidden bg-[#050508]">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 cursor-pointer text-white">
            ☰
          </button>
          <div className="hidden md:block text-sm text-white/30">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/40">Live</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-7 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-white/5 flex items-center justify-around px-1 py-1">
        {NAV.slice(0, 5).map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all flex-1 min-w-0">
            {({ isActive }) => (
              <>
                <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>{icon}</span>
                <span className={`text-[9px] font-medium truncate w-full text-center ${isActive ? 'text-[#6c63ff]' : 'text-white/30'}`}>
                  {label}
                </span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[#6c63ff]" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
