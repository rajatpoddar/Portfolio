import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme, toggle: toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: 'var(--sidebar-bg)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>
            RP
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Business OS</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={({ isActive }) => ({
              background: isActive ? 'rgba(108,99,255,0.12)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              border: isActive ? '1px solid rgba(108,99,255,0.25)' : '1px solid transparent',
            })}>
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t flex flex-col gap-1.5" style={{ borderColor: 'var(--border)' }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer w-full text-left"
          style={{ color: 'var(--text-mid)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <span>{isDark ? '☀️' : '🌙'}</span>
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>

        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <span>🌐</span> View Portfolio
        </a>

        <div className="px-3 py-2 rounded-xl" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
          <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</div>
        </div>

        <button onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left"
          style={{ color: 'rgba(239,68,68,0.7)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(239,68,68,0.7)'; }}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col fixed top-0 left-0 bottom-0 z-30 border-r"
        style={{ borderColor: 'var(--border)', background: 'var(--sidebar-bg)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.55)' }} />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-56 z-50 md:hidden border-r"
              style={{ borderColor: 'var(--border)', background: 'var(--sidebar-bg)' }}>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 px-4 md:px-6 py-3 flex items-center justify-between border-b"
          style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: 'var(--border)' }}>
          {/* Mobile: hamburger */}
          <button onClick={() => setSidebarOpen(true)}
            className="md:hidden btn-icon w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer"
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            ☰
          </button>

          {/* Desktop: date */}
          <div className="hidden md:block text-sm" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>

          {/* Right: theme toggle + live indicator */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Theme toggle — visible on mobile too */}
            <button onClick={toggleTheme}
              className="btn-icon w-9 h-9 flex items-center justify-center rounded-lg text-base cursor-pointer transition-colors"
              style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
              title={isDark ? 'Light mode' : 'Dark mode'}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>Live</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-7 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t flex items-center justify-around px-1 py-1"
        style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: 'var(--border)' }}>
        {NAV.slice(0, 5).map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-0 flex-1">
            {({ isActive }) => (
              <>
                <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>{icon}</span>
                <span className="text-[9px] font-medium truncate w-full text-center"
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {label}
                </span>
                {isActive && <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
