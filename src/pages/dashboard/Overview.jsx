import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { clientsDb, quotationsDb, invoicesDb, leadsDb } from '../../lib/db';

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function greet() {
  const h = new Date().getHours();
  if (h < 12) return 'Suprabhat 🌅';
  if (h < 17) return 'Namaskar 🙏';
  return 'Shubh Sandhya 🌙';
}

function trendLabel(curr, prev) {
  if (!prev) return null;
  const pct = Math.round(((curr - prev) / prev) * 100);
  return { pct, up: pct >= 0 };
}

// ─── Money Card ───────────────────────────────────────────────────────────────
function MoneyCard({ icon, label, value, sub, color, trend, delay, urgent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={`relative rounded-2xl p-5 overflow-hidden ${
        urgent
          ? 'bg-[#f59e0b]/10 border border-[#f59e0b]/30'
          : 'bg-[#0d0d14] border border-white/6'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}25` }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.up
                ? 'bg-green-500/15 text-green-400'
                : 'bg-red-500/15 text-red-400'
            }`}
          >
            {trend.up ? '↑' : '↓'} {Math.abs(trend.pct)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-black tracking-tight" style={{ color }}>
        {value}
      </div>
      <div className="text-sm font-medium text-white/70 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-white/35 mt-1">{sub}</div>}
    </motion.div>
  );
}

// ─── Smart Insight Banner ─────────────────────────────────────────────────────
function InsightBanner({ icon, text, action, actionLabel, color = '#f59e0b' }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
      style={{ background: `${color}0d`, borderColor: `${color}30` }}
    >
      <span className="text-lg shrink-0">{icon}</span>
      <span className="text-white/70 flex-1 leading-snug">{text}</span>
      {action && (
        <button
          onClick={action}
          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          style={{ background: `${color}20`, color }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ─── Invoice Row ──────────────────────────────────────────────────────────────
function InvoiceRow({ inv, clients, onWhatsApp }) {
  const client = clients.find((c) => c.id === inv.client_id);
  const isOverdue =
    inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid';
  const statusMeta = {
    paid:    { label: 'Paid',    color: '#10b981' },
    pending: { label: 'Pending', color: '#f59e0b' },
    overdue: { label: 'Overdue', color: '#ef4444' },
    sent:    { label: 'Sent',    color: '#00d4ff' },
    draft:   { label: 'Draft',   color: '#6b6b80' },
  };
  const s = isOverdue ? statusMeta.overdue : (statusMeta[inv.status] || statusMeta.draft);

  return (
    <div
      className={`flex items-center gap-3 py-3 border-b border-white/5 last:border-0 ${
        isOverdue ? 'bg-red-500/[0.03] -mx-5 px-5 rounded-lg' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: `${s.color}25`, color: s.color }}
      >
        {(client?.name || '?').charAt(0).toUpperCase()}
      </div>

      {/* Name + project */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white/85 truncate">
          {client?.name || '—'}
        </div>
        <div className="text-xs text-white/35 truncate">{inv.project_name || '—'}</div>
      </div>

      {/* Amount */}
      <div className="text-sm font-bold text-white/80 shrink-0">
        {fmt(inv.due_amount || inv.total_amount)}
      </div>

      {/* Status badge */}
      <span
        className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
        style={{ background: `${s.color}18`, color: s.color }}
      >
        {s.label}
      </span>

      {/* WhatsApp reminder */}
      {inv.status !== 'paid' && client?.phone && (
        <button
          onClick={() => onWhatsApp(client, inv)}
          className="w-7 h-7 rounded-lg bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center text-green-400 text-xs transition-colors cursor-pointer shrink-0"
          title="Send WhatsApp reminder"
        >
          💬
        </button>
      )}
    </div>
  );
}

