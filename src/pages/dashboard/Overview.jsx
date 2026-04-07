import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { clientsDb, quotationsDb, invoicesDb, leadsDb } from '../../lib/db';

function StatCard({ icon, label, value, sub, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 100% 0%, ${color}10 0%, transparent 60%)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}18`, border: `1px solid ${color}25` }}>
          {icon}
        </div>
        <div className="text-xs text-white/25">{sub}</div>
      </div>
      <div className="text-2xl font-black mb-0.5" style={{ color }}>{value}</div>
      <div className="text-xs text-white/40">{label}</div>
    </motion.div>
  );
}

function RecentRow({ item, type }) {
  const statusColors = { draft: '#6b6b80', sent: '#00d4ff', accepted: '#10b981', paid: '#10b981', pending: '#f59e0b', overdue: '#ef4444' };
  const status = item.status || 'draft';
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <div className="text-sm font-medium text-white/80">{item.clients?.name || item.client_name || '—'}</div>
        <div className="text-xs text-white/30 mt-0.5">{item.clients?.business || item.project_name || '—'}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm font-bold text-white/70">
          ₹{(item.total_amount || item.subtotal || 0).toLocaleString('en-IN')}
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
          style={{ background: `${statusColors[status]}18`, color: statusColors[status] }}>
          {status}
        </span>
      </div>
    </div>
  );
}

export default function Overview() {
  const [stats, setStats] = useState({ clients: 0, quotes: 0, invoices: 0, leads: 0, revenue: 0, pending: 0 });
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: clients }, { data: quotes }, { data: invoices }, { data: leads }] = await Promise.all([
        clientsDb.getAll(),
        quotationsDb.getAll(),
        invoicesDb.getAll(),
        leadsDb.getAll(),
      ]);

      const revenue = (invoices || []).filter((i) => i.status === 'paid').reduce((s, i) => s + (i.total_amount || 0), 0);
      const pending = (invoices || []).filter((i) => i.status === 'pending').reduce((s, i) => s + (i.due_amount || 0), 0);

      setStats({
        clients: clients?.length || 0,
        quotes: quotes?.length || 0,
        invoices: invoices?.length || 0,
        leads: leads?.length || 0,
        revenue,
        pending,
      });
      setRecentQuotes((quotes || []).slice(0, 5));
      setRecentInvoices((invoices || []).slice(0, 5));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-white/30 mt-1">Your business at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon="👥" label="Total Clients" value={stats.clients} sub="All time" color="#6c63ff" delay={0} />
        <StatCard icon="📋" label="Quotations" value={stats.quotes} sub="All time" color="#00d4ff" delay={0.05} />
        <StatCard icon="🧾" label="Invoices" value={stats.invoices} sub="All time" color="#a855f7" delay={0.1} />
        <StatCard icon="✅" label="Revenue Collected" value={`₹${stats.revenue.toLocaleString('en-IN')}`} sub="Paid invoices" color="#10b981" delay={0.15} />
        <StatCard icon="⏳" label="Pending Amount" value={`₹${stats.pending.toLocaleString('en-IN')}`} sub="Unpaid" color="#f59e0b" delay={0.2} />
        <StatCard icon="🎯" label="New Leads" value={stats.leads} sub="From portfolio" color="#ef4444" delay={0.25} />
      </div>

      {/* Recent activity */}
      <div className="grid md:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Recent Quotations</h3>
            <Link to="/dashboard/quotes" className="text-xs text-[#6c63ff] hover:underline">View all →</Link>
          </div>
          {recentQuotes.length === 0
            ? <div className="text-xs text-white/25 py-4 text-center">No quotations yet</div>
            : recentQuotes.map((q) => <RecentRow key={q.id} item={q} type="quote" />)
          }
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Recent Invoices</h3>
            <Link to="/dashboard/invoices" className="text-xs text-[#6c63ff] hover:underline">View all →</Link>
          </div>
          {recentInvoices.length === 0
            ? <div className="text-xs text-white/25 py-4 text-center">No invoices yet</div>
            : recentInvoices.map((i) => <RecentRow key={i.id} item={i} type="invoice" />)
          }
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-5 border border-white/5"
      >
        <h3 className="font-bold text-sm mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { to: '/dashboard/quotes?new=1', icon: '📋', label: 'New Quotation', color: '#6c63ff' },
            { to: '/dashboard/invoices?new=1', icon: '🧾', label: 'New Invoice', color: '#a855f7' },
            { to: '/dashboard/clients?new=1', icon: '👤', label: 'Add Client', color: '#00d4ff' },
            { to: '/dashboard/leads', icon: '🎯', label: 'View Leads', color: '#10b981' },
          ].map(({ to, icon, label, color }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 cursor-pointer"
              style={{ background: `${color}15`, border: `1px solid ${color}25`, color }}
            >
              {icon} {label}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