// ─── Quote Row ────────────────────────────────────────────────────────────────
function QuoteRow({ q, clients, navigate }) {
  const client = clients.find((c) => c.id === q.client_id);
  const statusMeta = {
    draft:    { label: 'Draft',    color: '#6b6b80' },
    sent:     { label: 'Sent',     color: '#00d4ff' },
    accepted: { label: 'Accepted', color: '#10b981' },
    rejected: { label: 'Rejected', color: '#ef4444' },
  };
  const s = statusMeta[q.status] || statusMeta.draft;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: `${s.color}25`, color: s.color }}
      >
        {(client?.name || '?').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white/85 truncate">{client?.name || '—'}</div>
        <div className="text-xs text-white/35 truncate">{q.project_type || '—'}</div>
      </div>
      <div className="text-sm font-bold text-white/80 shrink-0">{fmt(q.total_amount)}</div>
      <span
        className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
        style={{ background: `${s.color}18`, color: s.color }}
      >
        {s.label}
      </span>
      {q.status === 'accepted' && (
        <button
          onClick={() => navigate(`/dashboard/invoices?new=1`)}
          className="text-xs px-2.5 py-1 rounded-lg bg-[#10b981]/15 text-[#10b981] hover:bg-[#10b981]/25 transition-colors cursor-pointer shrink-0 font-medium"
        >
          → Invoice
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Overview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: clients }, { data: quotes }, { data: invoices }, { data: leads }] =
        await Promise.all([
          clientsDb.getAll(),
          quotationsDb.getAll(),
          invoicesDb.getAll(),
          leadsDb.getAll(),
        ]);

      const inv = invoices || [];
      const quo = quotes || [];
      const cli = clients || [];
      const lds = leads || [];

      // Revenue
      const totalRevenue = inv.filter((i) => i.status === 'paid').reduce((s, i) => s + (i.total_amount || 0), 0);

      // This month revenue
      const now = new Date();
      const thisMonthRev = inv
        .filter((i) => {
          const d = new Date(i.created_at);
          return i.status === 'paid' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((s, i) => s + (i.total_amount || 0), 0);

      // Last month revenue
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthRev = inv
        .filter((i) => {
          const d = new Date(i.created_at);
          return i.status === 'paid' && d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
        })
        .reduce((s, i) => s + (i.total_amount || 0), 0);

      // Pending
      const pendingInvoices = inv.filter((i) => i.status !== 'paid' && i.status !== 'draft');
      const totalPending = pendingInvoices.reduce((s, i) => s + (i.due_amount || 0), 0);

      // Overdue
      const overdueInvoices = inv.filter(
        (i) => i.due_date && new Date(i.due_date) < now && i.status !== 'paid'
      );

      // New leads this week
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      const newLeads = lds.filter((l) => new Date(l.created_at) > weekAgo);

      // Accepted quotes not yet invoiced
      const acceptedQuotes = quo.filter((q) => q.status === 'accepted');

      setData({
        clients: cli,
        quotes: quo,
        invoices: inv,
        leads: lds,
        totalRevenue,
        thisMonthRev,
        lastMonthRev,
        totalPending,
        pendingInvoices,
        overdueInvoices,
        newLeads,
        acceptedQuotes,
        recentInvoices: inv.slice(0, 6),
        recentQuotes: quo.slice(0, 5),
      });
      setLoading(false);
    };
    load();
  }, []);

  const sendWhatsAppReminder = (client, inv) => {
    const phone = client.phone?.replace(/\D/g, '');
    if (!phone) return;
    const msg = encodeURIComponent(
      `Namaste ${client.name} ji 🙏\n\nAapka invoice #${inv.invoice_number} abhi bhi pending hai.\n\nDue Amount: ₹${Number(inv.due_amount || 0).toLocaleString('en-IN')}\n\nKripya jald se jald payment kar dein. Dhanyawad! 🙏`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin" />
          <span className="text-xs text-white/30">Loading your business data...</span>
        </div>
      </div>
    );
  }

  const revTrend = trendLabel(data.thisMonthRev, data.lastMonthRev);

  // Build smart insights
  const insights = [];
  if (data.overdueInvoices.length > 0) {
    const total = data.overdueInvoices.reduce((s, i) => s + (i.due_amount || 0), 0);
    insights.push({
      icon: '🚨',
      color: '#ef4444',
      text: `${data.overdueInvoices.length} invoice${data.overdueInvoices.length > 1 ? 's' : ''} overdue — ${fmt(total)} abhi tak nahi aaya`,
      actionLabel: 'Dekho',
      action: () => navigate('/dashboard/invoices'),
    });
  }
  if (data.acceptedQuotes.length > 0) {
    insights.push({
      icon: '✅',
      color: '#10b981',
      text: `${data.acceptedQuotes.length} quotation accept ho gaya — invoice banao aur payment lo`,
      actionLabel: 'Invoice Banao',
      action: () => navigate('/dashboard/invoices?new=1'),
    });
  }
  if (data.newLeads.length > 0) {
    insights.push({
      icon: '🎯',
      color: '#6c63ff',
      text: `${data.newLeads.length} naya lead is hafte aaya — abhi follow up karo`,
      actionLabel: 'Dekho',
      action: () => navigate('/dashboard/leads'),
    });
  }
  if (data.totalPending > 0 && data.pendingInvoices.length > 0) {
    // Find highest pending client
    const top = [...data.pendingInvoices].sort((a, b) => (b.due_amount || 0) - (a.due_amount || 0))[0];
    const topClient = data.clients.find((c) => c.id === top?.client_id);
    if (topClient) {
      insights.push({
        icon: '💬',
        color: '#f59e0b',
        text: `${topClient.name} ka ${fmt(top.due_amount)} pending hai — WhatsApp reminder bhejo`,
        actionLabel: 'Remind Karo',
        action: () => sendWhatsAppReminder(topClient, top),
      });
    }
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs text-white/30 mb-1">{today}</div>
          <h1 className="text-2xl font-bold">{greet()}</h1>
          <p className="text-sm text-white/40 mt-0.5">Aapka business aaj kaisa chal raha hai</p>
        </div>
        {/* Primary CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/dashboard/invoices?new=1')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
        >
          🧾 Naya Invoice Banao
        </motion.button>
      </div>

      {/* ── Smart Insights ── */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col gap-2"
        >
          <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-1">
            🧠 Aaj Ke Liye Zaroori
          </div>
          {insights.map((ins, i) => (
            <InsightBanner key={i} {...ins} />
          ))}
        </motion.div>
      )}

      {/* ── Finance Cards (top priority) ── */}
      <div>
        <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
          💰 Paisa — Aaj Ki Sthiti
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">          <MoneyCard
            icon="✅" label="Is Mahine Aaya" color="#10b981"
            value={fmt(data.thisMonthRev)}
            sub={lastMonthRev => `Pichhle mahine: ${fmt(data.lastMonthRev)}`}
            trend={revTrend} delay={0}
          />
          <MoneyCard
            icon="⏳" label="Pending Hai" color="#f59e0b"
            value={fmt(data.totalPending)}
            sub={`${data.pendingInvoices.length} invoice baki`}
            urgent={data.totalPending > 0} delay={0.05}
          />
          <MoneyCard
            icon="🚨" label="Overdue" color="#ef4444"
            value={data.overdueInvoices.length}
            sub={data.overdueInvoices.length > 0
              ? fmt(data.overdueInvoices.reduce((s, i) => s + (i.due_amount || 0), 0))
              : 'Sab theek hai ✓'}
            urgent={data.overdueInvoices.length > 0} delay={0.1}
          />
          <MoneyCard
            icon="📈" label="Kul Revenue" color="#6c63ff"
            value={fmt(data.totalRevenue)}
            sub="Sab paid invoices" delay={0.15}
          />
        </div>
      </div>

      {/* ── Activity Cards ── */}
      <div>
        <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
          📊 Business Activity
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '👥', label: 'Clients', value: data.clients.length, color: '#6c63ff', to: '/dashboard/clients' },
            { icon: '📋', label: 'Quotations', value: data.quotes.length, color: '#00d4ff', to: '/dashboard/quotes' },
            { icon: '🧾', label: 'Invoices', value: data.invoices.length, color: '#a855f7', to: '/dashboard/invoices' },
            { icon: '🎯', label: 'Leads', value: data.leads.length, color: '#10b981', to: '/dashboard/leads' },
          ].map(({ icon, label, value, color, to }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.04 }}
            >
              <Link to={to}
                className="flex items-center gap-3 p-4 rounded-xl bg-[#0d0d14] border border-white/6 hover:border-white/12 transition-all group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ background: `${color}18` }}>{icon}</div>
                <div>
                  <div className="text-xl font-black" style={{ color }}>{value}</div>
                  <div className="text-xs text-white/40">{label}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Invoices + Quotes ── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Pending Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0d0d14] rounded-2xl border border-white/6 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <div className="font-bold text-sm">Invoices</div>
              {data.overdueInvoices.length > 0 && (
                <div className="text-xs text-red-400 mt-0.5">
                  {data.overdueInvoices.length} overdue ⚠️
                </div>
              )}
            </div>
            <Link to="/dashboard/invoices" className="text-xs text-[#6c63ff] hover:underline">
              Sab dekho →
            </Link>
          </div>
          <div className="px-5 py-1">
            {data.recentInvoices.length === 0 ? (
              <div className="text-xs text-white/25 py-8 text-center">
                Koi invoice nahi hai abhi
              </div>
            ) : (
              data.recentInvoices.map((inv) => (
                <InvoiceRow
                  key={inv.id}
                  inv={inv}
                  clients={data.clients}
                  onWhatsApp={sendWhatsAppReminder}
                />
              ))
            )}
          </div>
          {data.recentInvoices.length > 0 && (
            <div className="px-5 py-3 border-t border-white/5">
              <button
                onClick={() => navigate('/dashboard/invoices?new=1')}
                className="w-full py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                + Naya Invoice Banao
              </button>
            </div>
          )}
        </motion.div>

        {/* Recent Quotations */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[#0d0d14] rounded-2xl border border-white/6 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <div className="font-bold text-sm">Quotations</div>
              {data.acceptedQuotes.length > 0 && (
                <div className="text-xs text-green-400 mt-0.5">
                  {data.acceptedQuotes.length} accepted — invoice ready
                </div>
              )}
            </div>
            <Link to="/dashboard/quotes" className="text-xs text-[#6c63ff] hover:underline">
              Sab dekho →
            </Link>
          </div>
          <div className="px-5 py-1">
            {data.recentQuotes.length === 0 ? (
              <div className="text-xs text-white/25 py-8 text-center">
                Koi quotation nahi hai abhi
              </div>
            ) : (
              data.recentQuotes.map((q) => (
                <QuoteRow
                  key={q.id}
                  q={q}
                  clients={data.clients}
                  navigate={navigate}
                />
              ))
            )}
          </div>
          {data.recentQuotes.length > 0 && (
            <div className="px-5 py-3 border-t border-white/5">
              <button
                onClick={() => navigate('/dashboard/quotes?new=1')}
                className="w-full py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                + Naya Quotation Banao
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#0d0d14] rounded-2xl border border-white/6 p-5"
      >
        <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
          ⚡ Quick Actions
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              to: '/dashboard/invoices?new=1',
              icon: '🧾',
              label: 'Naya Invoice',
              sub: 'Primary action',
              color: '#f59e0b',
              primary: true,
            },
            {
              to: '/dashboard/quotes?new=1',
              icon: '📋',
              label: 'Naya Quotation',
              sub: 'Client ke liye',
              color: '#6c63ff',
            },
            {
              to: '/dashboard/clients?new=1',
              icon: '👤',
              label: 'Client Jodo',
              sub: 'Naya client',
              color: '#00d4ff',
            },
            {
              to: '/dashboard/leads',
              icon: '🎯',
              label: 'Leads Dekho',
              sub: `${data.newLeads.length} naye`,
              color: '#10b981',
            },
          ].map(({ to, icon, label, sub, color, primary }) => (
            <Link
              key={label}
              to={to}
              className={`flex flex-col gap-1.5 p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                primary ? 'border-[#f59e0b]/40' : 'border-white/6 hover:border-white/12'
              }`}
              style={{
                background: primary
                  ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.1))'
                  : `${color}0d`,
              }}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-semibold" style={{ color }}>{label}</span>
              <span className="text-xs text-white/35">{sub}</span>
            </Link>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
